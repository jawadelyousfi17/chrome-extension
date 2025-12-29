async function login() {
  console.log("DIEHFJEJ");
  const loginBtn = document.getElementById("loginBtn");
  const messageDisplay = document.getElementById("message");

  const { access_token, refresh_token } = await chrome.storage.local.get([
    "access_token",
    "refresh_token",
  ]);

  if (access_token && refresh_token) {
    loginBtn.style.display = "none";
    messageDisplay.textContent = "You are logged in already";
  }

  // Login button handler
  loginBtn.addEventListener("click", function () {
    // 1. Get your Client ID and Secret from the 42 API (or your provider)
    // 2. Set the Redirect URI in your provider settings to:
    //    https://<your-extension-id>.chromiumapp.org/
    //    (You can find your extension ID in chrome://extensions/)

    const CLIENT_ID =
      "u-s4t2ud-1b7f86118bbe9bce0c0f5badf2b0d4d16d44f613c94c09fb0aec221f5beefd76";
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
                    preferences: { theme: "light" },
                  });

                  messageDisplay.textContent = "Login Successful!";
                } else {
                  messageDisplay.textContent = "Token exchange failed.";
                  console.error(data);
                }
              })
              .catch((err) => {
                messageDisplay.textContent = "Network error.";
                console.error(err);
              });
          }
        }
      }
    );
  });
}
