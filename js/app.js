// Simple local song data.
// We use the actual MP3 files from the music folder.
const songs = [
  {
    title: "Barsaat",
    artist: "Banjaare & Roni",
    source: "music/Banjaare & Roni - Barsaat - (320 Kbps).mp3",
    cover: "assets/images/default-album.jpg",
  },
  {
    title: "Bairan",
    artist: "Banjaare",
    source: "music/Banjaare - Bairan - (320 Kbps).mp3",
    cover: "assets/images/default-album.jpg",
  },
  {
    title: "Tu Zaroori",
    artist: "Sharib Toshi, Sunidhi Chauhan & Sharib Sabri",
    source:
      "music/Sharib Toshi, Sunidhi Chauhan, & Sharib Sabri - Tu Zaroori (From _Zid_) - (320 Kbps).mp3",
    cover: "assets/images/default-album.jpg",
  },
];

let currentSongIndex = 0;

const audioPlayer = document.getElementById("audio-player");
const playerTitle = document.querySelector(".now-playing-copy strong");
const playerArtist = document.querySelector(".now-playing-copy span");
const playerArtwork = document.querySelector(".player-art");
const playButton = document.querySelector(".play-button");
const currentTimeLabel = document.querySelector(".time-current");
const totalTimeLabel = document.querySelector(".time-total");
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
const trackRows = document.querySelectorAll(".track-row[data-song-index]");
let previousVolume = 0.68;
let isDraggingProgress = false;

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateProgressBar() {
  if (!audioPlayer) {
    return;
  }

  const currentTime = audioPlayer.currentTime || 0;
  const duration = audioPlayer.duration || 0;

  if (currentTimeLabel) {
    currentTimeLabel.textContent = formatTime(currentTime);
  }

  if (totalTimeLabel) {
    totalTimeLabel.textContent = formatTime(duration);
  }

  if (progressValue && progressTrack) {
    const percentage = duration ? (currentTime / duration) * 100 : 0;
    progressValue.style.width = `${percentage}%`;
  }
}

function seekSong(event) {
  if (
    !audioPlayer ||
    !progressTrack ||
    !Number.isFinite(audioPlayer.duration)
  ) {
    return;
  }

  const bounds = progressTrack.getBoundingClientRect();
  const clickPosition = (event.clientX - bounds.left) / bounds.width;
  const clampedPercentage = Math.min(Math.max(clickPosition, 0), 1);

  audioPlayer.currentTime = clampedPercentage * audioPlayer.duration;
  updateProgressBar();
}

function startScrubbing(event) {
  if (!progressTrack) {
    return;
  }

  isDraggingProgress = true;
  seekSong(event);
}

function stopScrubbing() {
  isDraggingProgress = false;
}

function updateVolumeUI() {
  if (!audioPlayer || !volumeSlider || !volumeIcon) {
    return;
  }

  const volumePercentage = audioPlayer.muted
    ? 0
    : Math.round(audioPlayer.volume * 100);

  volumeSlider.value = String(volumePercentage);
  volumeIcon.textContent =
    audioPlayer.muted || volumePercentage === 0 ? "🔇" : "🔊";
  volumeIcon.setAttribute(
    "aria-label",
    audioPlayer.muted || volumePercentage === 0 ? "Unmute" : "Mute"
  );
}

function updatePlayButton(isPlaying) {
  if (!playButton) {
    return;
  }

  playButton.textContent = isPlaying ? "❚❚" : "▶";
  playButton.setAttribute(
    "aria-label",
    isPlaying ? "Pause track" : "Play track"
  );
}

function isPlayerPlaying() {
  return audioPlayer && !audioPlayer.paused;
}

function updateSongInfo(song) {
  if (playerTitle) {
    playerTitle.textContent = song.title;
  }

  if (playerArtist) {
    playerArtist.textContent = song.artist;
  }

  if (playerArtwork) {
    playerArtwork.style.backgroundImage = `url('${song.cover}')`;
    playerArtwork.style.backgroundSize = "cover";
    playerArtwork.style.backgroundPosition = "center";

    const artworkLabel = playerArtwork.querySelector("span");
    if (artworkLabel) {
      artworkLabel.textContent = song.title.slice(0, 2).toUpperCase();
    }
  }
}

function playCurrentSong() {
  if (!audioPlayer) {
    return;
  }

  audioPlayer
    .play()
    .then(() => updatePlayButton(true))
    .catch((error) => {
      console.error("Playback failed:", error);
      updatePlayButton(false);
    });
}

function loadSong(index, shouldPlay = false) {
  if (!songs[index]) {
    return;
  }

  const song = songs[index];
  currentSongIndex = index;

  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.src = song.source;

    if (shouldPlay) {
      audioPlayer
        .play()
        .then(() => updatePlayButton(true))
        .catch((error) => {
          console.error("Playback failed:", error);
          updatePlayButton(false);
        });
    }
  }

  updateSongInfo(song);
  updateProgressBar();
}

function goToNextSong() {
  const nextIndex = (currentSongIndex + 1) % songs.length;
  const shouldPlay = isPlayerPlaying();

  loadSong(nextIndex, shouldPlay);
}

function goToPreviousSong() {
  const previousIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  const shouldPlay = isPlayerPlaying();

  loadSong(previousIndex, shouldPlay);
}

if (audioPlayer) {
  audioPlayer.volume = previousVolume;
  audioPlayer.addEventListener("play", () => updatePlayButton(true));
  audioPlayer.addEventListener("pause", () => updatePlayButton(false));
  audioPlayer.addEventListener("loadedmetadata", updateProgressBar);
  audioPlayer.addEventListener("canplay", updateProgressBar);
  audioPlayer.addEventListener("timeupdate", updateProgressBar);
  audioPlayer.addEventListener("ended", goToNextSong);
}

if (volumeSlider && audioPlayer) {
  volumeSlider.addEventListener("input", (event) => {
    const value = Number(event.target.value) / 100;
    previousVolume = value;
    audioPlayer.volume = value;
    audioPlayer.muted = value === 0;
    updateVolumeUI();
  });
}

if (volumeIcon && audioPlayer) {
  volumeIcon.addEventListener("click", () => {
    if (audioPlayer.muted) {
      audioPlayer.muted = false;
      audioPlayer.volume = previousVolume || 0.68;
    } else {
      previousVolume = audioPlayer.volume || previousVolume;
      audioPlayer.muted = true;
      audioPlayer.volume = 0;
    }

    updateVolumeUI();
  });
}

if (progressTrack) {
  progressTrack.addEventListener("click", seekSong);
  progressTrack.addEventListener("pointerdown", startScrubbing);
}

window.addEventListener("pointermove", (event) => {
  if (!isDraggingProgress) {
    return;
  }

  seekSong(event);
});

window.addEventListener("pointerup", stopScrubbing);

if (playButton) {
  playButton.addEventListener("click", async () => {
    if (!audioPlayer) {
      return;
    }

    if (audioPlayer.paused) {
      try {
        await audioPlayer.play();
        updatePlayButton(true);
      } catch (error) {
        console.error("Playback failed:", error);
        updatePlayButton(false);
      }
    } else {
      audioPlayer.pause();
      updatePlayButton(false);
    }
  });
}

if (previousButton) {
  previousButton.addEventListener("click", goToPreviousSong);
}

if (nextButton) {
  nextButton.addEventListener("click", goToNextSong);
}

trackRows.forEach((trackRow) => {
  trackRow.addEventListener("click", () => {
    const songIndex = Number(trackRow.dataset.songIndex);
    loadSong(songIndex);
    playCurrentSong();
  });
});

if (audioPlayer) {
  updateVolumeUI();
}

loadSong(currentSongIndex);

const sidebar = document.querySelector("#sidebar");
const openButton = document.querySelector("[data-nav-open]");
const closeButton = document.querySelector("[data-nav-close]");
const navigationLinks = document.querySelectorAll(".nav-link");

function setNavigationState(isOpen) {
  if (!sidebar || !openButton) {
    return;
  }

  sidebar.classList.toggle("is-open", isOpen);
  openButton.setAttribute("aria-expanded", String(isOpen));
}

if (openButton) {
  openButton.addEventListener("click", () => setNavigationState(true));
}

if (closeButton) {
  closeButton.addEventListener("click", () => setNavigationState(false));
}

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => setNavigationState(false));
});
