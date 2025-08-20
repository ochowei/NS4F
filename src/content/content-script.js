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

        if (menuList.querySelector(`#${BUTTON_ID}`)) {
            console.log('NS4F DEBUG: Button already injected. Skipping.');
            return;
        }

        console.log('NS4F: Attempting to create and inject button.');
        const button = createShareButton(menuList);
        if (button) {
            menuList.prepend(button);
            console.log('NS4F: Button injected successfully.');
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
