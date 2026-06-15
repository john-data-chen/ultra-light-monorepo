import { expect, test } from "@playwright/test";

test("admin overview layout and interaction on mobile vs desktop", async ({ page, isMobile }) => {
  // 1. Sign in (default email is john@example.com, who is an admin).
  await page.goto("/login");
  const signIn = page.locator('form:has(input[name="email"]) button[type="submit"]');
  await expect(async () => {
    await signIn.click();
    await page.waitForURL("/", { timeout: 10000 });
  }).toPass({ timeout: 20_000 });
  await page.waitForLoadState("networkidle");

  // 2. Go to /admin
  await page.goto("/admin");
  await expect(page.locator("h1")).toHaveText(/Admin Overview|管理總覽/);

  if (isMobile) {
    // Mobile Viewport Checks
    const userSelect = page.locator('select[aria-label="Sort field"]').first();
    const userDirBtn = page.locator('button[aria-label="Sort direction"]').first();
    const userCards = page.locator("ul").first().locator("li");
    const userTable = page.locator("table").first();

    await expect(userSelect).toBeVisible();
    await expect(userCards.first()).toBeVisible();
    await expect(userTable).not.toBeVisible();

    // Verify sort by total income (desc by default)
    // We select "income" option from sort field.
    await expect(async () => {
      await userSelect.selectOption({ value: "income" });
      await userSelect.evaluate((node) =>
        node.dispatchEvent(new Event("change", { bubbles: true }))
      );
      await expect(page).toHaveURL(/.*u\.sort=income&u\.dir=desc/, { timeout: 3000 });
    }).toPass({ timeout: 15_000 });

    // Click dir button to toggle direction to asc
    await expect(async () => {
      await userDirBtn.click();
      await expect(page).toHaveURL(/.*u\.sort=income&u\.dir=asc/, { timeout: 5000 });
    }).toPass({ timeout: 15_000 });
  } else {
    // Desktop Viewport Checks
    const userTable = page.locator("table").first();
    const userSelect = page.locator('select[aria-label="Sort field"]').first();

    await expect(userTable).toBeVisible();
    await expect(userSelect).not.toBeVisible();

    // Click Total Income header button to sort
    const incomeHeaderBtn = page.locator("th").nth(3).locator("button");
    await expect(async () => {
      await incomeHeaderBtn.click();
      await expect(page).toHaveURL(/.*u\.sort=income&u\.dir=desc/, { timeout: 3000 });
    }).toPass({ timeout: 15_000 });
  }
});
