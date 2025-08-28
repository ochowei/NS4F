import browser from "webextension-polyfill";

console.log("NS4F: Service Worker script executing.");

browser.action.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "ns4f_share") {

        console.log("NS4F: Received share action with data:", request.data);
        const { content, url, clipboard } = request.data;

        const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
        browser.tabs.create({ url: clipboard, index: currentTab.index });

        // Respond to the content script
        sendResponse({ status: "success", message: "New tab opened" });
        return true; // Indicates that the response is sent asynchronously
    }
});

console.log("NS4F: Service Worker loaded and message listener attached.");
