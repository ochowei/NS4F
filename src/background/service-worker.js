console.log("NS4F: Service Worker script executing.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ns4f_share") {        
        
        console.log("NS4F: Received share action with data:", request.data);
        const { content, url, clipboard } = request.data;

        chrome.tabs.create({ url: clipboard, index: 1 });  

        // Respond to the content script
        sendResponse({ status: "success", message: "New tab opened" });
        return true; // Indicates that the response is sent asynchronously
    }
});

// Listener for clicks on the extension's toolbar icon
chrome.action.onClicked.addListener((tab) => {
    // When the user clicks the icon, open the options page.
    console.log("NS4F: Action icon clicked. Opening options page.");
    chrome.runtime.openOptionsPage();
});

console.log("NS4F: Service Worker loaded and message listener attached.");
