import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "no-preference" });

test("the home gallery reveals its photos and opens a closable photo viewer", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("[data-wedding-ready]")).toHaveAttribute("data-wedding-ready", "true");

  const gallery = page.locator("#gallery");
  await gallery.scrollIntoViewIfNeeded();
  const moments = gallery.locator(".wedding-moment");
  await expect(moments).toHaveCount(23);
  const firstMoment = moments.first();
  await firstMoment.scrollIntoViewIfNeeded();
  await expect(firstMoment).toHaveCSS("opacity", "1");
  await expect(firstMoment.locator("[data-photo-parallax]")).toBeVisible();
  await expect.poll(() => firstMoment.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);

  await firstMoment.getByRole("button", { name: /view photo 1/i }).click();
  const viewer = page.getByRole("dialog", { name: "Wedding photo viewer" });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByRole("img", { name: /Divya and Deepak sharing a family celebration/ })).toBeVisible();
  await viewer.getByRole("button", { name: "Next photo" }).click();
  await expect(viewer.locator(".wedding-photo-viewer-header")).toContainText("02");
  await viewer.getByRole("button", { name: "Previous photo" }).click();
  await expect(viewer.locator(".wedding-photo-viewer-header")).toContainText("01");
  await viewer.getByRole("button", { name: "Close photo viewer" }).click();
  await expect(viewer).not.toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await firstMoment.getByRole("button", { name: /view photo 1/i }).click();
  await expect(viewer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("scroll animations survive deep links, reloads, and responsive reinitialization", async ({ page }) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const hash of ["", "#blessings", "#venue"]) {
    await page.goto(`/${hash}`);
    await expect(page.locator("[data-wedding-ready]")).toHaveAttribute("data-wedding-ready", "true");
    await expect(page.locator("[data-wedding-preloader]")).toHaveCount(0);
    await page.locator(".back-top").scrollIntoViewIfNeeded();
    await page.locator(".back-top").click();
    await expect(page).toHaveURL(/#home$/);
    await page.setViewportSize({ width: 600, height: 760 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await expect(page.locator("[data-wedding-preloader]")).toHaveCount(0);
    await page.locator(".invitation-scene-rsvp").scrollIntoViewIfNeeded();
    await expect(page.locator(".invitation-scene-rsvp")).toBeVisible();
    await expect(page.locator(".invitation-scene-actions")).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-soft-divider]")).toHaveCount(2);
  }
  expect(errors).toEqual([]);
});
