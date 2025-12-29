let isFetching = false;

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
