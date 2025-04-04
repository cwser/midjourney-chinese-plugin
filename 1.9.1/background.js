chrome.action.onClicked.addListener(async (tab) => {
  chrome.storage.local.get(["mjTranslateEnabled"], (res) => {
    const current = res.mjTranslateEnabled !== false;
    chrome.storage.local.set({ mjTranslateEnabled: !current }, () => {
      chrome.action.setTitle({
        tabId: tab.id,
        title: !current ? "MidJourney 翻译开启" : "MidJourney 翻译关闭"
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
    });
  });
});