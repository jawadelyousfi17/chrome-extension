function getUsernameSimple(url) {
  const username = url.split("/").pop();
  return username;
}

function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = reject;
    img.src = url;
  });
}

async function getUserData() {
  const { access_token, refresh_token } = await chrome.storage.local.get([
    "access_token",
    "refresh_token",
  ]);

  const login = getUsernameSimple(window.location.href);
  const response = await fetch(`${API_BASE_URL}/api/user?login=${login}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("HERE");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  await chrome.storage.local.set({ userA: { ...data.user } });
  return data.user;
}

async function start() {
  if (!window.location.href.includes("profile-v3.intra.42.fr")) {
    return;
  }
  let profileUri = null;
  let coverUri = null;
  if (window.location.href.includes("/users/")) {
    getUserData().then(async (user) => {
      profileUri = user.avatar;
      coverUri = user.cover;
      await preloadImage(coverUri);
      await preloadImage(profileUri);
    });
  } else {
    let { userData } = await chrome.storage.local.get("userData");
    if (userData) {
      profileUri = userData.avatar;
      coverUri = userData.cover;
      await preloadImage(coverUri);
      await preloadImage(profileUri);
    }
  }
  let counter = 0;
  function ___try___() {
    const div =
      document.querySelector(".App")?.children[3]?.children[0]?.children[0]
        ?.children[0]?.children[0]?.children[2]?.children[0]?.children[0];
    const coverDiv =
      document.querySelector(".App")?.children[3]?.children[0]?.children[0];
    if (div) {
      div.style.backgroundImage = `url("${profileUri}"`;
    }
    if (coverDiv) {
      coverDiv.style.backgroundImage = `url("${coverDiv}"`;
    }

    counter++;
    const dataDiv =
      document.querySelector(".App")?.children[3]?.children[0]?.children[0]
        ?.children[0]?.children[2];
    const found = dataDiv?.nodeName === "DIV";
    if (!found) {
      const timer = setTimeout(() => {
        ___try___();
        return;
      }, 1);
      if (counter > 5000) {
        clearTimeout(timer);
        return;
      }
    } else {
      main();
    }
  }
  ___try___();
}
// start();

if (document && document.readyState === "complete") {
  start();
  if (!window.location.href.includes("profile")) {
    main();
  }
} else {
  window.addEventListener("load", () => {
    start();
    if (!window.location.href.includes("profile-v3")) {
      main();
    }
  });
}
