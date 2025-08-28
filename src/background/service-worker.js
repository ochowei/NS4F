import browser from "webextension-polyfill";

browser.action.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === "ns4f_share") {

        const { content, url, clipboard } = request.data;

        const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
        browser.tabs.create({ url: clipboard, index: currentTab.index });

        // Respond to the content script
        sendResponse({ status: "success", message: "New tab opened" });
        return true; // Indicates that the response is sent asynchronously
    }
});
