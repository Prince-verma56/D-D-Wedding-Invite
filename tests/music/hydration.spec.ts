import { expect, test } from "@playwright/test";

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  for (const width of [375, 1280]) {
    test.describe(`hydration with ${reducedMotion} at ${width}px`, () => {
      test.use({ reducedMotion, viewport: { width, height: 800 } });
      test("initial load and reload keep the story carousel usable without browser errors", async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error" && /hydration|didn't match|did not match/i.test(message.text())) errors.push(message.text());
        });
        await page.goto("/");
        for (let load = 0; load < 2; load++) {
          if (load) await page.reload();
          await expect(page.locator("[data-wedding-preloader]")).toHaveCount(0);
          const carousel = page.getByRole("region", { name: "Portraits of Divya and Deepak" });
          await page.evaluate(() => document.fonts.ready.then(() => undefined));
          await page.mouse.move(0, 0);
          await carousel.locator(".swiper").scrollIntoViewIfNeeded();
          await expect(carousel).toBeInViewport({ ratio: .5 });
          const playback = carousel.locator(".skiper-story-playback");
          if (reducedMotion === "reduce") await expect(playback).toBeHidden();
          else await expect(playback).toBeVisible();
          await expect.poll(() => carousel.locator(".swiper").evaluate((element) => {
            const swiper = (element as HTMLElement & { swiper: { autoplay: { running: boolean } } }).swiper;
            return swiper.autoplay.running;
          })).toBe(reducedMotion !== "reduce").catch(async (error) => {
            console.log(await carousel.locator(".swiper").evaluate((element) => {
              const swiper = (element as HTMLElement & { swiper: { autoplay: { running: boolean; paused: boolean }; destroyed: boolean } }).swiper;
              return { hidden: document.hidden, motion: matchMedia("(prefers-reduced-motion: reduce)").matches, running: swiper.autoplay.running, paused: swiper.autoplay.paused, destroyed: swiper.destroyed, rect: element.getBoundingClientRect().toJSON() };
            }));
            throw error;
          });
          const selected = carousel.locator(".skiper-story-pagination [aria-current]");
          const before = await selected.getAttribute("aria-label");
          await carousel.getByRole("button", { name: "Next story portrait" }).click();
          await expect(selected).not.toHaveAttribute("aria-label", before!);
          await expect(page.locator("audio")).toHaveCount(1);
          expect(errors).toEqual([]);
        }
      });
    });
  }
}
