document.addEventListener('DOMContentLoaded', () => {
    // Function to get query parameters
    const getQueryParam = (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    };

    const contentElement = document.getElementById('post-content');
    const urlElement = document.getElementById('post-url');

    // Decode and display the content and URL
    const postContent = decodeURIComponent(getQueryParam('content') || '沒有提供內容。');
    const postUrl = decodeURIComponent(getQueryParam('url') || '');

    contentElement.value = postContent;

    if (postUrl) {
        urlElement.href = postUrl;
        // Simple URL shortening for display
        urlElement.textContent = postUrl.length > 50 ? postUrl.substring(0, 50) + '...' : postUrl;
    } else {
        urlElement.textContent = '沒有提供網址。';
        urlElement.removeAttribute('href');
    }

    const pasteButton = document.getElementById('paste-button');
    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            contentElement.value = text;
            console.log('NS4F: Pasted from clipboard.');
        } catch (err) {
            console.error('NS4F: Failed to read clipboard contents: ', err);
            // Fallback for browsers/situations where readText is not supported.
            // This will paste the text, but might not be ideal UX.
            contentElement.focus();
            document.execCommand('paste');
        }
    });
});
