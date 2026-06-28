import { expect, test } from "@playwright/test";

test("creates a memo and filters it by tag", async ({ page }) => {
  const tag = `e2e${Date.now()}`;
  const content = `Playwright memo #${tag}`;

  await page.goto("/");
  const composer = page.getByRole("textbox", { name: /new note|新笔记/i });
  await expect(composer).toBeVisible();

  await composer.fill(content);
  await page.getByRole("button", { name: /save|保存/i }).click();

  await expect(page.getByText(content)).toBeVisible();
  await expect(page.getByText(`#${tag}`, { exact: true })).toBeVisible();

  await page.getByRole("textbox", { name: /search|搜索/i }).fill(tag);
  await expect(page.getByText(content)).toBeVisible();
});
