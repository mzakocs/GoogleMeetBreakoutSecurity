/* FUNCTION DECLARATIONS */
// Changes the meeting code on a Google Meet tab
let changeMeetingCode = (code) => {
  // Grabs the current URL
  chrome.tabs.query({
    url: "*://meet.google.com/*"
  }, function (tabs) {
    if (tabs.length > 0) {
      // Grabs info from the grabbed tab
      let tab = tabs[0];
      let id = tab.id;
      let url = tab.url;
      // Replaces the code in the URL
      let splitUrl = url.split("/");
      let urlParams = splitUrl[splitUrl.length - 1];
      let splitUrlParams = urlParams.split("?");
      splitUrlParams[0] = code;
      splitUrl[splitUrl.length - 1] = splitUrlParams.join("?")
      let finalUrl = splitUrl.join("/");
      // Navigates to the new meeting link
      chrome.tabs.update(id, {
        url: finalUrl,
        active: true
      });
    }
  });
}

// Removes the "Join a breakout room" modal popup
let modalRemoval = () => {
  chrome.tabs.query({
    url: "*://meet.google.com/*"
  }, function (tabs) {
    if (tabs.length > 0) {
      // Grabs info from the grabbed tab
      let tab = tabs[0];
      let id = tab.id;
      // Injects the modal removal script
      chrome.tabs.executeScript(id, {
        file: "injectables/removeModal.js"
      });
    }
  });
}

/* RUNNING CODE STARTS HERE */
// Allows popup.js to run methods in the background, mainly important injection tasks
chrome.extension.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (!msg || !msg.includes("{")) return false;
    let json = JSON.parse(msg);
    switch (json.type) {
      case "changeMeetingCode":
        changeMeetingCode(json.code);
        break;
      case "modalRemoval":
        modalRemoval();
        break;
    }
    port.postMessage("success");
  });
});