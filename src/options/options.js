// JavaScript for the options page.

// Saves options to chrome.storage.
function save_options() {
  const notionToken = document.getElementById('notion-token').value;
  const databaseId = document.getElementById('database-id').value;

  // The chrome.storage API is asynchronous.
  chrome.storage.sync.set({
    notionToken: notionToken,
    databaseId: databaseId
  }, function() {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500); // Clear message after 1.5 seconds
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value for notionToken and databaseId
  chrome.storage.sync.get({
    notionToken: '',
    databaseId: ''
  }, function(items) {
    document.getElementById('notion-token').value = items.notionToken;
    document.getElementById('database-id').value = items.databaseId;
  });
}

// Add event listeners once the DOM is loaded.
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('settings-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting in the traditional way
    save_options();
});
