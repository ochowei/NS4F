console.log("NS4F: Content Script executing.");
console.log("NS4F Content Script loaded.");

const BUTTON_ID = 'ns4f-share-button';
const BUTTON_TEXT = '分享至 Notion';
// Using ARIA roles is more robust than class names for identifying UI components.
const SHARE_DIALOG_SELECTOR = 'div[role="dialog"]';
const SHARE_MENU_LIST_SELECTOR = 'div[role="list"]';

function createShareButton(menuList) {
    console.log('NS4F DEBUG: Entered createShareButton.');
    // To ensure our button matches Facebook's styles, we'll clone an existing menu item.
    const originalMenuItem = menuList.querySelector('div[role="listitem"]');
    if (!originalMenuItem) {
        console.log("NS4F DEBUG: Could not find a menu item `div[role=\"listitem\"]` to clone inside the menu list.");
        return null;
    }
    console.log('NS4F DEBUG: Found menu item to clone:', originalMenuItem);
    const button = originalMenuItem.cloneNode(true);
    button.id = BUTTON_ID;

    // Find the element containing the text and update it.
    const textElement = button.querySelector('span[dir="auto"]');
    if (textElement) {
        console.log('NS4F DEBUG: Found text element `span[dir="auto"]` to update.');
        textElement.textContent = BUTTON_TEXT;
    } else {
        console.log('NS4F DEBUG: Could not find text element `span[dir="auto"]`, setting textContent of the whole button.');
        button.textContent = BUTTON_TEXT;
    }

    // --- Icon Replacement Logic ---
    const iconElement = button.querySelector('i, img, svg');
    if (iconElement) {
        console.log('NS4F DEBUG: Found icon element to replace:', iconElement);
        const notionIcon = document.createElement('img');
        notionIcon.src = chrome.runtime.getURL('icons/notion-icon.svg');

        // Attempt to match the original icon's dimensions and styling
        notionIcon.style.width = '20px';
        notionIcon.style.height = '20px';
        notionIcon.style.marginRight = '12px'; // Adjust as needed
        notionIcon.style.verticalAlign = 'middle';

        iconElement.parentNode.replaceChild(notionIcon, iconElement);
        console.log('NS4F DEBUG: Replaced original icon with Notion icon.');
    } else {
        console.log('NS4F DEBUG: Could not find an icon element (i, img, svg) to replace.');
    }
    // --- End Icon Replacement ---

    const cleanButton = document.createElement('div');
    cleanButton.innerHTML = button.innerHTML;
    cleanButton.id = button.id;
    cleanButton.setAttribute('role', button.getAttribute('role'));
    cleanButton.setAttribute('class', button.getAttribute('class'));
    cleanButton.setAttribute('style', button.getAttribute('style'));
    cleanButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('NS4F: "Share to Notion" button clicked!');

        // --- Data Extraction and Messaging ---
        const postDetails = getPostDetails(event.target);
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
        // --- End Data Extraction and Messaging ---
    });

    console.log('NS4F DEBUG: Clean button created.', cleanButton);

    return cleanButton;
}

function findAndInjectButton() {
    console.log(`NS4F DEBUG: Running findAndInjectButton. Searching for '${SHARE_DIALOG_SELECTOR}'.`);
    const dialogs = document.querySelectorAll(SHARE_DIALOG_SELECTOR);

    if (dialogs.length === 0) {
        return;
    }

    console.log(`NS4F DEBUG: Found ${dialogs.length} dialog(s).`);

    dialogs.forEach((dialog, index) => {
        console.log(`NS4F DEBUG: Checking dialog #${index + 1}.`);
        const headings = dialog.querySelectorAll('h2, h3, [role="heading"]');
        if (headings.length === 0) {
            console.log(`NS4F DEBUG: Dialog #${index + 1} has no heading elements.`);
            return;
        }

        const hasShareHeading = Array.from(headings).some(h => {
            console.log(`NS4F DEBUG: Dialog #${index + 1}, found heading with text: "${h.textContent}"`);
            return h.textContent.includes('分享');
        });

        if (!hasShareHeading) {
            console.log(`NS4F DEBUG: Dialog #${index + 1} does not seem to be a share dialog.`);
            return;
        }

        console.log(`NS4F DEBUG: Found a potential share dialog! (Dialog #${index + 1})`);

        const menuList = dialog.querySelector(SHARE_MENU_LIST_SELECTOR);
        if (!menuList) {
            console.log(`NS4F DEBUG: Share dialog found, but it does not contain a menu list with selector '${SHARE_MENU_LIST_SELECTOR}'.`);
            return;
        }

        console.log('NS4F DEBUG: Found menu list inside the dialog.', menuList);

        // The actual container for the items is the parent of the first list item.
        const injectionParent = menuList.querySelector('div[role="listitem"]')?.parentElement;
        if (!injectionParent) {
            console.log(`NS4F DEBUG: Could not find the injection parent for the share button.`);
            return;
        }

        if (injectionParent.querySelector(`#${BUTTON_ID}`)) {
            console.log('NS4F DEBUG: Button already injected. Skipping.');
            return;
        }

        console.log('NS4F: Attempting to create and inject button.');
        // createShareButton can still use menuList to find any descendant item to clone.
        const button = createShareButton(menuList);
        if (button) {
            // New logic to insert the button at the correct position.
            const menuItems = injectionParent.querySelectorAll('div[role="listitem"]');
            let messengerButton = null;
            let whatsappButton = null;

            for (const item of menuItems) {
                const text = item.textContent || "";
                if (text.includes('Messenger') || text.includes('使用 Messenger 傳送')) {
                    messengerButton = item;
                }
                if (text.includes('WhatsApp') || text.includes('傳送到 WhatsApp')) {
                    whatsappButton = item;
                }
            }

            if (messengerButton) {
                // Insert after the Messenger button.
                messengerButton.parentNode.insertBefore(button, messengerButton.nextSibling);
                console.log('NS4F: Button injected successfully after Messenger.');
            } else if (whatsappButton) {
                // Fallback: Insert before the WhatsApp button if Messenger isn't found.
                injectionParent.insertBefore(button, whatsappButton);
                console.log('NS4F: Messenger button not found. Injecting before WhatsApp.');
            } else {
                // Fallback: append to the end of the list if neither is found.
                injectionParent.appendChild(button);
                console.log('NS4F: Neither Messenger nor WhatsApp button found. Appending to end of list.');
            }
        } else {
            console.log('NS4F: Failed to create button.');
        }
    });
}

function findAndHijackCopyLinkButton() {
    const dialogs = document.querySelectorAll(SHARE_DIALOG_SELECTOR);

    dialogs.forEach(dialog => {
        const listItems = dialog.querySelectorAll('div[role="listitem"]');
        listItems.forEach(item => {
            const text = item.textContent || "";
            // Assuming the button text is "複製連結"
            if (text.includes('複製連結')) {
                // Check if we've already hijacked this button
                if (item.dataset.ns4fHijacked) {
                    return;
                }
                item.dataset.ns4fHijacked = 'true';

                console.log('NS4F: Found "Copy link" button. Hijacking now.');

                // The actual clickable element might be the item itself or a child.
                // Let's add the listener to the list item for broader compatibility.
                item.addEventListener('click', (event) => {
                    console.log('NS4F: Hijacked "Copy link" button clicked!');

                    // --- Data Extraction and Messaging ---
                    const postDetails = getPostDetails(event.target);
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
                    // --- End Data Extraction and Messaging ---
                }, true); // Use capture phase to ensure our listener runs first.
            }
        });
    });
}

function handleDomChanges(mutationsList, observer) {
  // We can simply run our check function whenever the DOM changes.
  // For better performance on very active pages, this could be debounced.
  // findAndInjectButton();
  findAndHijackCopyLinkButton();
}

// Create an observer instance linked to the callback function
const observer = new MutationObserver(handleDomChanges);

// Configuration for the observer:
// We want to watch for nodes being added or removed from the DOM.
const config = {
  childList: true, // Observe direct children additions/removals
  subtree: true    // Observe all descendants, not just direct children
};

// Start observing the target node for configured mutations.
// We watch the entire body of the document to catch modals or pop-ups
// that get appended at the end of the body.
observer.observe(document.body, config);

console.log("MutationObserver is now watching the DOM.");

function getPostDetails(buttonElement) {
    // This is a best-effort attempt to find the post content and URL.
    // Facebook's DOM is complex and subject to change.
    const dialog = buttonElement.closest('div[role="dialog"]');
    if (!dialog) {
        console.error("NS4F: Could not find parent dialog for the share button.");
        return { content: '無法找到貼文對話框。', url: window.location.href };
    }

    // --- New URL Extraction Logic (from WhatsApp link) ---
    let postUrl = '';
    // Find the WhatsApp link by checking the href for "wa.me".
    const whatsAppAnchor = Array.from(dialog.querySelectorAll('a')).find(a => a.href.includes('wa.me'));

    if (whatsAppAnchor && whatsAppAnchor.href) {
        try {
            // Use URLSearchParams to safely parse the query string.
            const urlParams = new URLSearchParams(new URL(whatsAppAnchor.href).search);
            const textParam = urlParams.get('text');
            if (textParam) {
                // The 'text' parameter contains the URL we want to share.
                postUrl = textParam;
                console.log(`NS4F: Extracted URL from WhatsApp link: ${postUrl}`);
            }
        } catch (e) {
            console.error("NS4F: Error parsing WhatsApp link:", e);
        }
    }

    if (!postUrl) {
        console.log("NS4F: Could not find or parse WhatsApp link, falling back to previous method.");
        // Fallback to the old method if the new one fails.
        const timeLink = dialog.querySelector('a[href*="/posts/"], a[href*="/videos/"], a[href*="/photos/"]');
        if (timeLink && timeLink.href) {
            postUrl = timeLink.href;
        } else {
            // Final fallback to the page's URL.
            postUrl = window.location.href;
        }
    }
    // --- End URL Extraction Logic ---


    // --- Content Extraction Logic (Improved) ---
    let content = '無法自動擷取內容。';
    // New, preferred selector for direct post view. Searches the whole document.
    let contentElement = document.querySelector('span[data-ad-rendering-role="description"]');

    if (contentElement) {
        console.log("NS4F: Extracted content using 'description' role from document.");
        content = contentElement.innerText;
    } else {
        // Fallback to the selector within the share dialog if the primary one fails
        console.log("NS4F: Could not find content with 'description' role, falling back to 'message' preview within dialog.");
        contentElement = dialog.querySelector('div[data-ad-preview="message"]');
        if (contentElement) {
            console.log("NS4F: Extracted content using 'message' preview fallback.");
            content = contentElement.innerText;
        }
    }
    // --- End Content Extraction Logic ---

    return {
        content: content.trim(),
        url: postUrl
    };
}
