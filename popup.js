var loggedIn = false;

document.addEventListener("DOMContentLoaded", async function () {
  await login();
  if (loggedIn) {
    await addProfileData();
  }
  // console.log(window.loadPreferences);
});

function formatClasses(a) {
  return a.split();
}

async function login() {
  const loginBtn = document.getElementById("loginBtn");
  const messageDisplay = document.getElementById("message");
  const notLoggedInDiv = document.getElementById("not-logged-in");

  const { access_token, refresh_token } = await chrome.storage.local.get([
    "access_token",
    "refresh_token",
  ]);

  if (access_token && refresh_token) {
    loggedIn = true;
    loginBtn.style.display = "none";
    messageDisplay.textContent = "You are logged in already";
    notLoggedInDiv.style.display = "none";
  }

  // Login button handler
  loginBtn.addEventListener("click", function () {
    // Show loading state
    const originalText = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = `
      <span style="display: inline-flex; align-items: center; gap: 8px;">
        <svg style="animation: spin 1s linear infinite; width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"/>
        </svg>
        Loading...
      </span>
    `;

    // Add keyframe animation for spinner
    if (!document.getElementById("spinner-style")) {
      const style = document.createElement("style");
      style.id = "spinner-style";
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // 1. Get your Client ID and Secret from the 42 API (or your provider)
    // 2. Set the Redirect URI in your provider settings to:
    //    https://<your-extension-id>.chromiumapp.org/
    //    (You can find your extension ID in chrome://extensions/)

    const CLIENT_ID =
      "u-s4t2ud-37d13c358b8f824d468bb29e001d26022e1ff8e6e2aeb8d7505ae3c014fdaf39";
    const CLIENT_SECRET =
      "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"; // ⚠️ WARNING: Storing secrets in extensions is not secure for public distribution
    const REDIRECT_URI = chrome.identity.getRedirectURL();

    // 42 API Endpoints (Example)
    const AUTH_ENDPOINT = "https://api.intra.42.fr/oauth/authorize";
    const TOKEN_ENDPOINT = "https://api.intra.42.fr/oauth/token";

    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      function (redirectUrl) {
        if (chrome.runtime.lastError) {
          // Reset button on error
          loginBtn.disabled = false;
          loginBtn.innerHTML = originalText;
          messageDisplay.textContent =
            "Error: " + chrome.runtime.lastError.message;
          return;
        }

        if (redirectUrl) {
          const url = new URL(redirectUrl);
          const code = url.searchParams.get("code");

          if (code) {
            fetch(TOKEN_ENDPOINT, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                grant_type: "authorization_code",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI,
              }),
            })
              .then((res) => res.json())
              .then(async (data) => {
                console.log("Access Token:", data.access_token);

                if (data.access_token) {
                  await chrome.storage.local.set({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    createdAt: Date.now(),
                    preferences: { theme: "light" },
                  });

                  loggedIn = true;

                  messageDisplay.textContent = "Login Successful!";

                  // Reload current tab
                  chrome.tabs.query(
                    { active: true, currentWindow: true },
                    (tabs) => {
                      if (tabs[0]) {
                        chrome.tabs.reload(tabs[0].id);
                      }
                    }
                  );

                  // Reload popup
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                } else {
                  // Reset button on token exchange failure
                  loginBtn.disabled = false;
                  loginBtn.innerHTML = originalText;
                  messageDisplay.textContent = "Token exchange failed.";
                  console.error(data);
                }
              })
              .catch((err) => {
                // Reset button on network error
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
                messageDisplay.textContent = "Network error.";
                console.error(err);
              });
          }
        }
      }
    );
  });
}

async function addProfileData() {
  const profileDiv = document.getElementById("logged-in");

  const userData = await fetchUserInfo();

  if (!userData) {
    profileDiv.innerHTML = "<p>Failed to load user data</p>";
    return;
  }

  const fullName = userData.displayname;
  const login = userData.login;
  const avatar = userData.image.link;

  // Insert user data into profile div
  profileDiv.innerHTML = `
    <div class="profile-container">
      <div class="profile-header">
        <img src="${avatar}" alt="${login}" class="profile-avatar" />
        <div class="profile-info">
          <h2 class="profile-name">${fullName}</h2>
          <p class="profile-login">@${login}</p>
        </div>
      </div>
      
      <div class="button-group">
        <button id="intraSettingsBtn" class="action-button">Customize</button>
        <button id="logoutBtn" class="logout-button">Log Out</button>
      </div>
              <button id="force-sync" class="logout-button">Force sync preferences</button>

    </div>
  `;

  // Add intra settings button handler
  document.getElementById("intraSettingsBtn").addEventListener("click", () => {
    window.open("https://improved-1337.vercel.app/preference", "_blank");
  });

  document.getElementById("force-sync").addEventListener("click", async () => {
    const syncBtn = document.getElementById("force-sync");
    const originalText = syncBtn.innerHTML;

    // Add keyframe animation for spinner if not already added
    if (!document.getElementById("spinner-style")) {
      const style = document.createElement("style");
      style.id = "spinner-style";
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // Show loading state
    syncBtn.disabled = true;
    syncBtn.innerHTML = `
      <span style="display: inline-flex; align-items: center; gap: 8px;">
        <svg style="animation: spin 1s linear infinite; width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"/>
        </svg>
        Syncing...
      </span>
    `;

    try {
      const data = await loadPrefFromApi();
      await updatePreferences(data);

      // Reload current tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });

      // Reload popup
      setTimeout(() => {
        window.location.reload();
      }, 50);
    } catch (error) {
      console.error("Sync failed:", error);
      syncBtn.disabled = false;
      syncBtn.innerHTML = originalText;
    }
  });

  // Add logout button handler
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await chrome.storage.local.clear();
    window.location.reload();
  });
}

async function fetchUserInfo() {
  const { user } = await chrome.storage.local.get("user");
  if (user) {
    return user;
  }

  const token = (await chrome.storage.local.get(["access_token"])).access_token;

  if (!token) {
    console.warn("No access token found.");
    return null;
  } else {
    console.log("Tokens found");
  }

  try {
    let response = await fetch("https://api.intra.42.fr/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      try {
        token = await refreshToken();
      } catch (error) {
        throw new Error(`Error refreshing the token `);
      }

      response = await fetch("https://api.intra.42.fr/v2/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const userData = await response.json();

    await chrome.storage.local.set({
      user: userData,
    });

    return userData;
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
}

// async function renderPreferences() {
//   const profileDiv = document.getElementById("logged-in");
//   const prefs = await window.loadPreferences();

//   const prefContainer = document.createElement("div");
//   prefContainer.className = "preferences-container";

//   const title = document.createElement("h3");
//   title.innerText = "Preferences";
//   title.className = "preferences-title";
//   prefContainer.appendChild(title);

//   const labels = {
//     changeProfile: "Change Profile Picture",
//     changeCover: "Change Cover Image",
//     showQuranInFullScreen: "Show Quran (Full Screen)",
//     showQuranWidget: "Show Quran Widget",
//     showRanking: "Show Ranking",
//     showPomodor: "Show Pomodoro Timer",
//     showNotes: "Show Sticky Notes",
//   };

//   for (const [key, label] of Object.entries(labels)) {
//     const row = document.createElement("div");
//     row.className = "preference-row";

//     const text = document.createElement("span");
//     text.innerText = label;
//     text.className = "preference-label";

//     const toggle = document.createElement("label");
//     toggle.className = "switch";

//     const input = document.createElement("input");
//     input.type = "checkbox";
//     input.checked = prefs[key];

//     const slider = document.createElement("span");
//     slider.className = "slider";

//     toggle.appendChild(input);
//     toggle.appendChild(slider);

//     input.addEventListener("change", async (e) => {
//       const checked = e.target.checked;
//       await window.updatePreferences({ [key]: checked });
//     });

//     row.appendChild(text);
//     row.appendChild(toggle);
//     prefContainer.appendChild(row);
//   }

//   profileDiv.appendChild(prefContainer);

//   toggle.appendChild(input);
//   toggle.appendChild(slider);

//   input.addEventListener("change", async (e) => {
//     const checked = e.target.checked;
//     slider.style.backgroundColor = checked ? "#4E5567" : "#1F212A";
//     knob.style.left = checked ? "22px" : "2px";
//     await window.updatePreferences({ [key]: checked });
//   });

//   row.appendChild(text);
//   row.appendChild(toggle);
//   prefContainer.appendChild(row);

//   profileDiv.appendChild(prefContainer);
// }
