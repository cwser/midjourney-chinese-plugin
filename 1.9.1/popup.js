document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("toggle");

  chrome.storage.local.get(["mjTranslateEnabled"], (res) => {
    toggle.checked = res.mjTranslateEnabled !== false;
  });

  toggle.addEventListener("change", () => {
    chrome.storage.local.set({ mjTranslateEnabled: toggle.checked });
  });
});