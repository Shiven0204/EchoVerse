function getSongInitials(song) {
  return song.title
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function createUI(songs) {
  const mainSongSection = document.querySelector(".popular-section");
  const libraryOverview = document.querySelector(".library-overview");
  const trackList = document.querySelector(".track-list");
  const libraryLikedList = document.querySelector(".library-liked-list");
  const libraryRecentList = document.querySelector(".library-recent-list");
  const libraryAllList = document.querySelector(".library-all-list");
  const searchInput = document.querySelector("#song-search");
  const navigationLinks = document.querySelectorAll(".nav-link");

  function createTrackRow(song, songIndex, likedSongIds) {
    const trackRow = document.createElement("article");
    const trackNumber = document.createElement("span");
    const miniArt = document.createElement("div");
    const artworkLabel = document.createElement("span");
    const trackInfo = document.createElement("div");
    const title = document.createElement("h3");
    const artist = document.createElement("p");
    const trackMeta = document.createElement("span");
    const likeButton = document.createElement("button");
    const playButton = document.createElement("button");
    const isLiked = likedSongIds.includes(song.id);

    trackRow.className = "track-row";
    trackRow.dataset.songId = String(song.id);
    trackRow.tabIndex = 0;
    trackNumber.className = "track-number";
    trackNumber.textContent = String(songIndex + 1).padStart(2, "0");
    miniArt.className = "mini-art";
    miniArt.style.backgroundImage = `url('${song.cover}')`;
    miniArt.style.backgroundSize = "cover";
    miniArt.style.backgroundPosition = "center";
    artworkLabel.textContent = getSongInitials(song);
    miniArt.append(artworkLabel);
    trackInfo.className = "track-info";
    title.textContent = song.title;
    artist.textContent = song.artist;
    trackInfo.append(title, artist);
    trackMeta.className = "track-meta";
    trackMeta.textContent = "--:--";
    likeButton.className = "icon-button like-button";
    likeButton.type = "button";
    likeButton.dataset.songId = String(song.id);
    likeButton.setAttribute("aria-pressed", String(isLiked));
    likeButton.setAttribute(
      "aria-label",
      isLiked ? `Unlike ${song.title}` : `Like ${song.title}`
    );
    likeButton.textContent = isLiked ? "♥" : "♡";
    likeButton.classList.toggle("is-liked", isLiked);
    playButton.className = "icon-button track-play";
    playButton.type = "button";
    playButton.setAttribute("aria-label", `Play ${song.title}`);
    playButton.textContent = "▶";
    trackRow.append(
      trackNumber,
      miniArt,
      trackInfo,
      trackMeta,
      likeButton,
      playButton
    );
    return trackRow;
  }

  function renderCollection(container, collection, emptyMessage, likedSongIds) {
    if (!container) return;
    container.replaceChildren();
    if (collection.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = emptyMessage;
      container.append(emptyState);
      return;
    }
    collection.forEach((song) =>
      container.append(createTrackRow(song, songs.indexOf(song), likedSongIds))
    );
  }

  function renderSongs(collection, emptyMessage, likedSongIds) {
    renderCollection(trackList, collection, emptyMessage, likedSongIds);
  }

  function renderLibrary(collections, likedSongIds) {
    renderCollection(
      libraryLikedList,
      collections.liked,
      collections.likedMessage,
      likedSongIds
    );
    renderCollection(
      libraryRecentList,
      collections.recent,
      collections.recentMessage,
      likedSongIds
    );
    renderCollection(
      libraryAllList,
      collections.all,
      "No songs found.",
      likedSongIds
    );
  }

  function updateActiveSong(currentSongId, isPlaying) {
    document.querySelectorAll(".track-row").forEach((row) => {
      const active = Number(row.dataset.songId) === currentSongId && isPlaying;
      row.classList.toggle("active-song", active);
      row.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function showView(view) {
    const isLibrary = view === "library";
    if (mainSongSection) mainSongSection.hidden = isLibrary;
    if (libraryOverview) libraryOverview.hidden = !isLibrary;
  }

  function setActiveNavigation(activeLink) {
    navigationLinks.forEach((link) =>
      link.classList.toggle("is-active", link === activeLink)
    );
  }

  return {
    get searchInput() {
      return searchInput;
    },
    renderSongs,
    renderLibrary,
    updateActiveSong,
    showView,
    setActiveNavigation,
  };
}
