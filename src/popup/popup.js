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

    contentElement.textContent = postContent;

    if (postUrl) {
        urlElement.href = postUrl;
        // Simple URL shortening for display
        urlElement.textContent = postUrl.length > 50 ? postUrl.substring(0, 50) + '...' : postUrl;
    } else {
        urlElement.textContent = '沒有提供網址。';
        urlElement.removeAttribute('href');
    }
});
