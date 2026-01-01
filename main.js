var campusId = 55;
const API_BASE_URL = "https://improved-1337.vercel.app";
// const API_BASE_URL = "http://localhost:3000";

// Host used for external pages (reporting, preferences, etc.)
const HOST_URL = API_BASE_URL;

async function appendReportBugsFloatingButton() {
  if (document.getElementById("report-bugs-fab-container")) return;

  const { reportBugsDismissed } = await chrome.storage.local.get([
    "reportBugsDismissed",
  ]);
  if (reportBugsDismissed) return;

  const container = document.createElement("div");
  container.id = "report-bugs-fab-container";
  container.style.cssText = [
    "position: fixed",
    "right: 18px",
    "bottom: 18px",
    "z-index: 2147483647",
  ].join("; ");

  const btn = document.createElement("button");
  btn.id = "report-bugs-fab";
  btn.type = "button";
  btn.textContent = "Report bugs";
  btn.style.cssText = [
    "background: #343946",
    "color: #ffffff",
    "border: 1px solid #4E5567",
    "border-radius: 12px",
    "padding: 10px 12px",
    "font: 600 12px/1.2 system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    "letter-spacing: 0.3px",
    "cursor: pointer",
  ].join("; ");

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "×";
  closeBtn.style.cssText = [
    "position: absolute",
    "top: -10px",
    "right: -10px",
    "width: 22px",
    "height: 22px",
    "border-radius: 999px",
    "border: 1px solid #4E5567",
    "background: #1F212A",
    "color: #ffffff",
    "cursor: pointer",
    "display: flex",
    "align-items: center",
    "justify-content: center",
    "line-height: 1",
    "font-size: 16px",
    "padding: 0",
  ].join("; ");

  btn.addEventListener("mouseenter", () => {
    btn.style.opacity = "0.95";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.opacity = "1";
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.assign(`${HOST_URL}/report`);
  });

  closeBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await chrome.storage.local.set({ reportBugsDismissed: true });
    container.remove();
  });

  container.appendChild(btn);
  container.appendChild(closeBtn);
  document.documentElement.appendChild(container);
}

function appendRankingIcon() {
  let sidbar;
  if (window.location.href.includes("profile-v3")) {
    sidbar =
      document.querySelector(".App").children[1].children[1].children[0]
        .children[0];
    if (!sidbar) return;
  } else {
  }

  const icon = document.createElement("a");
  icon.href = "";
  icon.className =
    "ranking-ext py-5 w-full flex justify-center hover:opacity-100 opacity-40";
  icon.innerHTML = `<svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 21H9V12.6C9 12.2686 9.26863 12 9.6 12H14.4C14.7314 12 15 12.2686 15 12.6V21Z" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.4 21H15V18.1C15 17.7686 15.2686 17.5 15.6 17.5H20.4C20.7314 17.5 21 17.7686 21 18.1V20.4C21 20.7314 20.7314 21 20.4 21Z" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 21V16.1C9 15.7686 8.73137 15.5 8.4 15.5H3.6C3.26863 15.5 3 15.7686 3 16.1V20.4C3 20.7314 3.26863 21 3.6 21H9Z" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.8056 5.11325L11.7147 3.1856C11.8314 2.93813 12.1686 2.93813 12.2853 3.1856L13.1944 5.11325L15.2275 5.42427C15.4884 5.46418 15.5923 5.79977 15.4035 5.99229L13.9326 7.4917L14.2797 9.60999C14.3243 9.88202 14.0515 10.0895 13.8181 9.96099L12 8.96031L10.1819 9.96099C9.94851 10.0895 9.67568 9.88202 9.72026 9.60999L10.0674 7.4917L8.59651 5.99229C8.40766 5.79977 8.51163 5.46418 8.77248 5.42427L10.8056 5.11325Z" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  icon.addEventListener("click", (e) => {
    e.preventDefault();
    showRanking();
  });
  if (!document.querySelector(".ranking-ext")) sidbar.prepend(icon);
}

function appendTimer() {
  let sidbar;
  if (window.location.href.includes("profile-v3")) {
    sidbar =
      document.querySelector(".App").children[1].children[1].children[0]
        .children[0];
    if (!sidbar) return;
  } else {
  }

  const icon = document.createElement("a");
  icon.href = "";
  icon.className =
    "timer-ext py-5 w-full flex justify-center hover:opacity-100 opacity-40";
  icon.innerHTML = `<svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.24 2H8.76004C5.00004 2 4.71004 5.38 6.74004 7.22L17.26 16.78C19.29 18.62 19 22 15.24 22H8.76004C5.00004 22 4.71004 18.62 6.74004 16.78L17.26 7.22C19.29 5.38 19 2 15.24 2Z" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  icon.addEventListener("click", (e) => {
    e.preventDefault();
    const container = createPomodoro();
    // mainDiv.appendChild(container);
  });
  if (!document.querySelector(".timer-ext")) sidbar.prepend(icon);
}

function profileNotSupportedWarning() {
  if (window.location.href.includes("profile.intra")) {
    const mainDiv = document.querySelector(".home-middle-td");
    if (!mainDiv) return;

    if (mainDiv) {
      const warning = document.createElement("div");
      warning.className =
        "bg-yellow-50 border-l-4 border-yellow-400 p-2 flex items-start gap-4 shadow-sm";
      warning.innerHTML = `
        <svg class="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div class="flex-1">
          <h3 class="text-xl font-bold text-yellow-800 mb-1">V2 Profile Not Supported</h3>
          <p class="text-lg text-yellow-700">Please switch to V3 Profile to use this extension.</p>
        </div>
      `;

      mainDiv.prepend(warning);
    }
  }
}

function pleaseLogin() {
  const div = document.querySelector(".App").children[3].children[0];
  if (!div) return;
  const loginMessage = document.createElement("div");
  loginMessage.className = "flex flex-col items-center gap-2 p-3";
  loginMessage.style.cssText = `
    background-color: #1F212A;
  `;

  loginMessage.innerHTML = `
    <p class="text-white text-base font-semibold m-0 text-center">
      Please login to the extension for more features
    </p>
  `;

  div.prepend(loginMessage);
}

function pleaseUpdate() {
  const div = document.querySelector(".App").children[3].children[0];
  if (!div) return;
  const loginMessage = document.createElement("div");
  loginMessage.className = "flex flex-col items-center gap-2 p-3";
  loginMessage.style.cssText = `
    background-color: #1F212A;
  `;

  const extensionId = chrome?.runtime?.id;
  const updateUrl = extensionId
    ? `https://chromewebstore.google.com/detail/${extensionId}`
    : "https://chromewebstore.google.com/";

  loginMessage.innerHTML = `
    <p class="text-white text-base font-semibold m-0 text-center">
      Please update the Chrome extension to continue.
    </p>
    <a
      href="${updateUrl}"
      target="_blank"
      rel="noreferrer"
      class="text-sm font-semibold underline underline-offset-4 text-gray-300 hover:text-white"
    >
      Update extension
    </a>
  `;

  div.prepend(loginMessage);
}

// Usage: Call this function when page loads or via button click
// enableDarkMode();
async function checkpdate() {
  const response = await fetch(`${API_BASE_URL}/api/check-update`);
  if (!response.ok) return false;
  const data = await response.json();

  if (data.update !== null) return true;
  return false;
}

function redisign() {
  const div1 = document.querySelector("header")?.children[0]?.children[0];
  if (!document.querySelector("header")) return;
  const div2 = document.querySelector("header")?.children[0]?.children[1];
  const div3 =
    document?.querySelector("header")?.children[0]?.children[2]?.children[0];
  const div4 =
    document?.querySelector("header")?.children[0]?.children[2]?.children[1];

  div1?.classList.add("backdrop-blur-md", "rounded-4xl", "border-0");
  div2?.classList.add("backdrop-blur-md", "rounded-4xl", "border-0");
  div3
    ?.querySelector("div")
    ?.classList.add("backdrop-blur-md", "rounded-4xl", "border-0");
  div4?.classList.add("backdrop-blur-md", "rounded-4xl", "border-0");

  const bar = document.querySelector("header").querySelectorAll(".mx-2\\.5");
  if (bar) {
    bar.forEach((b) => b.classList.add("rounded-none", "bg-white"));
  }

  const dashes = document
    .querySelector("header")
    .querySelectorAll(".border-dotted");
  if (dashes) {
    dashes.forEach((d) => (d.className = ""));
  }
}
// Run it immediately (and maybe again after a second in case 42 re-renders parts)

async function main() {
  await appendReportBugsFloatingButton();
  await refreshToken();
  if (window.location.href.includes("profile-v3")) {
    // check if the user is logged IN
    const { access_token, refresh_token } = await chrome.storage.local.get([
      "access_token",
      "refresh_token",
    ]);
    if (!access_token && !refresh_token) {
      pleaseLogin();
      return;
    }

    console.log(access_token);

    redisign();
    setTimeout(() => redisign(), 100);
    setTimeout(() => redisign(), 300);
    setTimeout(() => {
      redisign();
    }, 1000);

    const userName = getUserLogin();

    const pref = await loadPreferences();
    console.log(pref);
    loadPrefFromApi().then((data) => {
      updatePreferences(data);
    });

    checkpdate().then((up) => {
      if (up) pleaseUpdate();
    });

    addCustomData({
      email: userName,
      github: "https://www.github.com",
      rank: 120,
    });

    if (pref?.showPomodor) appendTimer();
    // insert the rankink in sidbar
    if (pref?.showRanking) appendRankingIcon();
    // if the tab=leaderboard show leaderboard
    if (getQueryParam("tab") === "leaderboard") showRanking();

    //add sticky note
    if (pref.showNotes) stickyNote();

    // quran verce
    if (pref?.showQuranInFullScreen)
      displayQuranVerse({
        arabic:
          "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
        translation:
          "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.",
        reference: "Surah Al-Baqarah 2:153",
      });

    if (pref?.showQuranWidget) {
      let { quran } = await chrome.storage.local.get("quran");

      if (
        !quran ||
        quran.nextAyahIndex === undefined ||
        quran.nextSurahIndex === undefined
      ) {
        await chrome.storage.local.set({
          quran: {
            nextSurahIndex: 0,
            nextAyahIndex: 0,
          },
        });
        quran = { nextSurahIndex: 0, nextAyahIndex: 0 };
      }

      const verce = getNextAyahs(quran.nextSurahIndex, quran.nextAyahIndex);
      await chrome.storage.local.set({
        quran: {
          nextSurahIndex: verce.nextSurahIndex,
          nextAyahIndex: verce.nextAyahIndex,
        },
      });
      showQuranWidget({
        arabic: verce.ayah,
        translation: "",
        reference: `${verce.surah} ${verce.ayahNumber}`,
      });
    }
  }

  profileNotSupportedWarning();
}
