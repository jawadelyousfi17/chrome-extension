function createPomodoro() {
  if (document.getElementById("extension-pomodoro")) return;

  // Default Settings
  const defaultSettings = {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsBeforeLong: 4,
    soundEnabled: true,
    notificationsEnabled: true,
  };

  let settings = { ...defaultSettings };
  let currentMode = "focus"; // focus, short, long
  let sessionsCompleted = 0;
  let timeLeft = settings.focusTime * 60;
  let timerId = null;
  let isRunning = false;
  let endTime = null; // For background persistence

  // Load settings and state from storage
  chrome.storage.local.get(
    ["pomodoro_settings", "pomodoro_state"],
    (result) => {
      if (result.pomodoro_settings) {
        settings = { ...defaultSettings, ...result.pomodoro_settings };
      }

      if (result.pomodoro_state) {
        const state = result.pomodoro_state;
        currentMode = state.mode;
        sessionsCompleted = state.sessionsCompleted;

        if (state.isRunning && state.endTime) {
          // Timer was running
          const now = Date.now();
          const remaining = Math.floor((state.endTime - now) / 1000);

          if (remaining > 0) {
            timeLeft = remaining;
            endTime = state.endTime;
            startTimer(true); // Resume without resetting endTime
          } else {
            // Timer finished while closed
            timeLeft = 0;
            handleTimerComplete();
          }
        } else {
          // Timer was paused or stopped
          timeLeft = state.timeLeft;
          isRunning = false;
          updateDisplay();
        }
      } else {
        resetTimer();
      }
    }
  );

  const container = document.createElement("div");
  container.id = "extension-pomodoro";
  container.className =
    "fixed inset-0 w-full h-full bg-[#1F212A] z-[9999] font-sans text-white flex flex-col justify-center items-center";

  // --- UI Elements ---

  // Top Right Controls
  const topControls = document.createElement("div");
  topControls.className = "absolute top-8 right-8 flex gap-4";

  const minBtn = document.createElement("button");
  minBtn.className =
    "text-gray-400 hover:text-white focus:outline-none transform hover:scale-110 transition-transform";
  minBtn.innerHTML = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>`;
  minBtn.title = "Minimize (Keep Running)";

  const settingsBtn = document.createElement("button");
  settingsBtn.className =
    "text-gray-400 hover:text-white focus:outline-none transform hover:scale-110 transition-transform";
  settingsBtn.innerHTML = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`;

  const closeBtn = document.createElement("button");
  closeBtn.className =
    "text-gray-400 hover:text-white focus:outline-none transform hover:scale-110 transition-transform";
  closeBtn.innerHTML = `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
  closeBtn.title = "Close (Stop Timer)";

  //   topControls.appendChild(minBtn);
  topControls.appendChild(settingsBtn);
  topControls.appendChild(closeBtn);

  // Main Content
  const content = document.createElement("div");
  content.className =
    "flex flex-col items-center gap-12 transition-opacity duration-300";

  const title = document.createElement("div");
  title.className =
    "text-2xl font-bold uppercase tracking-[0.2em] text-[#4E5567]";
  title.innerText = "Pomodoro Focus";

  const statusBadge = document.createElement("div");
  statusBadge.className =
    "px-4 py-1 bg-[#343946] text-[#4E5567] text-sm font-bold uppercase tracking-wider rounded-none border border-[#4E5567]";
  statusBadge.innerText = "FOCUS";

  const timerDisplay = document.createElement("div");
  timerDisplay.className =
    "text-[12rem] leading-none font-mono font-bold tracking-wider text-white select-none tabular-nums";
  timerDisplay.innerText = "25:00";

  const controls = document.createElement("div");
  controls.className = "flex gap-6";
  const btnClass =
    "py-4 px-12 bg-[#343946] border-2 border-[#4E5567] text-xl font-bold hover:bg-[#4E5567] hover:border-[#4E5567] transition-all duration-200 focus:outline-none text-white min-w-[200px]";

  const startBtn = document.createElement("button");
  startBtn.className = btnClass;
  startBtn.innerText = "START";

  const resetBtn = document.createElement("button");
  resetBtn.className = btnClass;
  resetBtn.innerText = "RESET";

  controls.appendChild(startBtn);
  controls.appendChild(resetBtn);

  content.appendChild(title);
  content.appendChild(statusBadge);
  content.appendChild(timerDisplay);
  content.appendChild(controls);

  // Settings Panel (Hidden by default)
  const settingsPanel = document.createElement("div");
  settingsPanel.className =
    "hidden absolute inset-0 bg-[#1F212A] z-10 flex flex-col items-center justify-center gap-8";
  settingsPanel.innerHTML = `
    <h2 class="text-4xl font-bold text-white mb-8">SETTINGS</h2>
    <div class="grid grid-cols-2 gap-x-12 gap-y-8 w-full max-w-2xl">
      <div class="flex flex-col gap-2">
        <label class="text-gray-400 text-sm uppercase tracking-wider">Focus Time (min)</label>
        <input type="number" id="set-focus" class="bg-[#343946] border border-[#4E5567] p-4 text-white text-xl focus:outline-none focus:border-white" value="${
          settings.focusTime
        }">
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-gray-400 text-sm uppercase tracking-wider">Short Break (min)</label>
        <input type="number" id="set-short" class="bg-[#343946] border border-[#4E5567] p-4 text-white text-xl focus:outline-none focus:border-white" value="${
          settings.shortBreak
        }">
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-gray-400 text-sm uppercase tracking-wider">Long Break (min)</label>
        <input type="number" id="set-long" class="bg-[#343946] border border-[#4E5567] p-4 text-white text-xl focus:outline-none focus:border-white" value="${
          settings.longBreak
        }">
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-gray-400 text-sm uppercase tracking-wider">Sessions before Long Break</label>
        <input type="number" id="set-sessions" class="bg-[#343946] border border-[#4E5567] p-4 text-white text-xl focus:outline-none focus:border-white" value="${
          settings.sessionsBeforeLong
        }">
      </div>
      <div class="flex items-center gap-4 mt-4">
        <input type="checkbox" id="set-sound" class="w-6 h-6 accent-[#4E5567]" ${
          settings.soundEnabled ? "checked" : ""
        }>
        <label for="set-sound" class="text-white text-lg cursor-pointer">Enable Sound</label>
      </div>
      <div class="flex items-center gap-4 mt-4">
        <input type="checkbox" id="set-notif" class="w-6 h-6 accent-[#4E5567]" ${
          settings.notificationsEnabled ? "checked" : ""
        }>
        <label for="set-notif" class="text-white text-lg cursor-pointer">Enable Notifications</label>
      </div>
    </div>
    <div class="flex gap-6 mt-12">
      <button id="save-settings" class="${btnClass}">SAVE</button>
      <button id="cancel-settings" class="${btnClass} opacity-50 hover:opacity-100">CANCEL</button>
    </div>
  `;

  container.appendChild(topControls);
  container.appendChild(content);
  container.appendChild(settingsPanel);
  document.body.appendChild(container);

  // --- Logic ---

  function saveState() {
    const state = {
      isRunning,
      mode: currentMode,
      sessionsCompleted,
      timeLeft,
      endTime: isRunning ? endTime : null,
      lastUpdated: Date.now(),
    };
    chrome.storage.local.set({ pomodoro_state: state });
  }

  let currentAudio = null;

  function stopSound() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  function playSound() {
    if (!settings.soundEnabled) return;
    stopSound(); // Stop any currently playing sound
    currentAudio = new Audio(chrome.runtime.getURL("alert.mp3"));
    currentAudio.play().catch((e) => console.error("Error playing sound:", e));
  }

  function sendNotification(msg) {
    if (!settings.notificationsEnabled) return;
    if (Notification.permission === "granted") {
      new Notification("Pomodoro Timer", { body: msg, icon: "" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Pomodoro Timer", { body: msg, icon: "" });
        }
      });
    }
  }

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    // Update status badge
    if (currentMode === "focus") {
      statusBadge.innerText = `FOCUS (Session ${sessionsCompleted + 1}/${
        settings.sessionsBeforeLong
      })`;
      statusBadge.className =
        "px-4 py-1 bg-[#343946] text-white text-sm font-bold uppercase tracking-wider border border-[#4E5567]";
    } else {
      statusBadge.innerText =
        currentMode === "short" ? "SHORT BREAK" : "LONG BREAK";
      statusBadge.className =
        "px-4 py-1 bg-[#4E5567] text-white text-sm font-bold uppercase tracking-wider border border-[#4E5567]";
    }
  }

  function handleTimerComplete() {
    playSound();
    if (currentMode === "focus") {
      sessionsCompleted++;
      if (sessionsCompleted >= settings.sessionsBeforeLong) {
        currentMode = "long";
        timeLeft = settings.longBreak * 60;
        sessionsCompleted = 0; // Reset sessions after long break
        sendNotification("Focus session complete! Take a long break.");
      } else {
        currentMode = "short";
        timeLeft = settings.shortBreak * 60;
        sendNotification("Focus session complete! Take a short break.");
      }
    } else {
      currentMode = "focus";
      timeLeft = settings.focusTime * 60;
      sendNotification("Break over! Back to focus.");
    }
    isRunning = false;
    endTime = null;
    updateDisplay();
    startBtn.innerText = "START";
    saveState();
  }

  function startTimer(resume = false) {
    stopSound(); // Stop sound when timer starts
    if (isRunning && !resume) {
      // Pause
      clearInterval(timerId);
      isRunning = false;
      endTime = null;
      startBtn.innerText = "START";
      saveState();
    } else {
      // Start
      isRunning = true;
      startBtn.innerText = "PAUSE";

      if (!resume) {
        endTime = Date.now() + timeLeft * 1000;
      }

      saveState();

      // Request notification permission on first start
      if (
        settings.notificationsEnabled &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission();
      }

      timerId = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((endTime - now) / 1000);

        if (remaining > 0) {
          timeLeft = remaining;
          updateDisplay();
        } else {
          clearInterval(timerId);
          timeLeft = 0;
          handleTimerComplete();
        }
      }, 1000);
    }
  }

  function resetTimer() {
    stopSound(); // Stop sound on reset
    clearInterval(timerId);
    isRunning = false;
    endTime = null;
    currentMode = "focus";
    sessionsCompleted = 0;
    timeLeft = settings.focusTime * 60;
    updateDisplay();
    startBtn.innerText = "START";
    saveState();
  }

  // --- Event Listeners ---

  startBtn.addEventListener("click", () => startTimer(false));
  resetBtn.addEventListener("click", resetTimer);

  // Close button stops timer and removes UI
  closeBtn.addEventListener("click", () => {
    stopSound(); // Stop sound on close
    clearInterval(timerId);
    isRunning = false;
    endTime = null;
    chrome.storage.local.remove("pomodoro_state"); // Clean state
    container.remove();
  });

  // Minimize button keeps timer running and removes UI
  minBtn.addEventListener("click", () => {
    // Don't clear interval, just remove UI
    // The interval will keep running in this tab's context
    // And state is saved for other tabs/reloads
    container.remove();
  });

  settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("hidden");
    content.classList.add("hidden");
    // Populate inputs
    document.getElementById("set-focus").value = settings.focusTime;
    document.getElementById("set-short").value = settings.shortBreak;
    document.getElementById("set-long").value = settings.longBreak;
    document.getElementById("set-sessions").value = settings.sessionsBeforeLong;
    document.getElementById("set-sound").checked = settings.soundEnabled;
    document.getElementById("set-notif").checked =
      settings.notificationsEnabled;
  });

  document.getElementById("cancel-settings").addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
    content.classList.remove("hidden");
  });

  document.getElementById("save-settings").addEventListener("click", () => {
    const newSettings = {
      focusTime: parseInt(document.getElementById("set-focus").value) || 25,
      shortBreak: parseInt(document.getElementById("set-short").value) || 5,
      longBreak: parseInt(document.getElementById("set-long").value) || 15,
      sessionsBeforeLong:
        parseInt(document.getElementById("set-sessions").value) || 4,
      soundEnabled: document.getElementById("set-sound").checked,
      notificationsEnabled: document.getElementById("set-notif").checked,
    };

    settings = newSettings;
    chrome.storage.local.set({ pomodoro_settings: settings });

    settingsPanel.classList.add("hidden");
    content.classList.remove("hidden");
    resetTimer(); // Apply new time settings
  });

  // Initial display update
  updateDisplay();
}

// Make it available globally
// window.createPomodoro = createPomodoro;
