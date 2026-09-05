function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function createPlayer(songs, { onPlay, onPause }) {
  const audio = document.getElementById("audio-player");
  const titleElement = document.querySelector(".now-playing-copy strong");
  const artistElement = document.querySelector(".now-playing-copy span");
  const artworkElement = document.querySelector(".player-art");
  const playButton = document.querySelector(".play-button");
  const currentTimeElement = document.querySelector(".time-current");
  const durationElement = document.querySelector(".time-total");
  const progressValue = document.querySelector(".progress-value");
  const progressTrack = document.querySelector(".progress-track");
  const volumeSlider = document.getElementById("volume");
  const volumeIcon = document.querySelector(".volume-icon");
  const previousButton = document.querySelector(
    '.control-buttons .icon-button[aria-label="Previous track"]'
  );
  const nextButton = document.querySelector(
    '.control-buttons .icon-button[aria-label="Next track"]'
  );
  let currentSongIndex = 0;
  let previousVolume = 0.68;
  let isDraggingProgress = false;

  function updateProgress() {
    if (!audio) {
      return;
    }

    const currentTime = audio.currentTime || 0;
    const duration = audio.duration || 0;
    if (currentTimeElement)
      currentTimeElement.textContent = formatTime(currentTime);
    if (durationElement) durationElement.textContent = formatTime(duration);
    if (progressValue && progressTrack) {
      progressValue.style.width = `${
        duration ? (currentTime / duration) * 100 : 0
      }%`;
    }
  }

  function updateVolume() {
    if (!audio || !volumeSlider || !volumeIcon) return;
    const percentage = audio.muted ? 0 : Math.round(audio.volume * 100);
    volumeSlider.value = String(percentage);
    volumeIcon.textContent = audio.muted || percentage === 0 ? "🔇" : "🔊";
    volumeIcon.setAttribute(
      "aria-label",
      audio.muted || percentage === 0 ? "Unmute" : "Mute"
    );
  }

  function updatePlayButton(isPlaying) {
    if (!playButton) return;
    playButton.textContent = isPlaying ? "❚❚" : "▶";
    playButton.setAttribute(
      "aria-label",
      isPlaying ? "Pause track" : "Play track"
    );
  }

  function updateSongInfo(song) {
    if (titleElement) titleElement.textContent = song.title;
    if (artistElement) artistElement.textContent = song.artist;
    if (artworkElement) {
      artworkElement.style.backgroundImage = `url('${song.cover}')`;
      artworkElement.style.backgroundSize = "cover";
      artworkElement.style.backgroundPosition = "center";
      const label = artworkElement.querySelector("span");
      if (label) label.textContent = song.title.slice(0, 2).toUpperCase();
    }
  }

  function reportPlaybackError(error) {
    if (error.name !== "AbortError") console.error("Playback failed:", error);
    updatePlayButton(false);
  }

  function playCurrentSong() {
    if (!audio) return;
    audio
      .play()
      .then(() => updatePlayButton(true))
      .catch(reportPlaybackError);
  }

  function loadSong(index, shouldPlay = false) {
    if (!songs[index]) return;
    currentSongIndex = index;
    audio.pause();
    audio.src = songs[index].source;
    updateSongInfo(songs[index]);
    updateProgress();
    if (shouldPlay)
      audio
        .play()
        .then(() => updatePlayButton(true))
        .catch(reportPlaybackError);
  }

  function isPlaying() {
    return Boolean(audio && !audio.paused);
  }

  function seek(event) {
    if (!audio || !progressTrack || !Number.isFinite(audio.duration)) return;
    const bounds = progressTrack.getBoundingClientRect();
    const position = Math.min(
      Math.max((event.clientX - bounds.left) / bounds.width, 0),
      1
    );
    audio.currentTime = position * audio.duration;
    updateProgress();
  }

  function goToNextSong() {
    loadSong((currentSongIndex + 1) % songs.length, isPlaying());
  }

  function goToPreviousSong() {
    loadSong((currentSongIndex - 1 + songs.length) % songs.length, isPlaying());
  }

  if (audio) {
    audio.volume = previousVolume;
    audio.addEventListener("play", () => {
      updatePlayButton(true);
      onPlay(songs[currentSongIndex]);
    });
    audio.addEventListener("pause", () => {
      updatePlayButton(false);
      onPause();
    });
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("canplay", updateProgress);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", goToNextSong);
  }
  if (playButton) {
    playButton.addEventListener("click", () => {
      if (!audio) return;
      if (audio.paused) playCurrentSong();
      else audio.pause();
    });
  }
  if (previousButton)
    previousButton.addEventListener("click", goToPreviousSong);
  if (nextButton) nextButton.addEventListener("click", goToNextSong);
  if (volumeSlider && audio) {
    volumeSlider.addEventListener("input", (event) => {
      const value = Number(event.target.value) / 100;
      previousVolume = value;
      audio.volume = value;
      audio.muted = value === 0;
      updateVolume();
    });
  }
  if (volumeIcon && audio) {
    volumeIcon.addEventListener("click", () => {
      if (audio.muted) {
        audio.muted = false;
        audio.volume = previousVolume || 0.68;
      } else {
        previousVolume = audio.volume || previousVolume;
        audio.muted = true;
        audio.volume = 0;
      }
      updateVolume();
    });
  }
  if (progressTrack) {
    progressTrack.addEventListener("click", seek);
    progressTrack.addEventListener("pointerdown", (event) => {
      isDraggingProgress = true;
      seek(event);
    });
  }
  window.addEventListener("pointermove", (event) => {
    if (isDraggingProgress) seek(event);
  });
  window.addEventListener("pointerup", () => {
    isDraggingProgress = false;
  });

  updateVolume();
  loadSong(currentSongIndex);

  return {
    loadSong,
    playCurrentSong,
    isPlaying,
    getCurrentSong: () => songs[currentSongIndex],
  };
}
