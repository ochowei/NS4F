console.log("NS4F: Service Worker script executing.");

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ns4f_share") {

        console.log("NS4F: Received share action with data:", request.data);
        const { content, url, clipboard } = request.data;

        browser.tabs.create({ url: clipboard, index: 1 });

        // Respond to the content script
        sendResponse({ status: "success", message: "New tab opened" });
        return true; // Indicates that the response is sent asynchronously
    }
});

console.log("NS4F: Service Worker loaded and message listener attached.");
