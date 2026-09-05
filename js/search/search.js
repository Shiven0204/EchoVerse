export function searchSongs(songs, query) {
  const normalizedQuery = String(query || "")
    .trim()
    .toLowerCase();

  return songs.filter((song) =>
    [song.title, song.artist, song.album, song.genre]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(normalizedQuery))
  );
}
