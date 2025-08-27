console.log("NS4F: Content Script executing.");

let copyLinkButtonText;
const SHARE_DIALOG_SELECTOR = 'div[role="dialog"]';

function findAndHijackCopyLinkButton() {
    const dialogs = document.querySelectorAll(SHARE_DIALOG_SELECTOR);

    dialogs.forEach(dialog => {
        const listItems = dialog.querySelectorAll('div[role="listitem"]');
        listItems.forEach(item => {
            const text = item.textContent || "";
            if (text.includes(copyLinkButtonText)) {
                if (item.dataset.ns4fHijacked) {
                    return;
                }
                item.dataset.ns4fHijacked = 'true';
                console.log(`NS4F: Found "${copyLinkButtonText}" button. Hijacking now.`);

                item.addEventListener('click', (event) => {
                    console.log('NS4F: Hijacked "Copy link" button clicked!');
                    const postDetails = getPostDetails(event.target);
                    setTimeout(() => {
                        try {
                            navigator.clipboard.readText().then(text => {
                                postDetails.clipboard = text;
                                chrome.runtime.sendMessage({
                                    action: "ns4f_share",
                                    data: postDetails
                                }, (response) => {
                                    if (chrome.runtime.lastError) {
                                        console.error("NS4F: Message sending failed:", chrome.runtime.lastError);
                                    } else {
                                        console.log("NS4F: Message sent successfully, response:", response);
                                    }
                                });
                            }).catch(err => {
                                console.error(err);
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    }, 200);
                }, true);
            }
        });
    });
}

function handleDomChanges(mutationsList, observer) {
    findAndHijackCopyLinkButton();
}

function getPostDetails(buttonElement) {
    const dialog = buttonElement.closest('div[role="dialog"]');
    if (!dialog) {
        console.error("NS4F: Could not find parent dialog for the share button.");
        return { content: '無法找到貼文對話框。', url: window.location.href };
    }

    let postUrl = '';
    const whatsAppAnchor = Array.from(dialog.querySelectorAll('a')).find(a => a.href.includes('wa.me'));
    if (whatsAppAnchor && whatsAppAnchor.href) {
        try {
            const urlParams = new URLSearchParams(new URL(whatsAppAnchor.href).search);
            const textParam = urlParams.get('text');
            if (textParam) {
                postUrl = textParam;
                console.log(`NS4F: Extracted URL from WhatsApp link: ${postUrl}`);
            }
        } catch (e) {
            console.error("NS4F: Error parsing WhatsApp link:", e);
        }
    }

    if (!postUrl) {
        console.log("NS4F: Could not find or parse WhatsApp link, falling back to previous method.");
        const timeLink = dialog.querySelector('a[href*="/posts/"], a[href*="/videos/"], a[href*="/photos/"]');
        if (timeLink && timeLink.href) {
            postUrl = timeLink.href;
        } else {
            postUrl = window.location.href;
        }
    }

    let content = '無法自動擷取內容。';
    let contentElement = document.querySelector('span[data-ad-rendering-role="description"]');
    if (contentElement) {
        console.log("NS4F: Extracted content using 'description' role from document.");
        content = contentElement.innerText;
    } else {
        console.log("NS4F: Could not find content with 'description' role, falling back to 'message' preview within dialog.");
        contentElement = dialog.querySelector('div[data-ad-preview="message"]');
        if (contentElement) {
            console.log("NS4F: Extracted content using 'message' preview fallback.");
            content = contentElement.innerText;
        }
    }

    return {
        content: content.trim(),
        url: postUrl
    };
}

function initialize() {
    chrome.storage.sync.get({
        language: 'auto'
    }, function(items) {
        console.log(`NS4F: Language setting is "${items.language}"`);
        switch (items.language) {
            case 'en':
                copyLinkButtonText = 'Copy link';
                break;
            case 'zh_TW':
                copyLinkButtonText = '複製連結';
                break;
            case 'auto':
            default:
                copyLinkButtonText = chrome.i18n.getMessage("copy_link_button_text");
                break;
        }
        console.log(`NS4F: Using "${copyLinkButtonText}" as button text.`);

        // Now that we have the text, start observing the DOM
        const observer = new MutationObserver(handleDomChanges);
        const config = {
            childList: true,
            subtree: true
        };
        observer.observe(document.body, config);
        console.log("NS4F: MutationObserver is now watching the DOM.");

        // Initial check in case the dialog is already open
        findAndHijackCopyLinkButton();
    });
}

initialize();
