// Saves options to chrome.storage
function save_options() {
    const language = document.getElementById('language').value;
    chrome.storage.sync.set({
        language: language
    }, function() {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value language = 'auto'
    chrome.storage.sync.get({
        language: 'auto'
    }, function(items) {
        document.getElementById('language').value = items.language;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('language').addEventListener('change', save_options);
