console.log("NS4F: Content Script v2 Loaded.");

// --- Constants for Selectors (these may need adjustment) ---
const POST_SELECTOR = 'div[role="article"]'; // Selector for the main post container
const CONTENT_SELECTOR = 'div[data-ad-preview="message"], div[data-ad-id]'; // Primary selector for post text
const URL_TIMESTAMP_SELECTOR = 'a[href*="/posts/"], a[href*="/videos/"], a[href*="/photos/"], a[href*="/permalink/"], a[href*="/story.php"]'; // Selector for the permalink, usually on the timestamp
const INJECTION_POINT_SELECTOR = 'div[role="toolbar"]'; // The action bar with Like, Comment, Share
const BUTTON_CLASS = 'ns4f-share-button'; // A class to identify our button
const PROCESSED_MARKER = 'data-ns4f-processed'; // A marker to prevent re-processing posts

/**
 * Creates the "Share to Notion" button.
 */
function createShareButton(postElement) {
    const button = document.createElement('div');
    button.className = BUTTON_CLASS;
    button.style.cursor = 'pointer';
    button.style.padding = '8px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.flex = '1';
    button.style.justifyContent = 'center';
    button.style.borderRadius = '6px';

    // Hover effect
    button.onmouseover = () => button.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    button.onmouseout = () => button.style.backgroundColor = 'transparent';

    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icons/notion-icon.svg');
    icon.style.width = '18px';
    icon.style.height = '18px';
    icon.style.marginRight = '6px';

    const text = document.createElement('span');
    text.textContent = '分享至 Notion';
    text.style.color = '#65676B'; // A common Facebook text color
    text.style.fontWeight = '600';
    text.style.fontSize = '15px';


    button.appendChild(icon);
    button.appendChild(text);

    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleShareClick(postElement);
    });

    return button;
}

/**
 * Handles the click event on our custom share button.
 * Extracts post details and sends them to the background script.
 */
function handleShareClick(postElement) {
    console.log("NS4F: Share button clicked for post:", postElement);

    // --- Extract Content ---
    let content = '無法自動擷取內容。';
    const contentElement = postElement.querySelector(CONTENT_SELECTOR);
    if (contentElement) {
        content = contentElement.innerText || contentElement.textContent;
        console.log("NS4F: Extracted content:", content.substring(0, 100) + '...');
    } else {
        console.warn("NS4F: Could not find content element using selector:", CONTENT_SELECTOR);
    }

    // --- Extract URL ---
    let postUrl = window.location.href; // Fallback URL
    // Find all potential links and then filter them.
    const timeLinks = postElement.querySelectorAll(URL_TIMESTAMP_SELECTOR);
    let bestLink = null;
    // We want the link that is most likely a timestamp, which often has very few child elements.
    for(const link of timeLinks) {
        // A simple heuristic: the real timestamp link usually doesn't contain images or complex divs.
        // And it often has an `aria-label` attribute.
        if (!link.querySelector('img, svg, div[role="button"]') && link.getAttribute('aria-label')) {
            bestLink = link;
            break;
        }
    }

    if (bestLink) {
        postUrl = bestLink.href;
        console.log("NS4F: Extracted URL:", postUrl);
    } else {
        console.warn("NS4F: Could not find a definitive timestamp link. Falling back to window.location.href.");
    }

    // --- Send Data ---
    chrome.runtime.sendMessage({
        action: "ns4f_share",
        data: {
            content: content.trim(),
            url: postUrl
        }
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("NS4F: Message sending failed:", chrome.runtime.lastError.message);
        } else {
            console.log("NS4F: Message sent successfully, response:", response);
        }
    });
}

/**
 * Finds all posts on the page and injects the button if it's not already there.
 */
function processPosts() {
    const posts = document.querySelectorAll(POST_SELECTOR);
    for (const post of posts) {
        if (post.hasAttribute(PROCESSED_MARKER)) {
            continue; // Skip already processed posts
        }

        const injectionPoint = post.querySelector(INJECTION_POINT_SELECTOR);
        if (injectionPoint && !injectionPoint.querySelector(`.${BUTTON_CLASS}`)) {
            console.log("NS4F: Found a new post, injecting button...");
            const button = createShareButton(post);
            // The injection point is a flex container, so we can just append.
            injectionPoint.appendChild(button);
        }

        post.setAttribute(PROCESSED_MARKER, 'true');
    }
}

// --- Main Execution ---

// Initial run
setTimeout(processPosts, 2000); // Wait a bit for the page to load initially

// Set up a MutationObserver to handle dynamically loaded posts
const observer = new MutationObserver((mutations) => {
    // A simple approach: just re-run processPosts on any change.
    // This can be debounced for performance if needed.
    processPosts();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log("NS4F: Content Script v2 observer started.");
