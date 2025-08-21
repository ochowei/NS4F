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

function handleDomChanges(mutationsList, observer) {
  // We can simply run our check function whenever the DOM changes.
  // For better performance on very active pages, this could be debounced.
  findAndInjectButton();
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

    // Let's find the root of the post. We can traverse up until we find a container
    // that seems to hold the entire post. A common pattern is an element with
    // a specific data attribute or a complex class name.
    // For this example, we'll look for a div that is inside the dialog.
    const dialog = buttonElement.closest('div[role="dialog"]');
    if (!dialog) {
        return { content: '無法找到貼文內容。', url: window.location.href };
    }

    // Now, let's try to find the content within the dialog.
    // Usually, the shared content is displayed prominently.
    let content = '無法自動擷取內容。';
    // Let's try a selector that often contains the main text of a post.
    const contentElement = dialog.querySelector('div[data-ad-preview="message"]');
    if (contentElement) {
        content = contentElement.innerText;
    }

    // For the URL, we can try to find a link to the post.
    // These links are often timestamp links.
    let postUrl = window.location.href;
    const timeLink = dialog.querySelector('a[href*="/posts/"], a[href*="/videos/"], a[href*="/photos/"]');
    if (timeLink && timeLink.href) {
        postUrl = timeLink.href;
    }

    return {
        content: content.trim(),
        url: postUrl
    };
}
