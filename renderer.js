// Logic timer, xử lý click nút - Như các hàm xử lý trong C
// ============ DỮ LIỆU ============
// Thời gian mỗi mode (đơn vị: giây)
let pomodoroTime = 1500;
let shortBreakTime = 300;
let longBreakTime = 900;

// Trạng thái Timer
let timeLeft = pomodoroTime;
let isRunning = false;
let currentRound = 1;
let currentMode = "pomodoro";
let roundsBeforeLongBreak = 4;

// ============ DOM ELEMENTS ============
const btnPomodoro = document.getElementById("btn-pomodoro");
const btnShortBreak = document.getElementById("btn-short-break");
const btnLongBreak = document.getElementById("btn-long-break");
const btnStartPause = document.getElementById("btn-start-pause");
const btnReset = document.getElementById("btn-reset");
const btnSetting = document.getElementById("btn-setting");

// DOM Setting
const settingOverlay = document.querySelector(".setting-overlay");
const btnCloseX = document.getElementById("btn-close-x");

const btnSettingGeneral = document.getElementById("btn-setting-general");
const btnSettingTimer = document.getElementById("btn-setting-timer");
const btnSettingSound = document.getElementById("btn-setting-sound");
const btnSettingMusic = document.getElementById("btn-setting-music");

const btnSave = document.getElementById("btn-save");
const btnClose = document.getElementById("btn-close");

// DOM General tab
const themeSelect = document.getElementById("theme-select");
const toggleAutoChange = document.getElementById("toggle-auto-change");

let autoChangeTheme = false;
let currentTheme = "moonlit";

const themes = {
  countryside: "assets/images/Countryside.jpg",
  ocean: "assets/images/Ocean Sunset.jpg",
  cozy: "assets/images/Cozy Cafe.jpg",
  corner: "assets/images/Corner.jpg",
  cat: "assets/images/Cat.jpg",
  saigon: "assets/images/Saigon Night.jpg",
  rainy: "assets/images/Rainy Day.jpg",
  mango: "assets/images/Mango.jpg",
  starry: "assets/images/Starry Night.jpg",
};

// DOM Timer tab
const inputPomodoro = document.getElementById("input-pomodoro");
const inputShortBreak = document.getElementById("input-short-break");
const inputLongBreak = document.getElementById("input-long-break");
const inputRounds = document.getElementById("input-rounds");

// DOM Sound tab
const soundSelect = document.getElementById("sound-select");
const toggleSoundEnabled = document.getElementById("toggle-sound-enabled");
const volumeSlider = document.getElementById("volume-slider");

const sounds = {
  bell: new Audio("assets/sounds/bell.mp3"),
  ding: new Audio("assets/sounds/ding.mp3"),
  chime: new Audio("assets/sounds/chime.mp3"),
  birds: new Audio("assets/sounds/birds.mp3"),
  lofi: new Audio("assets/sounds/lofi.mp3"),
};

// Trạng thái Sound
let selectedSound = "bell";
let soundEnabled = true;
let volumeSound = 0.8;

// DOM Music tab
const musicUpload = document.getElementById("music-upload");
const playlistContainer = document.querySelector(".playlist-container");
const btnMusicDelete = document.getElementById("btn-music-delete");

// Trạng thái Music
let playlist = [
  {
    name: "Piano",
    duration: null,
    url: "assets/musics/Piano.mp3",
  },
  {
    name: "Rain",
    duration: null,
    url: "assets/musics/Rain.mp3",
  },
];

let selectedMusic = null;

// Dom media-player
const btnStartPausePlayer = document.getElementById("btn-start-pause-player");
const btnPreviousPlayer = document.getElementById("btn-previous-player");
const btnNextPlayer = document.getElementById("btn-next-player");
const musicName = document.getElementById("music-name");
const musicImage = document.getElementById("music-image");

// Trạng thái media-player
let currentTrackIndex = null; // bài nào đang được chọn để phát (index trong playlist)
let isPlaying = false; // đang phát hay đang pause
let currentPlayingTrack = null; //  object của bài đang phát (null nếu chưa phát gì)
let loadedTrackIndex = null; // index của bài đã được load vào currentPlayingTrack

// Trạng thái cho đĩa Vinyl
let currentAngle = 0;
let rotationSpeed = 0;
let animationFrameId = null;

const MAX_SPEED = 1.5; // độ/frame khi quay full tốc độ
const ACCELERATION = 0.05; // độ/frame^2 — tăng tốc mỗi frame khi Play
const DECELERATION = 0.03; // độ/frame^2 — giảm tốc mỗi frame khi Pause

// ============ HÀM ============
// Hàm 1: chuyển giây → "25:00"
function formatTime(seconds) {
  const minute = Math.floor(seconds / 60);
  const second = seconds % 60;

  let strMinute = minute;
  let strSecond = second;

  if (minute < 10) {
    strMinute = `0${minute}`;
  }

  if (second < 10) {
    strSecond = `0${second}`;
  }

  return `${strMinute}:${strSecond}`;
}

// Hàm 2: hiện thời gian lên màn hình
function updateDisplay(timeLeft) {
  const time = formatTime(timeLeft);
  document.getElementById("timer-display").textContent = time;
}

// Hàm 3: hiện time mode đang được chọn
function switchMode(mode, time, activeBtn) {
  isRunning = false;
  btnStartPause.textContent = "start";

  btnPomodoro.classList.remove("active");
  btnShortBreak.classList.remove("active");
  btnLongBreak.classList.remove("active");

  activeBtn.classList.add("active");

  currentMode = mode;
  timeLeft = time;

  updateDisplay(timeLeft);
}

// Hàm 4: ẩn hiện trong Setting
function switchSettingTab(activeTabBtn, activeContentId) {
  // 1. Bỏ active khỏi tất cả tab
  document.querySelectorAll(".setting-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // 2. Bỏ active khỏi tất cả content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  // 3. Active đúng tab + đúng content được click
  activeTabBtn.classList.add("active");
  document.getElementById(activeContentId).classList.add("active");
}

// Hàm 5: Vẽ lại playlist lên màn hình trong tab Music
function renderPlaylist() {
  let html = ""; // chuỗi tạm, gom hết HTML lại

  playlist.forEach((song, index) => {
    html += `
      <div class="song-item" data-index="${index}">
        <p class="song-name">${song.name}</p>
        <p class="song-duration">${song.duration}</p>
      </div>
    `;
  });

  playlistContainer.innerHTML = html;
}

// Hàm 6: tạo Audio mới cho 1 bài, gắn sẵn sự kiện "ended"
function loadTrack(index) {
  currentPlayingTrack = new Audio(playlist[index].url);
  loadedTrackIndex = index;

  // Khi bài này tự phát hết (không phải do user bấm gì) → tự chuyển bài tiếp
  currentPlayingTrack.addEventListener("ended", () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    musicName.textContent = playlist[currentTrackIndex].name;
    loadTrack(currentTrackIndex);
    currentPlayingTrack.play();
  });

  return currentPlayingTrack;
}

// Hàm 7: lấy duration của 1 file audio, trả về dạng Promise ; loadedmetadata là một event (bất đồng bộ — không biết khi nào xong
function getAudioDuration(url) {
  return new Promise((resolve) => {
    const tempAudio = new Audio(url);
    tempAudio.addEventListener("loadedmetadata", () => {
      resolve(formatTime(Math.floor(tempAudio.duration)));
    });
  });
}

// Hàm 8: Nạp duration cho 3 bài demo lúc khởi động, rồi vẽ playlist + hiện tên bài 0
async function loadDefaultPlaylist() {
  for (const song of playlist) {
    song.duration = await getAudioDuration(song.url);
  }
  renderPlaylist();
  musicName.textContent = playlist[0].name;
}

// Hàm 9: xử lý quay đĩa vinyl
function animate() {
  if (isPlaying) {
    rotationSpeed = Math.min(rotationSpeed + ACCELERATION, MAX_SPEED);
  } else {
    rotationSpeed = Math.max(rotationSpeed - DECELERATION, 0);
  }

  currentAngle += rotationSpeed;
  musicImage.style.transform = `rotate(${currentAngle}deg)`;

  if (rotationSpeed > 0) {
    animationFrameId = requestAnimationFrame(animate);
  }
}

// Hàm 10: xử lý đổi theme
function changeTheme(themeName) {
  document.body.style.backgroundImage = `url("${themes[themeName]}")`;
}

// Hàm 11: xử lý đổi random theme
function randomTheme() {
  const keys = Object.keys(themes);

  let newTheme;

  do {
    newTheme = keys[Math.floor(Math.random() * keys.length)];
  } while (newTheme === currentTheme);

  currentTheme = newTheme;

  changeTheme(currentTheme);
  themeSelect.value = currentTheme;
}

// ============ TIMER ============
// tính toán pomodoro

setInterval(() => {
  // ← nếu đang dừng thì thoát luôn, không làm gì
  if (!isRunning) return;

  timeLeft = timeLeft - 1;
  updateDisplay(timeLeft);

  if (timeLeft === 0) {
    // sound chạy
    if (soundEnabled) {
      const audioToPlay = sounds[selectedSound];
      audioToPlay.currentTime = 0;
      audioToPlay.volume = volumeSound;
      audioToPlay.play();
    }

    // xử lý mode
    btnPomodoro.classList.remove("active");
    btnShortBreak.classList.remove("active");
    btnLongBreak.classList.remove("active");
    if (currentMode === "pomodoro" && currentRound < roundsBeforeLongBreak) {
      timeLeft = shortBreakTime;
      currentMode = "short-break";
      btnShortBreak.classList.add("active");
      currentRound++;
    } else if (
      currentMode === "pomodoro" &&
      currentRound >= roundsBeforeLongBreak
    ) {
      timeLeft = longBreakTime;
      currentMode = "long-break";
      btnLongBreak.classList.add("active");
      currentRound = 1;
    } else if (currentMode === "short-break") {
      timeLeft = pomodoroTime;
      currentMode = "pomodoro";
      btnPomodoro.classList.add("active");
    } else {
      timeLeft = pomodoroTime;
      currentMode = "pomodoro";
      btnPomodoro.classList.add("active");
      currentRound = 1;
    }
    updateDisplay(timeLeft);

    // đổi theme
    if (autoChangeTheme) {
      randomTheme();
    }

    isRunning = true;
  }
}, 1000);

// ============ SỰ KIỆN ============
// Sự kiện click chọn mode Pomodoro
btnPomodoro.addEventListener("click", (e) => {
  switchMode("pomodoro", pomodoroTime, e.target);
});

// Sự kiện click chọn mode Short Break
btnShortBreak.addEventListener("click", (e) => {
  switchMode("short-break", shortBreakTime, e.target);
});

// Sự kiện click chọn mode Long Break
btnLongBreak.addEventListener("click", (e) => {
  switchMode("long-break", longBreakTime, e.target);
});

// Sự kiện click start/pause
btnStartPause.addEventListener("click", () => {
  isRunning = !isRunning;
  const text = document.getElementById("btn-start-pause");
  if (isRunning) {
    btnStartPause.textContent = "pause";
  } else {
    btnStartPause.textContent = "start";
  }
});

// Sự kiện click Reset
btnReset.addEventListener("click", () => {
  isRunning = false;

  if (currentMode === "pomodoro") timeLeft = pomodoroTime;
  if (currentMode === "short-break") timeLeft = shortBreakTime;
  if (currentMode === "long-break") timeLeft = longBreakTime;

  updateDisplay(timeLeft);
  currentRound = 1;
  btnStartPause.textContent = "start";
});

// Sự kiện click Setting
btnSetting.addEventListener("click", () => {
  isRunning = false;
  btnStartPause.textContent = "start";
  settingOverlay.classList.add("open");
});

// Sự kiện click x - đóng hộp thoại Setting
btnCloseX.addEventListener("click", () => {
  settingOverlay.classList.remove("open");
});

// Sự kiện click nút General trong hộp thoại Setting
btnSettingGeneral.addEventListener("click", () => {
  switchSettingTab(btnSettingGeneral, "content-general");
});

// Sự kiện click nút Timer trong hộp thoại Setting
btnSettingTimer.addEventListener("click", () => {
  switchSettingTab(btnSettingTimer, "content-timer");
});

// Sự kiện click nút Sound trong hộp thoại Setting
btnSettingSound.addEventListener("click", () => {
  switchSettingTab(btnSettingSound, "content-sound");
});

// Sự kiện click nút Music trong hộp thoại Setting
btnSettingMusic.addEventListener("click", () => {
  switchSettingTab(btnSettingMusic, "content-music");
});

// Sự kiện chọn preview sound trong hộp thoại Sound
soundSelect.addEventListener("change", () => {
  const audioToPlay = sounds[soundSelect.value];
  audioToPlay.currentTime = 0;
  audioToPlay.volume = volumeSlider.valueAsNumber / 100;
  audioToPlay.play();
});

// Sự kiện chọn preview volume sound trong hộp thoại Sound
volumeSlider.addEventListener("change", () => {
  const audioToPlay = sounds[soundSelect.value];
  audioToPlay.currentTime = 0;
  audioToPlay.volume = volumeSlider.valueAsNumber / 100;
  audioToPlay.play();
});

// Sự kiện Upload file mp3 trong hộp thoại music
musicUpload.addEventListener("change", async () => {
  // Lấy danh sách file vừa chọn
  const files = Array.from(musicUpload.files);
  // Với MỖI file, tạo 1 object { name, duration, url }
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const dotIndex = file.name.lastIndexOf(".");
    const nameWithoutExt = file.name.slice(0, dotIndex);

    const duration = await getAudioDuration(url);

    const song = {
      name: nameWithoutExt,
      duration: duration,
      url: url,
    };
    playlist.push(song);
    renderPlaylist();
  }
});

// Sự kiện Delete file mp3 trong hộp thoại music (Event Delegation)
playlistContainer.addEventListener("click", function (event) {
  const songItem = event.target.closest(".song-item");
  if (songItem === null) {
    return;
  }

  const index = parseInt(songItem.dataset.index);

  selectedMusic = index;

  // gỡ class .selected khỏi bài cũ (nếu có)
  const previousSelected = document.querySelector(".song-item.selected");
  if (previousSelected !== null) {
    previousSelected.classList.remove("selected");
  }
  // gắn class .selected vào songItem hiện tại
  songItem.classList.add("selected");
});

btnMusicDelete.addEventListener("click", () => {
  if (selectedMusic === null) {
    alert("Please select a song!");
    return;
  }
  playlist.splice(selectedMusic, 1);
  renderPlaylist();
  selectedMusic = null;
});

// Sự kiện click nút Save changes trong hộp thoại Setting
btnSave.addEventListener("click", () => {
  /* Lưu Timer */
  let pomodoroMinutes = isNaN(inputPomodoro.valueAsNumber)
    ? 25 * 60
    : inputPomodoro.valueAsNumber * 60;

  let shortBreakMinutes = isNaN(inputShortBreak.valueAsNumber)
    ? 5 * 60
    : inputShortBreak.valueAsNumber * 60;

  let longBreakMinutes = isNaN(inputLongBreak.valueAsNumber)
    ? 15 * 60
    : inputLongBreak.valueAsNumber * 60;

  let roundsPomodoro = isNaN(inputRounds.valueAsNumber)
    ? 4
    : inputRounds.valueAsNumber;

  // Cập nhật lại thời gian
  pomodoroTime = pomodoroMinutes;
  shortBreakTime = shortBreakMinutes;
  longBreakTime = longBreakMinutes;
  roundsBeforeLongBreak = roundsPomodoro;

  // Đóng cửa sổ sau khi update
  settingOverlay.classList.remove("open");

  // Cập nhật lại đồng hồ hiển thị
  if (currentMode === "pomodoro") {
    timeLeft = pomodoroTime;
  } else if (currentMode === "short-break") {
    timeLeft = shortBreakTime;
  } else if (currentMode === "long-break") {
    timeLeft = longBreakTime;
  }

  // Cập nhật giao diện đồng hồ đúng với timeLeft mới
  updateDisplay(timeLeft);

  /* Lưu Sound */
  selectedSound = soundSelect.value;
  soundEnabled = toggleSoundEnabled.checked;
  volumeSound = volumeSlider.valueAsNumber / 100;
});

// Sự kiện click nút close trong hộp thoại Setting
btnClose.addEventListener("click", () => {
  settingOverlay.classList.remove("open");
});

// Sự kiện bấm nút play/pause nghe nhạc
btnStartPausePlayer.addEventListener("click", () => {
  const playPauseIcon = btnStartPausePlayer.querySelector("i");
  if (!isPlaying) {
    // UI
    isPlaying = true;
    playPauseIcon.classList.remove("fa-circle-play");
    playPauseIcon.classList.add("fa-circle-pause");

    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(animate);

    // audio
    if (currentTrackIndex === null) {
      currentTrackIndex = 0;
    }

    if (currentPlayingTrack === null || currentTrackIndex != loadedTrackIndex) {
      loadTrack(currentTrackIndex);
      currentPlayingTrack.play();
    } else {
      currentPlayingTrack.play();
    }
  } else {
    // UI
    isPlaying = false;
    playPauseIcon.classList.remove("fa-circle-pause");
    playPauseIcon.classList.add("fa-circle-play");

    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(animate);

    // audio
    currentPlayingTrack.pause();
  }
});

// Sự kiện bấm nút Next (bài kế tiếp)
btnNextPlayer.addEventListener("click", () => {
  // Nếu chưa từng chọn bài nào, mặc định bắt đầu từ bài 0
  if (currentTrackIndex === null) {
    currentTrackIndex = 0;
  } else {
    // Tính bài kế tiếp, vòng lại bài 0 nếu đang ở bài cuối
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  }

  // Cập nhật tên bài hiển thị
  musicName.textContent = playlist[currentTrackIndex].name;

  // Nếu đang phát nhạc, dừng bài cũ, phát luôn bài mới (không cần bấm Play lại)
  if (isPlaying) {
    if (currentPlayingTrack) {
      currentPlayingTrack.pause();
      loadTrack(currentTrackIndex);
      currentPlayingTrack.play();
    }
  }
});

// Sự kiện bấm nút Previous (bài trước)
btnPreviousPlayer.addEventListener("click", () => {
  if (currentTrackIndex === null) {
    currentTrackIndex = 0;
  } else {
    // Tính bài trước, vòng lại bài cuối nếu đang ở bài đầu
    currentTrackIndex =
      (currentTrackIndex - 1 + playlist.length) % playlist.length;
  }

  musicName.textContent = playlist[currentTrackIndex].name;

  if (isPlaying) {
    if (currentPlayingTrack) {
      currentPlayingTrack.pause();
      loadTrack(currentTrackIndex);
      currentPlayingTrack.play();
    }
  }
});

// Sự kiện chọn theme
themeSelect.addEventListener("change", () => {
  changeTheme(themeSelect.value);
});

// Sự kiện check đổi theme theo pomodoro
toggleAutoChange.addEventListener("change", () => {
  autoChangeTheme = toggleAutoChange.checked;
});

// ============ KHỞI TẠO MẶC ĐỊNH ============
// Mới vào ứng dụng, tự động kích hoạt sẵn mode Pomodoro
switchMode("pomodoro", pomodoroTime, btnPomodoro);
// Kích hoạt nút General trong Setting
btnSettingGeneral.click();
// Load file music
renderPlaylist();
// load nhạc có sẵn
loadDefaultPlaylist();
// Tự động bật toggle khi load app
if (toggleSoundEnabled) {
  toggleSoundEnabled.checked = true;
}
