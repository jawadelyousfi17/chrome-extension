const DEFAULT_PREFERENCES = {
  changeProfile: true,
  changeCover: true,
  showQuranInFullScreen: false,
  showQuranWidget: true,
  showRanking: true,
  showPomodor: true,
  showNotes: true,
};

/**
 * Loads preferences from storage, merging with defaults.
 * @returns {Promise<Object>} Resolves with the preferences object.
 */
function loadPreferences() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["userPreferences"], (result) => {
      const prefs = {
        ...DEFAULT_PREFERENCES,
        ...(result.userPreferences || {}),
      };
      // If storage was empty or missing keys, save the merged version
      if (!result.userPreferences) {
        chrome.storage.local.set({ userPreferences: prefs });
      }
      resolve(prefs);
    });
  });
}

async function loadPrefFromApi() {
  try {
    await refreshToken();

    const { access_token } = await chrome.storage.local.get(["access_token"]);

    const userD = await getUserDataWithCache();
    const login = userD.login;

    if (!userD || !login) {
      return null;
    }

    if (!access_token) {
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/preferences?login=${login}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Updates one or more preferences.
 * @param {Object} updates - Object containing keys and values to update.
 * @returns {Promise<Object>} Resolves with the updated preferences object.
 */
function updatePreferences(updates) {
  return new Promise((resolve) => {
    chrome.storage.local.get(["userPreferences"], (result) => {
      const currentPrefs = {
        ...DEFAULT_PREFERENCES,
        ...(result.userPreferences || {}),
      };
      const newPrefs = { ...currentPrefs, ...updates };

      chrome.storage.local.set({ userPreferences: newPrefs }, () => {
        // Dispatch a custom event so other parts of the app can react
        window.dispatchEvent(
          new CustomEvent("preferencesUpdated", { detail: newPrefs })
        );
        resolve(newPrefs);
      });
    });
  });
}

// Expose to window for global access
window.loadPreferences = loadPreferences;
window.updatePreferences = updatePreferences;
window.DEFAULT_PREFERENCES = DEFAULT_PREFERENCES;
