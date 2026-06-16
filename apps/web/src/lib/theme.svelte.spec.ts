import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Dynamic loading helper because theme store runs in constructor on import
async function loadThemeModule() {
  vi.resetModules();
  const mod = await import("./theme.svelte");
  return mod.theme;
}

describe("ThemeStore", () => {
  let mockMatchMedia: any;
  let mediaListeners: Array<() => void> = [];

  beforeEach(() => {
    mediaListeners = [];
    vi.stubGlobal("document", {
      cookie: "",
      documentElement: {
        classList: {
          toggle: vi.fn()
        }
      }
    });

    mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn().mockImplementation((event, listener) => {
        if (event === "change") {
          mediaListeners.push(listener);
        }
      }),
      removeEventListener: vi.fn()
    }));
    vi.stubGlobal("window", {
      matchMedia: mockMatchMedia
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.doUnmock("$app/environment");
  });

  it("behaves correctly on the server (non-browser environment)", async () => {
    vi.doMock("$app/environment", () => ({ browser: false }));
    const theme = await loadThemeModule();

    expect(theme.preference).toBe("dark");

    // Setting theme on server shouldn't throw or touch DOM/cookies
    theme.set("light");
    expect(theme.preference).toBe("light");
    expect(document.cookie).toBe("");
    expect(document.documentElement.classList.toggle).not.toHaveBeenCalled();

    theme.cycle();
    expect(theme.preference).toBe("system");
  });

  it("initializes from cookie preference when browser is true", async () => {
    vi.doMock("$app/environment", () => ({ browser: true }));
    document.cookie = "theme=light";

    const theme = await loadThemeModule();
    expect(theme.preference).toBe("light");
  });

  it("falls back to default theme when cookie preference is invalid", async () => {
    vi.doMock("$app/environment", () => ({ browser: true }));
    document.cookie = "theme=invalid-value";

    const theme = await loadThemeModule();
    expect(theme.preference).toBe("dark");
  });

  it("updates cookie and toggles dark class on document when preference changes", async () => {
    vi.doMock("$app/environment", () => ({ browser: true }));
    document.cookie = "";

    const theme = await loadThemeModule();
    expect(theme.preference).toBe("dark");

    theme.set("light");
    expect(theme.preference).toBe("light");
    expect(document.cookie).toContain("theme=light");
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith("dark", false);

    theme.cycle(); // light -> system
    expect(theme.preference).toBe("system");
    expect(document.cookie).toContain("theme=system");
  });

  it("responds to OS media preference changes when set to system", async () => {
    vi.doMock("$app/environment", () => ({ browser: true }));
    document.cookie = "theme=system";

    // Setup window.matchMedia to say OS prefers dark
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: true, // system prefers dark
      media: query,
      addEventListener: vi.fn().mockImplementation((event, listener) => {
        if (event === "change") {
          mediaListeners.push(listener);
        }
      }),
      removeEventListener: vi.fn()
    }));

    const theme = await loadThemeModule();
    expect(theme.preference).toBe("system");

    // Listeners should be registered
    expect(mediaListeners.length).toBeGreaterThan(0);

    // Call the listener to simulate OS color scheme change
    mediaListeners[0]();
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith("dark", true);
  });
});
