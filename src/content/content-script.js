console.log("NS4F Content Script loaded.");

// This function will be the core logic that runs when the DOM changes.
// For now, it will just log the mutations. In the next step, it will
// contain the logic to find the share menu.
function handleDomChanges(mutationsList, observer) {
  for(const mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // In the next step, we'll add logic here to check if the added
      // nodes contain the Facebook share menu.
    }
  }
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
