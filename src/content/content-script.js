console.log("NS4F: Content Script executing.");
console.log("NS4F Content Script loaded.");

const BUTTON_ID_PREFIX = 'ns4f-post-share-button-';
const BUTTON_TEXT = '分享至 Notion';
const POST_SELECTOR = 'div[role="article"]';
const PROCESSED_MARKER = 'data-ns4f-processed';
const NOTION_ICON_URL = chrome.runtime.getURL('icons/notion-icon.svg');

/**
 * Creates the "Share to Notion" button by cloning an existing button from the action bar.
 * @param {Element} templateButton - An existing button element to use as a template for style.
 * @returns {Element|null} The new button element or null if creation fails.
 */
function createShareButton(templateButton) {
    const newButton = templateButton.cloneNode(true);
    newButton.id = `${BUTTON_ID_PREFIX}${Date.now()}`; // Unique ID for each button
    newButton.removeAttribute('aria-label'); // Remove original label if it exists

    // Find and replace the icon
    const iconElement = newButton.querySelector('i, img, svg');
    if (iconElement) {
        const notionIcon = document.createElement('img');
        notionIcon.src = NOTION_ICON_URL;
        notionIcon.style.width = '20px';
        notionIcon.style.height = '20px';
        iconElement.parentNode.replaceChild(notionIcon, iconElement);
    }

    // Find and replace the text
    // Facebook buttons often have text in a span with no specific class.
    // We target the deepest, most specific element that contains the button text.
    const textElement = newButton.querySelector('span[dir="auto"]');
    if (textElement) {
        textElement.textContent = BUTTON_TEXT;
    } else {
        // Fallback for different button structures
        const innerSpan = newButton.querySelector('span > span');
        if(innerSpan) innerSpan.textContent = BUTTON_TEXT;
        else newButton.textContent = BUTTON_TEXT; // Fallback if no specific text span found
    }

    // Attach the event listener for the new button
    newButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('NS4F: "Share to Notion" button clicked on post!');
        const postDetails = getPostDetails(event.currentTarget);
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
    });

    return newButton;
}


/**
 * Extracts the permalink and content from the post.
 * @param {Element} buttonElement - The button that was clicked.
 * @returns {{content: string, url: string}}
 */
function getPostDetails(buttonElement) {
    const postElement = buttonElement.closest(POST_SELECTOR);
    if (!postElement) {
        console.error("NS4F: Could not find parent post element.");
        return { content: '無法找到貼文內容。', url: window.location.href };
    }

    // --- Permalink Extraction ---
    let postUrl = '';
    // Strategy 1: Find the timestamp link. This is the most reliable method.
    // Facebook uses an `<a>` tag with a specific `aria-label` or containing a `<time>` element.
    const timestampLink = postElement.querySelector('a[aria-label*="timestamp"], a:has(time)');

    if (timestampLink && timestampLink.href) {
        postUrl = timestampLink.href;
        console.log(`NS4F: Extracted URL from timestamp link: ${postUrl}`);
    } else {
        // Fallback Strategy 2: Find any link within the post that points to a post/video/photo.
        // This is less reliable as it might grab a link to a shared post instead of the post itself.
        const fallbackLink = postElement.querySelector('a[href*="/posts/"], a[href*="/videos/"], a[href*="/photos/"], a[href*="/story/"]');
        if (fallbackLink && fallbackLink.href) {
            postUrl = fallbackLink.href;
            console.log(`NS4F: Extracted URL using fallback link selector: ${postUrl}`);
        } else {
            // Final fallback to the page's current URL.
            postUrl = window.location.href;
            console.log(`NS4F: No specific post link found. Falling back to window.location.href.`);
        }
    }

    // --- Content Extraction ---
    let content = '無法自動擷取內容。';
    // Strategy 1: Look for the main content block used in many post types.
    let contentElement = postElement.querySelector('div[data-ad-preview="message"]');

    // Strategy 2: Fallback for different structures, like shared posts or videos.
    if (!contentElement) {
        contentElement = postElement.querySelector('span[data-ad-id]');
    }

    // Strategy 3: A more generic selector looking for a span with dir="auto"
    // that is a direct child of a div. This is fragile but can work as a last resort.
    if (!contentElement) {
       const spans = postElement.querySelectorAll('div > span[dir="auto"]');
       // Often the longest span is the content.
       if (spans.length > 0) {
           contentElement = Array.from(spans).reduce((a, b) => a.textContent.length > b.textContent.length ? a : b);
       }
    }

    if (contentElement) {
        content = contentElement.innerText;
        console.log("NS4F: Extracted content successfully.", contentElement);
    } else {
        console.log("NS4F: Could not extract content using any strategy.");
    }


    return {
        content: content.trim(),
        url: postUrl
    };
}

/**
 * Injects the share button into a specific Facebook post element.
 * @param {Element} postElement - The DOM element of the Facebook post.
 */
function injectButtonIntoPost(postElement) {
    if (postElement.hasAttribute(PROCESSED_MARKER)) {
        return; // Button already injected or processing attempted.
    }
    postElement.setAttribute(PROCESSED_MARKER, 'true'); // Mark as processed

    // The action bar is typically a div with role="toolbar"
    const actionBar = postElement.querySelector('div[role="toolbar"]');
    if (!actionBar) {
        console.log("NS4F: Could not find action bar in post.", postElement);
        return;
    }

    // Find a button to use as a template for styling.
    // We look for any div with role="button" inside the action bar.
    const templateButton = actionBar.querySelector('div[role="button"]');
    if (!templateButton) {
        console.log("NS4F: Could not find a template button to clone in action bar.", actionBar);
        return;
    }

    const newButton = createShareButton(templateButton);
    if (newButton) {
        // Append the new button to the action bar.
        actionBar.appendChild(newButton);
        console.log("NS4F: Successfully injected button into post.", postElement);
    }
}

/**
 * Scans the document for any posts that haven't been processed yet.
 */
function scanForPosts() {
    document.querySelectorAll(`${POST_SELECTOR}:not([${PROCESSED_MARKER}])`).forEach(injectButtonIntoPost);
}

/**
 * The callback function for the MutationObserver.
 * It checks for added nodes and injects the button into any new posts.
 * @param {MutationRecord[]} mutationsList
 */
function handleMutations(mutationsList) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the added node itself is a post
                    if (node.matches(POST_SELECTOR)) {
                        injectButtonIntoPost(node);
                    }
                    // Check if the added node contains any posts
                    node.querySelectorAll(POST_SELECTOR).forEach(injectButtonIntoPost);
                }
            });
        }
    }
}

/**
 * Initializes the observer and performs the initial scan.
 */
function initialize() {
    console.log("NS4F: Initializing direct post injection observer.");

    // Create and configure the observer
    const observer = new MutationObserver(handleMutations);
    const config = {
        childList: true,
        subtree: true
    };
    observer.observe(document.body, config);

    // Run an initial scan for posts that might have loaded before the script ran
    setTimeout(scanForPosts, 1000); // Delay to allow initial page load
    console.log("NS4F: Observer is now watching for posts.");
}

initialize();
