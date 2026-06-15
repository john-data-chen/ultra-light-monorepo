import { render, fireEvent, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import Button from "./Button.svelte";
import TestWrapper from "./TestWrapper.svelte";

describe("Button", () => {
  it("renders a button by default with children text", () => {
    render(TestWrapper, {
      props: {
        component: Button,
        props: {},
        text: "Click Me"
      }
    });

    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeTruthy();
    expect(button.getAttribute("disabled")).toBeNull();
    expect(button.getAttribute("type")).toBe("button");
  });

  it("renders an anchor element when href is provided", () => {
    render(TestWrapper, {
      props: {
        component: Button,
        props: { href: "/test-link" },
        text: "Link Button"
      }
    });

    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/test-link");
  });

  it("handles the disabled state on button", () => {
    render(TestWrapper, {
      props: {
        component: Button,
        props: { disabled: true },
        text: "Disabled"
      }
    });

    const button = screen.getByRole("button", { name: "Disabled" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("calls onclick handler when clicked", async () => {
    const onclick = vi.fn();
    render(TestWrapper, {
      props: {
        component: Button,
        props: { onclick },
        text: "Click Me"
      }
    });

    const button = screen.getByRole("button", { name: "Click Me" });
    await fireEvent.click(button);
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it("applies variant classes correctly", () => {
    const { container } = render(TestWrapper, {
      props: {
        component: Button,
        props: { variant: "secondary" },
        text: "Secondary"
      }
    });

    const button = container.querySelector("button");
    expect(button).toBeTruthy();
    expect(button?.classList.contains("border-gray-200")).toBe(true);
  });
});
