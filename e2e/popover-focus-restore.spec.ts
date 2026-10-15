import { expect, test } from "@playwright/test";

for (const key of ["Enter", "Space"]) {
  test(`restores trigger focus after opening with ${key} and closing with Escape`, async ({
    page,
  }) => {
    await page.goto("/components/popover");
    const trigger = page.getByRole("button", { name: "Actions", exact: true });
    const dialog = page.getByRole("dialog", { name: "Quick actions" });

    await trigger.focus();
    await expect(trigger).toBeFocused();
    await page.keyboard.press(key);
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const firstAction = dialog.getByRole("button", { name: "Rename" });
    const lastAction = dialog.getByRole("button", { name: "Delete" });
    // Observe CDK's automatic focus capture without moving focus ourselves.
    await expect(firstAction).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(lastAction).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(firstAction).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(lastAction).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(firstAction).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    expect(
      await trigger.evaluate((element) => document.activeElement === element),
    ).toBe(true);
  });
}
