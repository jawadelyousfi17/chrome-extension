async function refreshToken() {
  const refreshToken = (
    await chrome.storage.local.get(["refresh_token", "userId"])
  ).refresh_token;

  if (!refreshToken) {
    // throw new Error("No refresh token found");
    return;
  }

  const { createdAt } = await chrome.storage.local.get("createdAt");
  const diffInSeconds = (Date.now() - createdAt) / 1000;

  console.log("CREATED AT ", createdAt);

  if (diffInSeconds < 100 * 60) return;

  const CLIENT_ID =
    "u-s4t2ud-37d13c358b8f824d468bb29e001d26022e1ff8e6e2aeb8d7505ae3c014fdaf39";
  const CLIENT_SECRET =
    "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";
  const TOKEN_ENDPOINT = "https://api.intra.42.fr/oauth/token";

  const refreshResponse = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!refreshResponse.ok) {
    throw new Error("Failed to refresh token");
  }

  const tokens = await refreshResponse.json();

  const token = tokens.access_token;

  await chrome.storage.local.set({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    createdAt: Date.now(),
    preferences: { theme: "light" },
  });
  return token;
}

async function isLoggedIn() {
  // let access_token = getCookie("access_token");
  const access_token = (await chrome.storage.local.get(["access_token"]))
    .access_token;

  if (!access_token) {
    try {
      access_token = await refreshToken();
    } catch (error) {
      return false;
    }
  }

  const TOKEN_ENDPOINT = "https://api.intra.42.fr/oauth/token/info";

  let response = await fetch(TOKEN_ENDPOINT, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (response.ok) {
    return true;
  }

  try {
    await refreshToken();
    return true;
  } catch (error) {
    return false;
  }
}
