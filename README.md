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