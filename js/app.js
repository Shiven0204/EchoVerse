import { songs } from "./data/songs.js";
import {
  getLikedSongs,
  saveLikedSongs,
  getRecentlyPlayed,
  saveRecentlyPlayed,
} from "./storage/storage.js";
import { searchSongs } from "./search/search.js";
import { createPlayer } from "./player/player.js";
import { createUI } from "./ui/ui.js";

const MAX_RECENT_SONGS = 5;
const ui = createUI(songs);
let currentView = "all";
let likedSongIds = getValidSongIds(getLikedSongs());
let recentlyPlayedIds = getValidSongIds(getRecentlyPlayed());

function getValidSongIds(songIds) {
  return [...new Set(songIds)].filter((songId) =>
    songs.some((song) => song.id === songId)
  );
}

function getSongById(songId) {
  return songs.find((song) => song.id === songId);
}

function getViewSongs() {
  if (currentView === "liked") {
    return likedSongIds.map(getSongById).filter(Boolean);
  }
  if (currentView === "recent") {
    return recentlyPlayedIds.map(getSongById).filter(Boolean);
  }
  return songs;
}

function getCollectionMessage(view, hasSearchTerm) {
  if (hasSearchTerm) return "No songs found. Try another song or artist.";
  if (view === "liked")
    return "No liked songs yet. Start liking songs to build your collection.";
  if (view === "recent")
    return "No recently played songs. Start listening to build your history.";
  return "No songs found. Try another song or artist.";
}

function renderCurrentView() {
  const query = ui.searchInput ? ui.searchInput.value : "";
  const hasSearchTerm = query.trim().length > 0;
  const visibleSongs = searchSongs(getViewSongs(), query);

  ui.showView(currentView);
  if (currentView === "library") {
    const liked = searchSongs(
      likedSongIds.map(getSongById).filter(Boolean),
      query
    );
    const recent = searchSongs(
      recentlyPlayedIds.map(getSongById).filter(Boolean),
      query
    );
    const all = searchSongs(songs, query);
    ui.renderLibrary(
      {
        liked,
        recent,
        all,
        likedMessage: hasSearchTerm
          ? "No songs found. Try another song or artist."
          : "No liked songs yet. Start liking songs to build your collection.",
        recentMessage: hasSearchTerm
          ? "No songs found. Try another song or artist."
          : "No recently played songs. Start listening to build your history.",
      },
      likedSongIds
    );
  } else {
    ui.renderSongs(
      visibleSongs,
      getCollectionMessage(currentView, hasSearchTerm),
      likedSongIds
    );
  }

  const currentSong = player.getCurrentSong();
  ui.updateActiveSong(currentSong ? currentSong.id : null, player.isPlaying());
}

function toggleLike(songId) {
  if (!getSongById(songId)) return;
  likedSongIds = likedSongIds.includes(songId)
    ? likedSongIds.filter((id) => id !== songId)
    : [...likedSongIds, songId];
  saveLikedSongs(likedSongIds);
  renderCurrentView();
}

function addToRecentlyPlayed(songId) {
  if (!getSongById(songId)) return;
  recentlyPlayedIds = [
    songId,
    ...recentlyPlayedIds.filter((id) => id !== songId),
  ].slice(0, MAX_RECENT_SONGS);
  saveRecentlyPlayed(recentlyPlayedIds);
  renderCurrentView();
}

const player = createPlayer(songs, {
  onPlay: (song) => {
    addToRecentlyPlayed(song.id);
    ui.updateActiveSong(song.id, true);
  },
  onPause: () => {
    const song = player.getCurrentSong();
    ui.updateActiveSong(song ? song.id : null, false);
  },
});

document.addEventListener("click", (event) => {
  const likeButton = event.target.closest(".like-button");
  if (likeButton) {
    event.stopPropagation();
    toggleLike(Number(likeButton.dataset.songId));
    return;
  }

  const trackRow = event.target.closest(".track-row");
  if (trackRow) {
    const song = getSongById(Number(trackRow.dataset.songId));
    if (song) player.loadSong(songs.indexOf(song));
    player.playCurrentSong();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const trackRow = event.target.closest(".track-row");
  if (!trackRow || event.target.closest("button")) return;
  event.preventDefault();
  const song = getSongById(Number(trackRow.dataset.songId));
  if (song) player.loadSong(songs.indexOf(song));
  player.playCurrentSong();
});

const searchForm = document.querySelector(".search-form");
if (ui.searchInput) ui.searchInput.addEventListener("input", renderCurrentView);
if (searchForm)
  searchForm.addEventListener("submit", (event) => event.preventDefault());

const sidebar = document.querySelector("#sidebar");
const openButton = document.querySelector("[data-nav-open]");
const closeButton = document.querySelector("[data-nav-close]");
const navigationLinks = document.querySelectorAll(".nav-link");

function setNavigationState(isOpen) {
  if (!sidebar || !openButton) return;
  sidebar.classList.toggle("is-open", isOpen);
  openButton.setAttribute("aria-expanded", String(isOpen));
}

if (openButton)
  openButton.addEventListener("click", () => setNavigationState(true));
if (closeButton)
  closeButton.addEventListener("click", () => setNavigationState(false));
navigationLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.dataset.view) {
      event.preventDefault();
      currentView = link.dataset.view;
      ui.setActiveNavigation(link);
      renderCurrentView();
    }
    setNavigationState(false);
  });
});

renderCurrentView();
