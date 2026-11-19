# Wedding soundtrack

The supplied recordings are configured in this queue order:

- `alfaaz.mp3` — Alfaaz (3:07)
- `arz-kiya-hai.mp3` — Arz Kiya Hai (5:05)
- `kabira-encore.mp3` — Kabira (Encore) (2:04)

Filenames have been simplified for reliable URLs; the audio is unchanged.

To add another recording, place it here and edit `data/wedding-playlist.ts` to
set its stable ID, title, optional artist, and `src` (for example `/music/alfaaz.mp3`). Optional `cover` is
an image URL; optional `duration` is a display label such as `3:42`.
MP3 is recommended for broad browser support. Array order is playback order;
the queue loops after its last track. An empty array is also supported.

New tracks begin at **0:12**, skipping the intro immediately rather than waiting
12 seconds. Configure this in `weddingMusicSettings.startAtSeconds` inside the
playlist file. Next/previous, playlist selection, reload, and queue loops apply
the same offset. Pause/resume and reselecting the active track preserve position.
Recordings shorter than the offset play from their beginning.

Missing files show a recoverable error without affecting the wedding website.
The player remembers track selection, playback preference, volume, and mute.
It respects browser autoplay restrictions and saved paused/disabled choices.
On a fresh visit it attempts playback automatically. If sound is blocked, the
first click or keyboard activation on the page can start the soundtrack. The
hero's Play/Pause music button and the labeled floating controls always control
the same audio. Explicitly paused or disabled music stays off during navigation.
Some mobile browsers use the device's volume controls for audio volume.

The widget sits above the device safe area. If a fixed bottom navigation is
added later, set `--music-bottom-offset` to its height on a shared ancestor.

## Verification

Install the browser once with `npx playwright install chromium`, then run:

```text
npm run lint
npm run build
npm run test:music
```

The browser suite uses generated test tones served only by Playwright. It checks
native playback, queue progression, seeking, saved preferences, errors, keyboard
controls, navigation, and mobile placement. Autoplay rejection is injected for a
deterministic policy test; the subsequent manual playback uses native audio.

To run the suite against the development server and its Strict Mode lifecycle,
set `MUSIC_TEST_DEV=1` in the environment before running `npm run test:music`.
Real iOS/Safari device playback is not covered by this Chromium suite.
