import browser from "webextension-polyfill";

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

                item.addEventListener('click', (event) => {
                    const postDetails = getPostDetails(event.target);
                    setTimeout(() => {
                        try {
                            navigator.clipboard.readText().then(text => {
                                postDetails.clipboard = text;
                                browser.runtime.sendMessage({
                                    action: "ns4f_share",
                                    data: postDetails
                                }).then(response => {
                                }).catch(error => {
                                    console.error("NS4F: Message sending failed:", error);
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
            }
        } catch (e) {
            console.error("NS4F: Error parsing WhatsApp link:", e);
        }
    }

    if (!postUrl) {
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
        content = contentElement.innerText;
    } else {
        contentElement = dialog.querySelector('div[data-ad-preview="message"]');
        if (contentElement) {
            content = contentElement.innerText;
        }
    }

    return {
        content: content.trim(),
        url: postUrl
    };
}

function initialize() {
    browser.storage.sync.get({
        language: 'auto'
    }).then(items => {
        switch (items.language) {
            case 'en':
                copyLinkButtonText = 'Copy link';
                break;
            case 'zh_TW':
                copyLinkButtonText = '複製連結';
                break;
            case 'auto':
            default:
                copyLinkButtonText = browser.i18n.getMessage("copy_link_button_text");
                break;
        }

        // Now that we have the text, start observing the DOM
        const observer = new MutationObserver(handleDomChanges);
        const config = {
            childList: true,
            subtree: true
        };
        observer.observe(document.body, config);

        // Initial check in case the dialog is already open
        findAndHijackCopyLinkButton();
    });
}

initialize();
