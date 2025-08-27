import browser from "webextension-polyfill";

// src/options/options.js

// 將 chrome 改為 browser，並使用 Promise
function save_options() {
    const language = document.getElementById('language').value;
    browser.storage.sync.set({
        language: language
    }).then(() => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    browser.storage.sync.get({
        language: 'auto'
    }).then((items) => {
        document.getElementById('language').value = items.language;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('language').addEventListener('change', save_options);
