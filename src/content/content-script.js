console.log("NS4F Content Script loaded.");

const BUTTON_ID = 'ns4f-share-button';
const BUTTON_TEXT = '分享至 Notion';
// Using ARIA roles is more robust than class names for identifying UI components.
const SHARE_DIALOG_SELECTOR = 'div[role="dialog"]';
const SHARE_MENU_LIST_SELECTOR = 'div[role="menu"]';

function createShareButton() {
    // To ensure our button matches Facebook's styles, we'll clone an existing menu item.
    const originalMenuItem = document.querySelector(`${SHARE_MENU_LIST_SELECTOR} div[role="menuitem"]`);
    if (!originalMenuItem) {
        console.log("NS4F: Could not find a menu item to clone.");
        return null;
    }

    const button = originalMenuItem.cloneNode(true);
    button.id = BUTTON_ID;

    // Find the element containing the text and update it.
    // This selector is a guess and may need refinement based on Facebook's DOM structure.
    const textElement = button.querySelector('span[dir="auto"]');
    if (textElement) {
        textElement.textContent = BUTTON_TEXT;
    } else {
        // Fallback if the specific span isn't found.
        button.textContent = BUTTON_TEXT;
    }

    // To prevent any of Facebook's original event listeners from firing,
    // we re-create the element from its outerHTML.
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
        // Future logic for data extraction and sending to background script will go here.
    });

    return cleanButton;
}

function findAndInjectButton() {
    const dialog = document.querySelector(SHARE_DIALOG_SELECTOR);
    if (!dialog) return; // No dialog found.

    // Heuristic: Check for a heading with "分享" (Share) to ensure it's the right dialog.
    const isShareDialog = Array.from(dialog.querySelectorAll('h2, h3, [role="heading"]')).some(h => h.textContent.includes('分享'));
    if (!isShareDialog) return;

    const menuList = dialog.querySelector(SHARE_MENU_LIST_SELECTOR);
    // Proceed only if the menu exists and our button hasn't been injected yet.
    if (menuList && !menuList.querySelector(`#${BUTTON_ID}`)) {
        console.log('NS4F: Share dialog found, attempting to inject button.');
        const button = createShareButton();
        if (button) {
            // Prepend the button to the top of the menu.
            menuList.prepend(button);
            console.log('NS4F: Button injected successfully.');
        }
    }
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
