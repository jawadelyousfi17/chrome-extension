function getCookie(name) {}
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Waits for an element to appear in the DOM
 * @param {string} selector - CSS selector to wait for (e.g., ".profile-card")
 * @return {Promise<Element>}
 */
function waitForElement(element) {
  return new Promise((resolve) => {
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver((mutations) => {
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
