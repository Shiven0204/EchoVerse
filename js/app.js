// Simple local song data for now.
// This is beginner-friendly and easy to replace later with an API response.
const songs = [
  {
    title: "Barsaat",
    artist: "Banjaare & Roni",
    source: "music/song1.wav",
    cover: "assets/images/default-album.jpg",
  },
  {
    title: "Bairan",
    artist: "Banjaare",
    source: "music/song2.wav",
    cover: "assets/images/default-album.jpg",
  },
  {
    title: "Tu Zaroori",
    artist: "Sharib Toshi, Sunidhi Chauhan & Sharib Sabri",
    source: "music/song3.wav",
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
const controlButtons = document.querySelectorAll(
  ".control-buttons .icon-button"
);
const previousButton = controlButtons[0];
const nextButton = controlButtons[1];
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

function loadSong(index) {
  if (!songs[index]) {
    return;
  }

  currentSongIndex = index;
  const song = songs[currentSongIndex];

  if (audioPlayer) {
    audioPlayer.src = song.source;
    audioPlayer.load();
  }

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
  }

  updateProgressBar();
}

function goToNextSong() {
  const nextIndex = (currentSongIndex + 1) % songs.length;
  loadSong(nextIndex);

  if (audioPlayer && !audioPlayer.paused) {
    audioPlayer.play().catch((error) => {
      console.error("Unable to play next song:", error);
    });
  }
}

function goToPreviousSong() {
  const previousIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(previousIndex);

  if (audioPlayer && !audioPlayer.paused) {
    audioPlayer.play().catch((error) => {
      console.error("Unable to play previous song:", error);
    });
  }
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

if (audioPlayer) {
  audioPlayer.volume = previousVolume;
  audioPlayer.addEventListener("play", () => updatePlayButton(true));
  audioPlayer.addEventListener("pause", () => updatePlayButton(false));
  audioPlayer.addEventListener("loadedmetadata", updateProgressBar);
  audioPlayer.addEventListener("canplay", updateProgressBar);
  audioPlayer.addEventListener("timeupdate", updateProgressBar);
  audioPlayer.addEventListener("ended", goToNextSong);
  updatePlayButton(audioPlayer.paused === false);
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
      } catch (error) {
        console.error("Playback failed:", error);
      }
    } else {
      audioPlayer.pause();
    }
  });
}

if (previousButton) {
  previousButton.addEventListener("click", goToPreviousSong);
}

if (nextButton) {
  nextButton.addEventListener("click", goToNextSong);
}

if (audioPlayer) {
  updateVolumeUI();
}

loadSong(currentSongIndex);

// Phase 1 keeps JavaScript small: it only manages the mobile navigation shell.
const sidebar = document.querySelector("#sidebar");
const openButton = document.querySelector("[data-nav-open]");
const closeButton = document.querySelector("[data-nav-close]");
const navigationLinks = document.querySelectorAll(".nav-link");

function setNavigationState(isOpen) {
  sidebar.classList.toggle("is-open", isOpen);
  openButton.setAttribute("aria-expanded", String(isOpen));
}

openButton.addEventListener("click", () => setNavigationState(true));
closeButton.addEventListener("click", () => setNavigationState(false));

// Closing after a selection keeps the mobile layout tidy while preserving the anchor link.
navigationLinks.forEach((link) => {
  link.addEventListener("click", () => setNavigationState(false));
});
