import { weddingMusicSettings, type WeddingTrack } from "../data/wedding-playlist";

export const MUSIC_STORAGE_KEY = "wedding-music-v1";
type Preference = "auto" | "playing" | "paused" | "disabled";
type Status = "idle" | "loading" | "playing" | "paused" | "blocked" | "error";

export interface MusicSnapshot {
  ready: boolean;
  index: number;
  preference: Preference;
  status: Status;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  hasPlayed: boolean;
  error: string;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Owns one mounted <audio>. Construction is pure and safe during SSR. */
export class WeddingMusicController {
  private audio: HTMLAudioElement | null = null;
  private storage: Storage | null = null;
  private listeners = new Set<() => void>();
  private request = 0;
  private wantsPlayback = false;
  private sourceId: string | null = null;
  private needsInitialSeek = false;
  private loadingTimer: ReturnType<typeof setTimeout> | undefined;
  private snapshot: MusicSnapshot;
  readonly serverSnapshot: MusicSnapshot;

  constructor(readonly tracks: readonly WeddingTrack[], readonly startAtSeconds = weddingMusicSettings.startAtSeconds) {
    this.snapshot = {
      ready: false, index: 0, preference: "auto", status: "idle", volume: .35,
      muted: false, currentTime: 0, duration: 0, hasPlayed: false, error: "",
    };
    this.serverSnapshot = this.snapshot;
  }

  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => this.serverSnapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private update(patch: Partial<MusicSnapshot>) {
    if (Object.entries(patch).every(([key, value]) => this.snapshot[key as keyof MusicSnapshot] === value)) return;
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  private save() {
    const { preference, volume, muted, index } = this.snapshot;
    try {
      this.storage?.setItem(MUSIC_STORAGE_KEY, JSON.stringify({
        preference, volume, muted, trackId: this.tracks[index]?.id,
      }));
    } catch { /* Unavailable storage must never prevent playback. */ }
  }

  private clearLoadingTimer() {
    clearTimeout(this.loadingTimer);
  }

  private waitForPlayback() {
    this.clearLoadingTimer();
    this.loadingTimer = setTimeout(() => {
      if (this.wantsPlayback) this.fail("This track is taking too long to load. Try again or choose another.");
    }, 20000);
  }

  private fail(message: string) {
    this.request++;
    this.wantsPlayback = false;
    this.clearLoadingTimer();
    this.audio?.pause();
    this.update({ status: "error", error: message });
  }

  private applyInitialSeek() {
    const audio = this.audio;
    if (!this.needsInitialSeek || !audio || audio.readyState < 1 || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const requested = Number.isFinite(this.startAtSeconds) ? Math.max(0, this.startAtSeconds) : 0;
    // A short recording should remain playable instead of seeking past its end.
    const start = requested < audio.duration ? requested : 0;
    try {
      audio.currentTime = start;
      this.needsInitialSeek = false;
      this.update({ currentTime: Math.floor(start) });
    } catch { /* Retry once metadata/canplay makes seeking available. */ }
  }

  /** The deferred start is cancelled by Strict Mode's first effect cleanup. */
  attach(audio: HTMLAudioElement, storage: Storage | null) {
    this.audio = audio;
    this.storage = storage;
    try {
      const saved: unknown = JSON.parse(storage?.getItem(MUSIC_STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") {
        const value = saved as Record<string, unknown>;
        const index = this.tracks.findIndex((track) => track.id === value.trackId);
        const preference = ["auto", "playing", "paused", "disabled"].includes(String(value.preference))
          ? value.preference as Preference : "auto";
        this.update({
          index: Math.max(0, index), preference,
          volume: typeof value.volume === "number" && Number.isFinite(value.volume) ? clamp(value.volume) : .35,
          muted: value.muted === true,
          status: preference === "paused" || preference === "disabled" ? "paused" : "idle",
        });
      }
    } catch { /* Malformed or inaccessible preferences use considerate defaults. */ }
    audio.volume = this.snapshot.volume;
    audio.muted = this.snapshot.muted;

    const onPlaying = () => {
      if (!this.wantsPlayback) { audio.pause(); return; }
      if (audio.paused) return;
      this.applyInitialSeek();
      this.clearLoadingTimer();
      this.update({ status: "playing", hasPlayed: true, error: "" });
    };
    const onPlay = () => {
      if (!this.wantsPlayback) { audio.pause(); return; }
      if (!audio.paused && this.snapshot.status !== "playing") this.update({ status: "loading" });
    };
    const onPause = () => {
      // Ignore queued pause events from switching sources, and the pause that
      // precedes ended. Only an actual external pause saves a paused preference.
      if (!audio.paused || audio.ended || this.snapshot.status === "error") return;
      this.clearLoadingTimer();
      if (this.wantsPlayback) {
        this.wantsPlayback = false;
        this.request++;
        this.update({ preference: "paused" });
        this.save();
      }
      if (this.snapshot.status !== "blocked") this.update({ status: "paused" });
    };
    const onEnded = () => {
      if (this.wantsPlayback) this.next();
    };
    const onError = () => {
      if (audio.error) this.fail("This track couldn’t be loaded. Try again or choose another from our soundtrack.");
    };
    const onWaiting = () => {
      if (this.wantsPlayback) {
        this.update({ status: "loading" });
        this.waitForPlayback();
      }
    };
    const onTime = () => {
      this.update({ currentTime: Math.floor(Number.isFinite(audio.currentTime) ? audio.currentTime : 0) });
    };
    const onDuration = () => {
      this.update({ duration: Number.isFinite(audio.duration) ? audio.duration : 0 });
      this.applyInitialSeek();
    };
    const onVolume = () => {
      this.update({ volume: audio.volume, muted: audio.muted });
      this.save();
    };
    const events: [string, EventListener][] = [
      ["play", onPlay], ["playing", onPlaying], ["pause", onPause], ["ended", onEnded],
      ["error", onError], ["waiting", onWaiting], ["timeupdate", onTime],
      ["loadedmetadata", onDuration], ["durationchange", onDuration], ["canplay", onDuration], ["volumechange", onVolume],
    ];
    events.forEach(([name, handler]) => audio.addEventListener(name, handler));
    this.update({ ready: true });
    const start = setTimeout(() => {
      if (this.snapshot.preference === "auto" || this.snapshot.preference === "playing") void this.play(false);
    }, 0);

    return () => {
      clearTimeout(start);
      this.clearLoadingTimer();
      this.request++;
      this.wantsPlayback = false;
      events.forEach(([name, handler]) => audio.removeEventListener(name, handler));
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      this.sourceId = null;
      this.needsInitialSeek = false;
      this.audio = null;
      this.storage = null;
    };
  }

  play = async (manual = true) => {
    const audio = this.audio;
    const track = this.tracks[this.snapshot.index];
    if (!audio || !track) return;
    if (manual) { this.update({ preference: "playing" }); this.save(); }
    if (this.wantsPlayback && !audio.ended && (this.snapshot.status === "playing" || this.snapshot.status === "loading")) return;
    const request = ++this.request;
    this.wantsPlayback = true;
    if (this.sourceId !== track.id || audio.error) {
      audio.pause();
      audio.src = track.src;
      this.sourceId = track.id;
      this.needsInitialSeek = true;
      audio.load();
      this.update({ currentTime: 0, duration: 0 });
    }
    if (audio.ended) this.needsInitialSeek = true;
    this.applyInitialSeek();
    this.update({ status: "loading", error: "" });
    this.waitForPlayback();
    try {
      // Called synchronously from the user gesture, never after an awaited fetch.
      await audio.play();
      if (request !== this.request || this.audio !== audio) return;
      // Actual playing state comes from the native playing event.
    } catch (error) {
      if (request !== this.request || this.audio !== audio) return;
      this.wantsPlayback = false;
      this.clearLoadingTimer();
      const name = error && typeof error === "object" && "name" in error ? error.name : "";
      if (name === "NotAllowedError") {
        this.update({ status: "blocked", error: "Tap play to enjoy our wedding soundtrack." });
      } else if (name === "AbortError") {
        this.update({ status: "paused", error: "" });
      } else {
        this.fail("This track couldn’t be loaded. Try again or choose another from our soundtrack.");
      }
    }
  };

  pause = () => {
    this.request++;
    this.wantsPlayback = false;
    this.clearLoadingTimer();
    this.audio?.pause();
    this.update({ preference: "paused", status: "paused", error: "" });
    this.save();
  };

  disable = () => {
    this.pause();
    this.update({ preference: "disabled" });
    this.save();
  };

  toggle = () => {
    if (this.wantsPlayback) this.pause();
    else void this.play();
  };

  /** Retry only after a real visitor gesture, never after an explicit pause. */
  resumeAutoplay = () => {
    if (this.snapshot.status === "blocked" && (this.snapshot.preference === "auto" || this.snapshot.preference === "playing")) void this.play(false);
  };

  select = (index: number) => {
    if (!Number.isInteger(index) || !this.tracks[index]) return;
    if (index === this.snapshot.index) { void this.play(); return; }
    this.request++;
    this.wantsPlayback = false;
    this.clearLoadingTimer();
    this.audio?.pause();
    this.update({ index, status: "idle", currentTime: 0, duration: 0, error: "" });
    this.save();
    void this.play();
  };

  next = () => {
    if (!this.tracks.length) return;
    if (this.tracks.length === 1 && this.audio?.ended) {
      this.wantsPlayback = false;
      this.update({ status: "paused" });
      this.needsInitialSeek = true;
      this.applyInitialSeek();
    }
    this.select((this.snapshot.index + 1) % this.tracks.length);
  };

  previous = () => {
    if (this.tracks.length) this.select((this.snapshot.index - 1 + this.tracks.length) % this.tracks.length);
  };

  seek = (time: number) => {
    if (!this.audio || !Number.isFinite(time) || !this.snapshot.duration) return;
    this.audio.currentTime = Math.max(0, Math.min(time, this.snapshot.duration));
    this.update({ currentTime: Math.floor(this.audio.currentTime) });
  };

  setVolume = (volume: number) => {
    if (!Number.isFinite(volume)) return;
    const value = clamp(volume);
    if (this.audio) this.audio.volume = value;
    this.update({ volume: value });
    this.save();
  };

  toggleMute = () => {
    const muted = !this.snapshot.muted;
    if (this.audio) this.audio.muted = muted;
    this.update({ muted });
    this.save();
  };
}
