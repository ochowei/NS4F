console.log("NS4F: Service Worker script executing.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ns4f_share") {
        console.log("NS4F: Received share action with data:", request.data);

        const { content, url } = request.data;

        // Encode the parameters to safely pass them in the URL
        const encodedContent = encodeURIComponent(content);
        const encodedUrl = encodeURIComponent(url);

        const popupUrl = chrome.runtime.getURL('src/popup/popup.html');

        // Create a new window for our popup
        chrome.windows.create({
            url: `${popupUrl}?content=${encodedContent}&url=${encodedUrl}`,
            type: 'popup',
            width: 400,
            height: 300
        }, (window) => {
            console.log("NS4F: Popup window created.", window);
        });

        // Respond to the content script
        sendResponse({ status: "success", message: "Popup opened" });
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
