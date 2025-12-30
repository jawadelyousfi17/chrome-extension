const campuses = {
  16: "Khouribga",
};
// function that escapes html tags.
function escapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getUserLogin() {
  const userName =
    document.querySelector(".App")?.children[3]?.children[0].children[0]
      ?.children[0]?.children[0]?.children[2]?.children[1].children[1]
      .innerText;

  if (userName.includes(" ")) return userName.split(" ")[1];
  return userName;
}

async function addCustomData({ email, github, rank }) {
  const { access_token, refresh_token } = await chrome.storage.local.get([
    "access_token",
    "refresh_token",
  ]);

  const pref = await loadPreferences();
  const dataDiv =
    document.querySelector(".App")?.children[3]?.children[0]?.children[0]
      ?.children[0]?.children[2];

  const imageDiv =
    document.querySelector(".App")?.children[3]?.children[0]?.children[0]
      ?.children[0].children[0].children[2].children[0].children[0];

  const cover =
    document.querySelector(".App")?.children[3]?.children[0]?.children[0];

  if (!imageDiv || !cover) return;

  const myInfo = await fetchUserInfo();
  if (myInfo.login === getUserLogin()) addEditPenToDiv(imageDiv);

  // imageDiv.style = `background-image: url(""); border-color: rgb(35, 90, 22);`;

  if (!dataDiv || !dataDiv.parentNode) return;

  let data;
  let info = { campus: "", email: "", rank: 0 };
  let socialLinks = {};
  try {
    const login = getUserLogin();

    const response = await fetch(`${API_BASE_URL}/api/user?login=${login}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return;
    const data = await response.json();

    const apiUser = data?.user || {};
    const socialRaw = apiUser.socialLinks ?? apiUser.soacialLinks ?? {};
    if (typeof socialRaw === "string") {
      try {
        socialLinks = JSON.parse(socialRaw);
      } catch {
        socialLinks = {};
      }
    } else {
      socialLinks = socialRaw || {};
    }
    console.log("USER DATA", socialLinks);

    const image = apiUser.avatar;
    if (pref.changeProfile) {
      imageDiv.style = `background-image: url("${image}"); border-color: rgb(35, 90, 22);`;
    }
    if (pref.changeCover) {
      cover.style = `background-image: url("${apiUser.cover}");`;
    }
    info.campus = apiUser.campusId;
    info.email = apiUser.name;
    info.rank = apiUser.rank;
  } catch (error) {
    return;
  }

  // addRankBadgeInProfile(info.rank);

  // const container = dataDiv.parentNode;
  // container.removeChild(dataDiv);

  const div = document.createElement("div");
  div.className =
    "w-full border border-white/10 bg-[#1e2124] rounded-none px-5 py-4 shadow-lg backdrop-blur-sm";

  const normalizedSocial = {
    github: socialLinks?.github || "",
    linkedin: socialLinks?.linkedin || "",
    twitter: socialLinks?.twitter || "",
    instagram: socialLinks?.instagram || "",
  };

  const socialPill = (label, username, href) => {
    // PATCHED: Applied escapeHtml here
    const safeUsername = escapeHtml((username || "").trim());
    
    if (!safeUsername) return "";

    return `<a href="${href}" target="_blank" class="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/20 transition-colors rounded-none" title="${label}: ${safeUsername}">
      <span class="text-gray-500 font-bold">${label}</span>
      <span class="text-gray-200">${safeUsername}</span>
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 4h6m0 0v6m0-6L10 14"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10v10a2 2 0 002 2h10"></path></svg>
    </a>`;
  };

  // PATCHED: Added encodeURIComponent to all URLs below
  const socialPills = [
    socialPill(
      "GitHub",
      normalizedSocial.github,
      `https://github.com/${encodeURIComponent(normalizedSocial.github)}`
    ),
    socialPill(
      "LinkedIn",
      normalizedSocial.linkedin,
      `https://www.linkedin.com/in/${encodeURIComponent(normalizedSocial.linkedin)}`
    ),
    socialPill(
      "Twitter",
      normalizedSocial.twitter,
      `https://twitter.com/${encodeURIComponent(normalizedSocial.twitter)}`
    ),
    socialPill(
      "Instagram",
      normalizedSocial.instagram,
      `https://www.instagram.com/${encodeURIComponent(normalizedSocial.instagram)}`
    ),
  ].filter(Boolean);

  const socialLinksHtml = socialPills.length
    ? `
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Social</span>
        <div class="flex items-center gap-2 flex-wrap">
          ${socialPills.join("")}
        </div>
      </div>
    `
    : "";

  div.innerHTML = `
    
    
    <div class="flex flex-wrap items-center gap-x-10 gap-y-3">
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-gray-400">Rank</span>
        <span class="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)] rounded-none">${info.rank}</span>
      </div>

      

      ${socialLinksHtml}
    </div>
  `;

  const header =
    document.querySelector(".App").children[3].children[0].children[0];

  header.after(div);
}

function addEditPenToDiv(divElement) {
  // Make the div position relative if not already
  if (!divElement.classList.contains("relative")) {
    divElement.classList.add("relative");
  }

  // Create the edit pen button
  const editButton = document.createElement("button");
  editButton.className =
    "absolute bottom-2 right-2 bg-white hover:bg-gray-50 rounded-full p-2 shadow-md border border-gray-200 transition-all duration-200 hover:scale-110 group";
  editButton.title = "Edit profile";

  editButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-600 group-hover:text-[#235a16] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  `;

  editButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`${API_BASE_URL}/preference`, "_blank");

    // Add your edit profile logic here
  });

  divElement.appendChild(editButton);
  return editButton;
}

function addRankBadgeInProfile(rank) {
  const profilePage = document.querySelector(".App").children[3].children[0];
  const profilePicture =
    profilePage.children[0].children[0].children[0].children[2].children[1];
  // Make the profile picture container relative
  // Create the span
  const span = document.createElement("div");
  span.innerText = `#${rank}`;
  span.classList.add(
    "inline-flex",
    "items-center",
    "justify-center",
    "bg-[#4E5566]",
    "text-white",
    "text-sm",
    "font-semibold",
    "rounded-full",
    "px-3",
    "py-1",
    "shadow-md",
    "whitespace-nowrap",
    "text-center"
  );
  profilePicture.prepend(span);
}
