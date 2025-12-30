// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const campuses = {
  16: "Khouribga",
};

// ============================================================================
// DOM SELECTORS
// ============================================================================

const DOMSelectors = {
  getApp: () => document.querySelector(".App"),
  
  getProfileContainer: () => 
    document.querySelector(".App")?.children[3]?.children[0]?.children[0],
  
  getUserName: () =>
    document.querySelector(".App")?.children[3]?.children[0].children[0]
      ?.children[0]?.children[0]?.children[2]?.children[1].children[1],
  
  getDataDiv: () =>
    document.querySelector(".App")?.children[3]?.children[0]?.children[0]
      ?.children[0]?.children[2],
  
  getImageDiv: () =>
    document.querySelector(".App")?.children[3]?.children[0]?.children[0]
      ?.children[0].children[0].children[2].children[0].children[0],
  
  getCover: () =>
    document.querySelector(".App")?.children[3]?.children[0]?.children[0],
  
  getHeader: () =>
    document.querySelector(".App")?.children[3]?.children[0]?.children[0],
  
  getProfilePage: () => 
    document.querySelector(".App")?.children[3]?.children[0],
  
  getProfilePicture: () => {
    const profilePage = DOMSelectors.getProfilePage();
    return profilePage?.children[0]?.children[0]?.children[0]?.children[2]?.children[1];
  },
  
  getCustomProfileDiv: () => 
    document.querySelector('[data-custom-profile]'),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extracts the user login from the DOM
 * @returns {string} The user's login username
 */
function getUserLogin() {
  const userNameElement = DOMSelectors.getUserName();
  const userName = userNameElement?.innerText;
  
  if (!userName) return "";
  
  if (userName.includes(" ")) {
    return userName.split(" ")[1];
  }
  return userName;
}

/**
 * Checks if currently viewing another user's profile
 * @returns {boolean} True if URL contains /users/
 */
function isViewingOtherProfile() {
  return window.location.href.includes('/users/');
}

/**
 * Parses social links from various formats
 * @param {Object|string} socialRaw - Raw social links data
 * @returns {Object} Normalized social links object
 */
function parseSocialLinks(socialRaw) {
  if (typeof socialRaw === "string") {
    try {
      return JSON.parse(socialRaw);
    } catch {
      return {};
    }
  }
  return socialRaw || {};
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetches user data from the API
 * @param {string} login - User login
 * @param {string} accessToken - Access token for authentication
 * @returns {Promise<Object>} User data from API
 */
async function fetchUserData(login, accessToken) {
  const response = await fetch(
    `${API_BASE_URL}/api/user?login=${encodeURIComponent(login)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.user;
}

/**
 * Fetches user data with caching strategy
 * @param {string} login - User login
 * @param {string} accessToken - Access token
 * @returns {Promise<Object>} User data
 */
async function getUserDataWithCache(login, accessToken) {
  let { userData } = await chrome.storage.local.get("userData");

  if (!userData) {
    userData = await fetchUserData(login, accessToken);
    await chrome.storage.local.set({ userData });
  }

  return userData;
}

/**
 * Updates cached user data in background
 * @param {string} login - User login
 * @param {string} accessToken - Access token
 * @param {Function} onUpdate - Callback when fresh data is received
 */
function updateUserDataInBackground(login, accessToken, onUpdate) {
  fetchUserData(login, accessToken)
    .then(async (userData) => {
      await chrome.storage.local.set({ userData });
      if (onUpdate) {
        onUpdate(userData);
      }
    })
    .catch((err) => {
      console.error("Failed to fetch fresh user data:", err);
    });
}

// ============================================================================
// UI RENDERING FUNCTIONS
// ============================================================================

/**
 * Creates a social link pill HTML
 * @param {string} label - Social platform label
 * @param {string} username - Username on the platform
 * @param {string} href - Link URL
 * @returns {string} HTML string for the social pill
 */
function createSocialPill(label, username, href) {
  const safeUsername = (username || "").trim();
  if (!safeUsername) return "";

  return `
    <a href="${href}" target="_blank" 
       class="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/20 transition-colors rounded-none" 
       title="${label}: ${safeUsername}">
      <span class="text-gray-500 font-bold">${label}</span>
      <span class="text-gray-200">${safeUsername}</span>
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 4h6m0 0v6m0-6L10 14"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10v10a2 2 0 002 2h10"></path>
      </svg>
    </a>
  `;
}

/**
 * Generates social links HTML section
 * @param {Object} socialLinks - Social links object
 * @returns {string} HTML string for social links section
 */
function generateSocialLinksHTML(socialLinks) {
  const normalizedSocial = {
    github: socialLinks?.github || "",
    linkedin: socialLinks?.linkedin || "",
    twitter: socialLinks?.twitter || "",
    instagram: socialLinks?.instagram || "",
  };

  const socialPills = [
    createSocialPill(
      "GitHub",
      normalizedSocial.github,
      `https://github.com/${normalizedSocial.github}`
    ),
    createSocialPill(
      "LinkedIn",
      normalizedSocial.linkedin,
      `https://www.linkedin.com/in/${normalizedSocial.linkedin}`
    ),
    createSocialPill(
      "Twitter",
      normalizedSocial.twitter,
      `https://twitter.com/${normalizedSocial.twitter}`
    ),
    createSocialPill(
      "Instagram",
      normalizedSocial.instagram,
      `https://www.instagram.com/${normalizedSocial.instagram}`
    ),
  ].filter(Boolean);

  if (!socialPills.length) return "";

  return `
    <div class="flex items-center gap-3 flex-wrap">
      <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Social</span>
      <div class="flex items-center gap-2 flex-wrap">
        ${socialPills.join("")}
      </div>
    </div>
  `;
}

/**
 * Updates profile image and cover
 * @param {Object} userData - User data containing avatar and cover
 * @param {Object} preferences - User preferences
 */
function updateProfileImages(userData, preferences) {
  const imageDiv = DOMSelectors.getImageDiv();
  const cover = DOMSelectors.getCover();

  if (preferences.changeProfile && imageDiv && userData.avatar) {
    imageDiv.style.backgroundImage = `url("${userData.avatar}")`;
    imageDiv.style.borderColor = "rgb(35, 90, 22)";
  }

  if (preferences.changeCover && cover && userData.cover) {
    // Use !important to override any inline styles that might be applied later
    cover.style.setProperty('background-image', `url("${userData.cover}")`, 'important');
  }
}

/**
 * Sets up a MutationObserver to prevent cover image from being reset
 * @param {Object} userData - User data containing cover
 * @param {Object} preferences - User preferences
 * @returns {MutationObserver} The observer instance
 */
function setupCoverImageProtection(userData, preferences) {
  if (!preferences.changeCover || !userData.cover) return null;

  const cover = DOMSelectors.getCover();
  if (!cover) return null;

  const targetCoverUrl = `url("${userData.cover}")`;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const currentBg = cover.style.backgroundImage;
        if (currentBg !== targetCoverUrl) {
          cover.style.setProperty('background-image', targetCoverUrl, 'important');
        }
      }
    });
  });

  observer.observe(cover, {
    attributes: true,
    attributeFilter: ['style']
  });

  return observer;
}

/**
 * Renders user profile data to the DOM
 * @param {Object} userData - User data to render
 * @param {Object} preferences - User preferences
 * @param {MutationObserver} existingObserver - Existing observer to disconnect
 * @returns {MutationObserver} New observer instance
 */
function renderUserData(userData, preferences, existingObserver = null) {
  // Disconnect existing observer if any
  if (existingObserver) {
    existingObserver.disconnect();
  }

  // Update profile images
  updateProfileImages(userData, preferences);

  // Set up protection against cover image being reset
  const newObserver = setupCoverImageProtection(userData, preferences);

  // Parse social links
  const socialRaw = userData.socialLinks ?? userData.soacialLinks ?? {};
  const socialLinks = parseSocialLinks(socialRaw);

  // Prepare user info
  const info = {
    campus: userData.campusId,
    email: userData.name,
    rank: userData.rank,
  };

  // Remove existing custom div if it exists
  const existingDiv = DOMSelectors.getCustomProfileDiv();
  if (existingDiv) {
    existingDiv.remove();
  }

  // Create new profile info div
  const div = document.createElement("div");
  div.setAttribute("data-custom-profile", "true");
  div.className =
    "w-full border border-white/10 bg-[#1e2124] rounded-none px-5 py-4 shadow-lg backdrop-blur-sm";

  const socialLinksHtml = generateSocialLinksHTML(socialLinks);

  div.innerHTML = `
    <div class="flex flex-wrap items-center gap-x-10 gap-y-3">
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-gray-400">Rank</span>
        <span class="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)] rounded-none">${info.rank}</span>
      </div>
      ${socialLinksHtml}
    </div>
  `;

  const header = DOMSelectors.getHeader();
  if (header) {
    header.after(div);
  }

  return newObserver;
}

/**
 * Adds edit button to profile image
 * @param {HTMLElement} divElement - The div to add the button to
 * @returns {HTMLElement} The created edit button
 */
function addEditPenToDiv(divElement) {
  if (!divElement.classList.contains("relative")) {
    divElement.classList.add("relative");
  }

  const editButton = document.createElement("button");
  editButton.className =
    "absolute bottom-2 right-2 bg-white hover:bg-gray-50 rounded-full p-2 shadow-md border border-gray-200 transition-all duration-200 hover:scale-110 group";
  editButton.title = "Edit profile";

  editButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" 
         class="w-4 h-4 text-gray-600 group-hover:text-[#235a16] transition-colors" 
         fill="none" 
         viewBox="0 0 24 24" 
         stroke="currentColor">
      <path stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  `;

  editButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`${API_BASE_URL}/preference`, "_blank");
  });

  divElement.appendChild(editButton);
  return editButton;
}

/**
 * Adds rank badge to profile picture
 * @param {number} rank - User's rank
 */
function addRankBadgeInProfile(rank) {
  const profilePicture = DOMSelectors.getProfilePicture();
  if (!profilePicture) return;

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

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Main function to add custom profile data to the page
 * @param {Object} params - Parameters (legacy, not used)
 */
async function addCustomData({ email, github, rank } = {}) {
  let coverObserver = null;

  try {
    // Get authentication tokens
    const { access_token, refresh_token } = await chrome.storage.local.get([
      "access_token",
      "refresh_token",
    ]);

    // Load user preferences
    const pref = await loadPreferences();

    // Validate required DOM elements exist
    const dataDiv = DOMSelectors.getDataDiv();
    const imageDiv = DOMSelectors.getImageDiv();
    const cover = DOMSelectors.getCover();

    if (!imageDiv || !cover || !dataDiv || !dataDiv.parentNode) {
      console.warn("Required DOM elements not found");
      return;
    }

    // Add edit button if viewing own profile
    const myInfo = await fetchUserInfo();
    const login = getUserLogin();
    
    if (myInfo.login === login) {
      addEditPenToDiv(imageDiv);
    }

    // Determine data fetching strategy based on profile being viewed
    if (isViewingOtherProfile()) {
      // Viewing another user's profile - always fetch fresh data, no caching
      const userData = await fetchUserData(login, access_token);
      coverObserver = renderUserData(userData, pref);
      
    } else {
      // Viewing own profile - use cache-then-refresh strategy
      
      // 1. Load cached data and render immediately for fast display
      const cachedUserData = await getUserDataWithCache(login, access_token);
      coverObserver = renderUserData(cachedUserData, pref);

      // 2. Fetch fresh data in background and update when ready
      updateUserDataInBackground(login, access_token, (freshUserData) => {
        coverObserver = renderUserData(freshUserData, pref, coverObserver);
      });
    }

  } catch (error) {
    console.error("Error in addCustomData:", error);
  }
}