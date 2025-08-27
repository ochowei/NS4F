# New Share for Facebook (NS4F)

This browser extension streamlines the process of sharing content from Facebook. When you click the "Copy Link" button on a post, it automatically opens the copied link in a new browser tab, saving you the hassle of manually pasting the URL.

> Supported on: Chrome, Firefox, Edge (WebExtensions API / Manifest V3)

-----

## ✨ Key Features

  - 🔗 **One-Click Link Opening**: Hijacks Facebook's "Copy Link" functionality and immediately opens the post's URL in a new tab upon clicking.
  - 🧱 **Defensive Hijacking**: Uses a `MutationObserver` to monitor dynamic changes in the share panel, ensuring the "Copy Link" button can be reliably captured even if Facebook's DOM structure changes.
  - 🧭 **Cross-Browser Compatibility**: Supports major browsers including Chrome, Firefox, and Edge.

-----

## Tech Stack

  - **Core**: JavaScript (ES6+), WebExtensions API (Manifest V3)
  - **Build Tool**: webpack
  - **Testing**: Playwright (E2E)

## Project Structure

```
ns4f/
├── AGENTS.md
├── README.md
├── package.json
├── .gitignore
├── manifest.json
├── dist/
│   ├── chrome/
│   └── firefox/
├── src/
│   ├── icons/
│   ├── background/
│   │   └── service-worker.js
│   ├── content/
│   │   └── content-script.js
│   ├── options/
│   │   ├── options.html
│   │   └── options.js
│   └── lib/
│       └── notion-api.js # Notion API Library
└── e2e/
    └── basic.spec.ts
```

## Development Workflow

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Build**:
    ```bash
    npm run build:chrome
    npm run build:firefox
    ```

## Important Notes

  - **Manifest V3**: The project's primary target is Manifest V3 to comply with the latest Chrome requirements.
  - **DOM Manipulation**: Facebook's DOM structure changes frequently. `content-script.js` uses a `MutationObserver` for stable node targeting, preventing the extension from breaking due to class name or ID changes.
  - **Cross-Browser Compatibility**:
      * The extension primarily uses the `chrome.*` API, with a `webextension-polyfill` to translate it into `browser.*` for Firefox compatibility.
      * Storage permissions (`chrome.storage` vs. `browser.storage`) are handled with `chrome.storage` and a polyfill.

-----

### 中文版 README.md

# New Share for Facebook (NS4F)

這個瀏覽器擴充功能簡化了從 Facebook 分享內容的流程。當您點擊貼文的「複製連結」按鈕時，它會自動將複製的連結在新分頁中開啟，節省您手動貼上連結的時間。

> 支援：Chrome、Firefox、Edge（WebExtensions API / Manifest V3）

-----

## ✨ 功能亮點

  - 🔗 **一鍵開啟連結**：劫持 Facebook 的「複製連結」功能，在點擊後立即在新分頁中打開該貼文。
  - 🧱 **防禦式劫持**：使用 `MutationObserver` 監聽分享面板的動態生成，確保能穩定地捕捉「複製連結」按鈕。
  - 🧭 **跨瀏覽器**：支援 Chrome、Firefox 和 Edge 等主流瀏覽器。

-----

## 技術棧

  - **核心**: JavaScript (ES6+), WebExtensions API (Manifest V3)
  - **建置工具**: webpack
  - **測試**: Playwright (E2E)

## 專案結構

```
ns4f/
├── AGENTS.md
├── README.md
├── package.json
├── .gitignore
├── manifest.json
├── dist/
│   ├── chrome/
│   └── firefox/
├── src/
│   ├── icons/
│   ├── background/
│   │   └── service-worker.js
│   ├── content/
│   │   └── content-script.js
│   ├── options/
│   │   ├── options.html
│   │   └── options.js
│   └── lib/
│       └── notion-api.js # Notion API 函式庫
└── e2e/
    └── basic.spec.ts
```

## 開發流程

1.  **安裝依賴**:
    ```bash
    npm install
    ```
2.  **建置**:
    ```bash
    npm run build:chrome
    npm run build:firefox
    ```

## 注意事項

  - **Manifest V3**: 主要目標為 Manifest V3，以符合 Chrome 的最新要求。
  - **DOM 操作**: Facebook 的 DOM 結構經常變動。`content-script.js` 使用 `MutationObserver` 來穩定地尋找並劫持目標節點，以避免因 class name 或 id 變更而失效。
  - **跨瀏覽器相容性**:
      * 盡量使用 `chrome.*` API，搭配 `webextension-polyfill` 來轉換為 `browser.*` 以支援 Firefox。
      * 儲存權限 (`chrome.storage` vs. `browser.storage`) 已使用 `chrome.storage` 搭配 polyfill 處理。