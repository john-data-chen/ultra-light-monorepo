import { expect, test } from "@playwright/test";

// Happy path: sign in as the built-in John account, add an expense, then delete it.
// The row is tagged with a unique note so the test deletes exactly what it created
// and never touches the seeded demo data.
//
// Cross-browser notes:
// - Selectors are locale-agnostic. The UI renders in the zh-tw base locale, so we never match
//   on translated button text; we scope to the owning form / use stable input names and the
//   category option *value* (the canonical English key).
// - In WebKit, a click issued before Svelte finishes hydrating can be swallowed (a native
//   submit is lost). Rather than guess a hydration delay, we wrap each submit in `toPass`:
//   the action is retried until the expected navigation actually commits. `waitForURL` (not a
//   bare URL assertion) ensures the previous navigation is fully settled before the next step.
test("John signs in, adds an expense, then deletes it", async ({ page, isMobile }) => {
  // 1. Sign in (email is pre-filled with john@example.com). The login form submits natively so
  // the session cookie is set on a top-level navigation (WebKit does not persist it from an
  // enhance fetch response). Retry the click until "/" is reached.
  await page.goto("/login");
  const signIn = page.locator('form:has(input[name="email"]) button[type="submit"]');
  await expect(async () => {
    await signIn.click();
    await page.waitForURL("/", { timeout: 10000 });
  }).toPass({ timeout: 20_000 });
  await page.waitForLoadState("networkidle");

  // 2. Add a new expense tagged with a unique note. The random suffix guarantees uniqueness
  // even across fast repeated runs (Date.now() alone can collide within the same millisecond).
  const note = `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await expect(async () => {
    await page.goto("/transactions/new");
    await expect(page).toHaveURL(/\/transactions\/new/);
  }).toPass({ timeout: 15_000 });
  const addTransaction = page.locator('form:has(input[name="amount"]) button[type="submit"]');
  // Re-fill inside the retry so a hydration reset of the inputs can't leave a stale value.
  await expect(async () => {
    await page.locator('select[name="category"]').selectOption("Food");
    await page.locator('input[name="amount"]').fill("999");
    await page.locator('input[name="note"]').fill(note);
    await addTransaction.click();
    await page.waitForURL("/transactions", { timeout: 3000 });
  }).toPass({ timeout: 20_000 });

  // 3. The new row is listed.
  const row = isMobile
    ? page.locator("li").filter({ hasText: note })
    : page.locator("tr").filter({ hasText: note });
  await expect(row).toBeVisible();

  // Neutralize entry/exit animations. The bits-ui AlertDialog Content is position:fixed with
  // a zoom/fade `animation-fill-mode: both` enter animation; its lingering transform makes a
  // transformed containing block, so chromium computes the (visually centered) confirm button
  // as "outside the viewport" and the click never lands. Zeroing animation/transition durations
  // pins the dialog at its true fixed center so the button is reliably clickable.
  await page.addStyleTag({
    content: `*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; }`
  });

  // renders a logout form on authed pages, so a bare submit selector would be ambiguous).
  await row.locator('form[action="?/delete"] button[type="submit"]').click();
  // ConfirmDialog renders shadcn-svelte's AlertDialog (bits-ui) — a portal with
  // role="alertdialog", not a native <dialog> element.
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  const diag = await dialog
    .getByRole("button")
    .nth(1)
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      const transforms: string[] = [];
      let anc: HTMLElement | null = el.parentElement;
      while (anc) {
        const s = getComputedStyle(anc);
        if (s.transform !== "none" || s.filter !== "none" || s.perspective !== "none") {
          transforms.push(`${anc.tagName}.${anc.className} t=${s.transform} f=${s.filter}`);
        }
        anc = anc.parentElement;
      }
      return {
        r: { x: r.x, y: r.y, w: r.width, h: r.height },
        vw: window.innerWidth,
        vh: window.innerHeight,
        sx: window.scrollX,
        sy: window.scrollY,
        transforms
      };
    });
  console.log("DIAG", JSON.stringify(diag));
  // The footer is Cancel then Action, so the confirm button is the second one (locale-agnostic).
  await dialog.getByRole("button").nth(1).click();

  const rowAfterDelete = isMobile
    ? page.locator("li", { hasText: note })
    : page.locator("tr", { hasText: note });
  await expect(rowAfterDelete).toHaveCount(0);
});
