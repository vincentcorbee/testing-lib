let isActive = false;

chrome.action.onClicked.addListener((tab) => {
  if (!isActive) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['console.snippet.js'],
    });
    isActive = true;
  } else {
    isActive = false;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log(tab);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('activeInfo', activeInfo);
});

chrome.webNavigation.onDOMContentLoaded.addListener((details) => {
  if (!isActive) return;

  chrome.scripting.executeScript({
    target: { tabId: details.tabId },
    files: ['console.snippet.js'],
  });
});
