export interface WeddingTrack {
  id: string;
  title: string;
  artist?: string;
  src: string;
  cover?: string;
  duration?: string;
}

// Skip the opening twelve seconds whenever a track starts fresh. Pausing and
// resuming, or selecting an already playing track, preserves its position.
export const weddingMusicSettings = { startAtSeconds: 12 };

// Audio is served from public/music. Keep IDs stable when updating metadata.
// Queue order follows this array; the last track returns to the first.
export const weddingPlaylist: WeddingTrack[] = [
  {
    id: "track-01",
    title: "Alfaaz",
    artist: "Zain Zohaib & Hamza Malik",
    src: "/music/alfaaz.mp3",
    duration: "3:07",
  },
  {
    id: "track-02",
    title: "Arz Kiya Hai",
    artist: "Anuv Jain & Lost Stories",
    src: "/music/arz-kiya-hai.mp3",
    duration: "5:05",
  },
  {
    id: "track-03",
    title: "Kabira (Encore)",
    src: "/music/kabira-encore.mp3",
    duration: "2:04",
  },
];
