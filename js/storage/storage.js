const STORAGE_KEYS = Object.freeze({
  likedSongs: "echoverse-liked-songs",
  recentlyPlayed: "echoverse-recently-played",
});

function readIds(storageKey) {
  try {
    const storedValue = localStorage.getItem(storageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return [...new Set(parsedValue)].map(Number).filter(Number.isFinite);
  } catch (error) {
    return [];
  }
}

function saveIds(storageKey, songIds) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(songIds));
  } catch (error) {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function getLikedSongs() {
  return readIds(STORAGE_KEYS.likedSongs);
}

export function saveLikedSongs(songIds) {
  saveIds(STORAGE_KEYS.likedSongs, songIds);
}

export function getRecentlyPlayed() {
  return readIds(STORAGE_KEYS.recentlyPlayed);
}

export function saveRecentlyPlayed(songIds) {
  saveIds(STORAGE_KEYS.recentlyPlayed, songIds);
}
