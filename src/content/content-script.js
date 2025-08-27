console.log("NS4F: Content Script executing.");
console.log("NS4F Content Script loaded.");

const SHARE_DIALOG_SELECTOR = 'div[role="dialog"]';

function findAndHijackCopyLinkButton() {
    const dialogs = document.querySelectorAll(SHARE_DIALOG_SELECTOR);

    dialogs.forEach(dialog => {
        const listItems = dialog.querySelectorAll('div[role="listitem"]');
        listItems.forEach(item => {
            const text = item.textContent || "";
            // Assuming the button text is "複製連結"
            if (text.includes(chrome.i18n.getMessage("copy_link_button_text"))) {
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
                    setTimeout(() => {
                        console.log("NS4F: 5 秒後我被執行了！");
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
                                // chrome.tabs.create({ url: text, index: 1 });  

                            }).catch(err => {
                                console.error(err);            
                            });                
                            
                        } catch(e) {
                            console.error(e);            
                        }   
                    }, 200);
                    
                    // --- End Data Extraction and Messaging ---
                }, true); // Use capture phase to ensure our listener runs first.
            }
        });
    });
}

function handleDomChanges(mutationsList, observer) {
  // We can simply run our check function whenever the DOM changes.
  // For better performance on very active pages, this could be debounced.
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
