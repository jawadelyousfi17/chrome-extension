// chrome.runtime.onInstalled.addListener((details) => {
//   if (details.reason === "install") {
//     chrome.tabs.create({ url: "popup.html" });
//   }
// });

const CLIENT_ID =
  "u-s4t2ud-37d13c358b8f824d468bb29e001d26022e1ff8e6e2aeb8d7505ae3c014fdaf39";
const CLIENT_SECRET =
  "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";
const AUTH_ENDPOINT = "https://api.intra.42.fr/oauth/authorize";
const TOKEN_ENDPOINT = "https://api.intra.42.fr/oauth/token";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startOAuth") {
    handleOAuth(sendResponse);
    return true; // Keep the message channel open for async response
  }
});

async function handleOAuth(sendResponse) {
  console.log("START AUTH")
  const REDIRECT_URI = chrome.identity.getRedirectURL();
  const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true,
    },
    async function (redirectUrl) {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
        return;
      }

      if (redirectUrl) {
        const url = new URL(redirectUrl);
        const code = url.searchParams.get("code");

        if (code) {
          const params = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: code,
            redirect_uri: REDIRECT_URI,
          });

          try {
            const response = await fetch(TOKEN_ENDPOINT, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: params.toString(),
            });

            const data = await response.json();

            if (data.access_token) {
              await chrome.storage.local.set({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                createdAt: Date.now(),
                preferences: { theme: "light" },
              });

              // Reload current tab
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  if (tabs[0]) {
                    chrome.tabs.reload(tabs[0].id);
                  }
                }
              );

              sendResponse({ success: true });
            } else {
              sendResponse({
                success: false,
                error: "Token exchange failed",
              });
            }
          } catch (err) {
            sendResponse({
              success: false,
              error: "Network error",
            });
          }
        } else {
          sendResponse({
            success: false,
            error: "No authorization code received",
          });
        }
      }
    }
  );
}
