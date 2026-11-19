import { expect, test, type Page } from "@playwright/test";
import { weddingMusicSettings, weddingPlaylist } from "../../data/wedding-playlist";

const storageKey = "wedding-music-v1";
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|didn't match|did not match/i.test(message.text())) errors.push(message.text());
  });
});
test.afterEach(async ({ page }) => { expect(browserErrors.get(page)).toEqual([]); });
const [firstTrack, secondTrack, thirdTrack] = weddingPlaylist;
const trackLabel = (index: number) => {
  const track = weddingPlaylist[index];
  return `Play ${track.title}${track.artist ? ` by ${track.artist}` : ""}`;
};

// A locally generated tone exercises the real browser media engine. No music
// is downloaded, bundled, or added to the production playlist for these tests.
function testAudio(seconds = 32) {
  const rate = 8000;
  const samples = rate * seconds;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let index = 0; index < samples; index++) wav.writeInt16LE(Math.round(Math.sin(index * 2 * Math.PI * 220 / rate) * 1000), 44 + index * 2);
  return wav;
}

async function audioFiles(page: Page) {
  const body = testAudio();
  await page.route("**/music/*.mp3", (route) => {
    const range = route.request().headers().range?.match(/bytes=(\d+)-(\d*)/);
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
    return route.fulfill({
      status: range ? 206 : 200,
      contentType: "audio/wav",
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        ...(range ? { "Content-Range": `bytes ${start}-${end}/${body.length}` } : {}),
      },
      body: body.subarray(start, end + 1),
    });
  });
}

async function preference(page: Page, value: Record<string, unknown>) {
  await page.addInitScript(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), { key: storageKey, saved: value });
}

async function openPanel(page: Page) {
  await page.getByRole("button", { name: "Expand music player" }).click();
  await expect(page.getByRole("region", { name: "A soundtrack to remember" })).toBeVisible();
}

async function playing(page: Page) {
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => !audio.paused && audio.readyState >= 3)).toBe(true);
  await expect(page.locator(".music-widget").getByRole("button", { name: "Pause music", exact: true })).toBeVisible();
}

async function blockFirstAutoplay(page: Page) {
  // Inject a deterministic policy rejection, then use the real media engine.
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let first = true;
    HTMLMediaElement.prototype.play = function () {
      if (first && this instanceof HTMLAudioElement) { first = false; return Promise.reject(new DOMException("Autoplay blocked", "NotAllowedError")); }
      return play.call(this);
    };
  });
}

test("first visit autoplays at a considerate volume with one audio element", async ({ page }, testInfo) => {
  await audioFiles(page);
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      this.dataset.playCalls = String(Number(this.dataset.playCalls || 0) + 1);
      return play.call(this);
    };
  });
  await page.goto("/");
  await playing(page);
  await expect(page.locator("audio")).toHaveCount(1);
  await expect(page.locator("audio")).toHaveAttribute("data-play-calls", "1");
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThanOrEqual(weddingMusicSettings.startAtSeconds);
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.volume)).toBe(.35);
  await expect(page.locator("#wedding-music-panel")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("desktop-compact.png") });
  await openPanel(page);
  await page.screenshot({ path: testInfo.outputPath("desktop-panel.png") });
});

test("an autoplay policy rejection offers manual start without a false playing state", async ({ page }, testInfo) => {
  await audioFiles(page);
  await blockFirstAutoplay(page);
  await page.goto("/");
  await expect(page.getByText("Tap to play music", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("music-invitation.png") });
  await expect(page.locator(".music-widget").getByRole("button", { name: "Pause music" })).toHaveCount(0);
  await page.getByRole("button", { name: "Play music", exact: true }).click();
  await playing(page);
  // A saved request to play still cannot override a new policy rejection.
  await page.reload();
  await expect(page.getByText("Tap to play music", { exact: true })).toBeVisible();
});

test("pause, resume, mute, volume, progress, and persistence use the native audio", async ({ page }) => {
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  await openPanel(page);
  const panel = page.locator("#wedding-music-panel");
  await panel.getByRole("button", { name: "Pause music", exact: true }).click();
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.paused)).toBe(true);
  await panel.getByRole("slider", { name: "Playback position" }).fill("3");
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => Math.floor(audio.currentTime))).toBe(3);
  await panel.getByRole("slider", { name: "Music volume" }).fill("0.18");
  await panel.getByRole("button", { name: "Mute music", exact: true }).click();
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.muted)).toBe(true);
  await panel.getByRole("button", { name: "Unmute music", exact: true }).click();
  await panel.getByRole("button", { name: "Play music", exact: true }).click();
  await playing(page);
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).volume, storageKey)).toBe(.18);
  await page.reload();
  await playing(page);
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.volume)).toBe(.18);
});

test("previous, next, queue selection, and natural ending follow queue order", async ({ page }) => {
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  await openPanel(page);
  const panel = page.locator("#wedding-music-panel");
  await panel.getByRole("button", { name: "Next track", exact: true }).click();
  await expect(panel.getByRole("button", { name: trackLabel(1), exact: true })).toHaveAttribute("aria-current", "true");
  await playing(page);
  await panel.getByRole("button", { name: "Previous track", exact: true }).click();
  await playing(page);
  await panel.getByRole("button", { name: trackLabel(1), exact: true }).click();
  await playing(page);
  // End naturally through the native media engine rather than dispatching ended.
  await page.locator("audio").evaluate((audio: HTMLAudioElement) => { audio.currentTime = audio.duration - .15; });
  await expect(panel.getByRole("button", { name: trackLabel(2), exact: true })).toHaveAttribute("aria-current", "true");
  await playing(page);
  await expect(page.locator("audio")).toHaveAttribute("src", thirdTrack.src);
  await page.locator("audio").evaluate((audio: HTMLAudioElement) => { audio.currentTime = audio.duration - .15; });
  await expect(panel.getByRole("button", { name: trackLabel(0), exact: true })).toHaveAttribute("aria-current", "true");
  await playing(page);
});

test("selecting the active track preserves position and repeated switches keep one audio", async ({ page }) => {
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  await openPanel(page);
  await page.locator("audio").evaluate((audio: HTMLAudioElement) => { audio.currentTime = 3; });
  const panel = page.locator("#wedding-music-panel");
  await panel.getByRole("button", { name: trackLabel(0), exact: true }).click();
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThanOrEqual(3);
  for (let index = 0; index < 6; index++) await panel.getByRole("button", { name: "Next track", exact: true }).click();
  await playing(page);
  await expect(page.locator("audio")).toHaveCount(1);
  await expect(panel.locator(".music-feedback")).toHaveCount(0);
});

test("reload remembers the selected track and a paused preference makes no audio request", async ({ page }) => {
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  await openPanel(page);
  const panel = page.locator("#wedding-music-panel");
  await panel.getByRole("button", { name: trackLabel(1), exact: true }).click();
  await playing(page);
  await panel.getByRole("button", { name: "Pause music", exact: true }).click();
  let audioRequests = 0;
  page.on("request", (request) => { if (request.url().includes("/music/") && request.url().endsWith(".mp3")) audioRequests++; });
  await page.reload();
  await expect(page.locator(".music-widget-title")).toContainText(secondTrack.title);
  await expect(page.locator("audio")).not.toHaveAttribute("src");
  expect(audioRequests).toBe(0);
  await page.locator(".desktop-nav").getByRole("link", { name: "Our Story" }).click();
  await expect(page.locator("audio")).not.toHaveAttribute("src");
  await page.getByRole("button", { name: "Play music", exact: true }).click();
  await playing(page);
  await expect(page.locator("audio")).toHaveAttribute("src", secondTrack.src);
});

test("a disabled preference survives reload and needs explicit re-enabling", async ({ page }) => {
  await audioFiles(page);
  await preference(page, { preference: "disabled", trackId: secondTrack.id, volume: .12, muted: true });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Enable wedding music" })).toBeVisible();
  await expect(page.locator("audio")).not.toHaveAttribute("src");
  await page.locator(".desktop-nav").getByRole("link", { name: "Our Story" }).click();
  await expect(page.locator("audio")).not.toHaveAttribute("src");
  await page.reload();
  await page.getByRole("button", { name: "Enable wedding music" }).click();
  await playing(page);
  await expect(page.locator("#wedding-music-panel")).toHaveCount(0);
  await openPanel(page);
  await page.getByRole("button", { name: "Turn music off" }).click();
  await expect(page.getByRole("button", { name: "Enable wedding music" })).toBeFocused();
  await expect(page.locator("audio")).toHaveJSProperty("paused", true);
  await page.reload();
  await expect(page.getByRole("button", { name: "Enable wedding music" })).toBeVisible();
});

test("a missing track reports an error and another selection recovers", async ({ page }) => {
  await audioFiles(page);
  await page.route(`**${firstTrack.src}`, (route) => route.fulfill({ status: 404, body: "Not found" }));
  await page.goto("/");
  await expect(page.getByText("Music unavailable", { exact: true })).toBeVisible();
  await openPanel(page);
  await expect(page.locator(".music-feedback")).toContainText("couldn’t be loaded");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await page.getByRole("button", { name: trackLabel(1), exact: true }).click();
  await playing(page);
  await expect(page.locator(".music-feedback")).toHaveCount(0);
  await expect(page.locator("main")).toBeVisible();
});

test("Escape restores focus and closing the panel leaves playback running", async ({ page }) => {
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  await openPanel(page);
  await expect(page.getByRole("button", { name: "Close music panel" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#wedding-music-panel")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Expand music player" })).toBeFocused();
  await playing(page);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Close music panel" })).toBeFocused();
  await page.getByRole("button", { name: "Close music panel" }).click();
  await playing(page);
});

test("section navigation, scrolling, and browser back do not reload the audio", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  await page.locator("audio").evaluate((audio: HTMLAudioElement) => {
    audio.dataset.instance = "original";
    audio.dataset.loads = "0";
    audio.addEventListener("loadstart", () => { audio.dataset.loads = String(Number(audio.dataset.loads) + 1); });
  });
  await page.locator(".desktop-nav").getByRole("link", { name: "Our Story" }).click();
  await expect(page).toHaveURL(/#our-story/);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.goBack();
  await expect(page.locator("audio")).toHaveAttribute("data-instance", "original");
  await expect(page.locator("audio")).toHaveAttribute("data-loads", "0");
  await playing(page);
});

test("mobile and short viewports fit the panel and allow independent queue scrolling", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  await openPanel(page);
  const panel = page.locator("#wedding-music-panel");
  const rect = await panel.boundingBox();
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(375);
  expect(rect!.y).toBeGreaterThanOrEqual(67);
  const widget = await page.locator(".music-widget").boundingBox();
  expect(widget!.y + widget!.height).toBeLessThanOrEqual(667 - 12);
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 375);
  await expect(page.locator(".music-visualizer i").first()).toHaveCSS("animation-name", "none");
  await page.screenshot({ path: testInfo.outputPath("mobile-panel.png") });
  await page.setViewportSize({ width: 320, height: 480 });
  await panel.getByRole("button", { name: "Turn music off" }).click();
  await expect(page.getByRole("button", { name: "Enable wedding music" })).toBeVisible();
});

test("unavailable localStorage cannot break playback", async ({ page }) => {
  await audioFiles(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Unavailable", "SecurityError"); } });
  });
  await page.goto("/");
  await playing(page);
  await page.locator(".music-widget").getByRole("button", { name: "Pause music", exact: true }).click();
  await page.getByRole("button", { name: "Play music", exact: true }).click();
  await playing(page);
});

test("corrupt preferences and removed track IDs fall back safely", async ({ page }) => {
  await audioFiles(page);
  await preference(page, { preference: "invalid", trackId: "removed", volume: "loud", muted: "yes" });
  await page.goto("/");
  await playing(page);
  await expect(page.locator("audio")).toHaveAttribute("src", firstTrack.src);
  await expect(page.locator("audio")).toHaveJSProperty("volume", .35);
  await expect(page.locator("audio")).toHaveJSProperty("muted", false);
});

test("a slow request can be cancelled and a late load never overrides pause", async ({ page }) => {
  await audioFiles(page);
  let release = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route(`**${firstTrack.src}`, async (route) => {
    await gate;
    await route.fulfill({ contentType: "audio/wav", body: testAudio() });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Cancel music loading" }).click();
  release();
  await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.readyState)).toBeGreaterThan(0);
  await expect(page.locator("audio")).toHaveJSProperty("paused", true);
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).preference, storageKey)).toBe("paused");
  await expect(page.getByRole("button", { name: "Play music", exact: true })).toBeVisible();
});

test("the mobile widget moves clear of hero and RSVP actions", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  const overlaps = (selector: string) => page.evaluate((selector) => {
    const widget = document.querySelector(".music-widget")!.getBoundingClientRect();
    const action = document.querySelector(selector)!.getBoundingClientRect();
    return widget.left < action.right && widget.right > action.left && widget.top < action.bottom && widget.bottom > action.top;
  }, selector);
  await expect.poll(() => overlaps(".cinematic-hero-storyButton")).toBe(false);
  await expect.poll(() => overlaps(".cinematic-hero-introButton")).toBe(false);
  await page.locator(".invitation-scene-rsvp").evaluate((button) => button.scrollIntoView({ block: "end" }));
  await expect.poll(() => overlaps(".invitation-scene-rsvp")).toBe(false);
  await playing(page);
});

test("all supplied MP3s support native playback and byte-range requests", async ({ page, request }) => {
  await page.goto("/");
  await playing(page);
  await openPanel(page);
  for (const [index, track] of weddingPlaylist.entries()) {
    const response = await request.get(track.src, { headers: { Range: "bytes=0-1023" } });
    expect(response.status()).toBe(206);
    expect(response.headers()["content-type"]).toContain("audio/");
    expect((await response.body()).length).toBe(1024);
    await response.dispose();
    await page.getByRole("button", { name: trackLabel(index), exact: true }).click();
    await playing(page);
    await expect(page.locator("audio")).toHaveAttribute("src", track.src);
    const [minutes, seconds] = track.duration!.split(":").map(Number);
    await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => Math.floor(audio.duration))).toBe(minutes * 60 + seconds);
    await expect.poll(() => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeGreaterThanOrEqual(weddingMusicSettings.startAtSeconds);
  }
});

test("fresh tracks and queue loops start at twelve seconds while resume preserves a seek", async ({ page }) => {
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  const time = () => page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime);
  await expect.poll(time).toBeGreaterThanOrEqual(12);
  await openPanel(page);
  const panel = page.locator("#wedding-music-panel");
  for (const index of [1, 2]) {
    await panel.getByRole("button", { name: trackLabel(index), exact: true }).click();
    await playing(page);
    await expect.poll(time).toBeGreaterThanOrEqual(12);
    expect(await time()).toBeLessThan(14);
  }
  await page.locator("audio").evaluate((audio: HTMLAudioElement) => { audio.currentTime = audio.duration - .1; });
  await expect(page.locator("audio")).toHaveAttribute("src", firstTrack.src);
  await playing(page);
  await expect.poll(time).toBeGreaterThanOrEqual(12);
  await panel.getByRole("button", { name: "Pause music", exact: true }).click();
  await panel.getByRole("slider", { name: "Playback position" }).fill("19");
  await panel.getByRole("button", { name: "Play music", exact: true }).click();
  await playing(page);
  await expect.poll(time).toBeGreaterThanOrEqual(19);
  await panel.getByRole("button", { name: trackLabel(0), exact: true }).click();
  await expect.poll(time).toBeGreaterThanOrEqual(19);
});

test("recordings shorter than the intro skip remain playable", async ({ page }) => {
  await page.route("**/music/*.mp3", (route) => route.fulfill({ contentType: "audio/wav", body: testAudio(8) }));
  await page.goto("/");
  await playing(page);
  expect(await page.locator("audio").evaluate((audio: HTMLAudioElement) => audio.currentTime)).toBeLessThan(8);
  await expect(page.locator(".music-widget-label")).toContainText("Playing");
});

test("RSVP invitation stays usable on desktop and mobile without interrupting music", async ({ page }, testInfo) => {
  await audioFiles(page);
  await page.goto("/");
  await playing(page);
  const rsvp = page.locator(".nav-rsvp");
  await rsvp.click();
  const dialog = page.getByRole("dialog", { name: "A seat at our celebration" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".dialog-panel")).toHaveCSS("opacity", "1");
  await expect(dialog.locator(".invitation-dialog-names")).toContainText("Divya");
  await expect(page.locator("audio")).toHaveJSProperty("paused", false);
  await page.screenshot({ path: testInfo.outputPath("invitation-desktop.png") });
  await dialog.getByLabel("Your name").fill("Wedding guest");
  await dialog.getByRole("button", { name: "Save my response" }).click();
  await expect(dialog.getByText("Your response is saved", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(rsvp).toBeFocused();
  await page.setViewportSize({ width: 375, height: 667 });
  await rsvp.click();
  await expect(dialog.getByLabel("Your name")).toHaveValue("Wedding guest");
  await expect(dialog.locator(".dialog-panel")).toHaveCSS("opacity", "1");
  const panel = dialog.locator(".invitation-dialog-panel");
  const box = await panel.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  expect(box!.y + box!.height).toBeLessThanOrEqual(655);
  await page.screenshot({ path: testInfo.outputPath("invitation-mobile.png") });
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(dialog).toHaveCount(0);
  await playing(page);
});

test("hero and floating play/pause buttons control the same soundtrack", async ({ page }) => {
  await audioFiles(page);
  await preference(page, { preference: "paused", trackId: firstTrack.id });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Watch Intro" })).toHaveCount(0);
  const widget = page.locator(".music-widget");
  await expect(widget.getByRole("button", { name: "Play music", exact: true })).toHaveText("Play");
  await page.getByRole("button", { name: "Play background music", exact: true }).click();
  await playing(page);
  await expect(widget.getByRole("button", { name: "Pause music", exact: true })).toHaveText("Pause");
  await page.getByRole("button", { name: "Pause background music", exact: true }).click();
  await expect(page.locator("audio")).toHaveJSProperty("paused", true);
  await widget.getByRole("button", { name: "Play music", exact: true }).click();
  await playing(page);
  await expect(page.getByRole("button", { name: "Pause background music", exact: true })).toBeVisible();
  await expect(page.locator("audio")).toHaveCount(1);
});

test("blocked first-load autoplay starts on the first genuine site interaction", async ({ page }) => {
  await audioFiles(page);
  await blockFirstAutoplay(page);
  await page.goto("/");
  await expect(page.getByText("Tap to play music", { exact: true })).toBeVisible();
  await page.locator(".desktop-nav").getByRole("link", { name: "Our Story" }).click();
  await playing(page);
  await expect(page.locator("audio")).toHaveCount(1);
  await expect(page.locator("#wedding-music-panel")).toHaveCount(0);
});
