async function start() {
  let counter = 0;
  function ___try___() {
    counter++;
    const dataDiv =
      document.querySelector(".App")?.children[3]?.children[0]?.children[0]
        ?.children[0]?.children[2];
    const found = dataDiv?.nodeName === "DIV";
    if (!found) {
      const timer = setTimeout(() => {
        ___try___();
        return;
      }, 100);
      if (counter > 500) {
        clearTimeout(timer);
        return;
      }
    } else main();
  }
  ___try___();
}

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
