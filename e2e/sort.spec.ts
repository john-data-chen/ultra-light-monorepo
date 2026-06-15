import { expect, test } from "@playwright/test";

test("sorting interaction updates URL and reflects in UI", async ({ page, isMobile }) => {
  // 1. Sign in (email is pre-filled with john@example.com).
  await page.goto("/login");
  const signIn = page.locator('form:has(input[name="email"]) button[type="submit"]');
  await expect(async () => {
    await signIn.click();
    await page.waitForURL("/", { timeout: 10000 });
  }).toPass({ timeout: 20_000 });
  await page.waitForLoadState("networkidle");

  // 2. Go to /transactions
  await page.goto("/transactions");

  if (isMobile) {
    const sortSelect = page.locator('select[aria-label="Sort field"]');
    const sortDirBtn = page.locator('button[aria-label="Sort direction"]');
    await expect(sortSelect).toBeVisible();

    // 3. Sort by Amount (desc)
    await expect(async () => {
      await sortSelect.selectOption({ value: "amount" });
      await sortSelect.evaluate((node) =>
        node.dispatchEvent(new Event("change", { bubbles: true }))
      );
      await expect(page).toHaveURL(/.*t\.sort=amount&t\.dir=desc/, { timeout: 3000 });
    }).toPass({ timeout: 15_000 });

    // 4. Click dir button to sort ascending
    await expect(async () => {
      await sortDirBtn.click();
      await expect(page).toHaveURL(/.*t\.sort=amount&t\.dir=asc/, { timeout: 5000 });
    }).toPass({ timeout: 15_000 });
  } else {
    // The table is visible on desktop.
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // 3. Find the column header button for Amount. Since it's translated, we find the <th> that has a button.
    // In transactions page, columns are Date, Category, Type, Amount, Note, Actions.
    // Date is default sorted (desc).
    const amountHeaderButton = page.locator("th").nth(3).locator("button");

    const firstRowAmount = page.locator("tbody tr").first().locator("td").nth(3);
    const initialAmount = await firstRowAmount.innerText();

    // 4. Click it to sort by Amount (desc). The URL should update.
    await expect(async () => {
      await amountHeaderButton.click();
      await expect(page).toHaveURL(/.*t\.sort=amount&t\.dir=desc/, { timeout: 3000 });
    }).toPass({ timeout: 15_000 });

    await expect(firstRowAmount).not.toHaveText(initialAmount);

    // 5. Click again to sort ascending.
    await expect(async () => {
      await amountHeaderButton.click();
      await expect(page).toHaveURL(/.*t\.sort=amount&t\.dir=asc/, { timeout: 3000 });
    }).toPass({ timeout: 15_000 });

    // 6. Click again to remove sorting.
    await expect(async () => {
      await amountHeaderButton.click();
      await expect(page).not.toHaveURL(/.*t\.sort=amount/, { timeout: 3000 });
    }).toPass({ timeout: 15_000 });
  }
});
