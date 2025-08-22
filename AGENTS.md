# AGENTS.md - Notion Share for Facebook (NS4F)

### PDCA 操作
主要資料夾: .pdca-cycle
版本: 1.0.0
操作指引

    P: 寫 plan.md 與 journal-cycle
    D: 在 dev-log 裡面寫日誌 與 journal-cycle
    C: 也是在 dev-log 裡面寫日誌 與 journal-cycle
    A: 寫 journal-cycle

起步

    如果是從 0 開始的 project，從 P -> D -> C -> ... -> D -> C -> A
    如果要更動 plan 的話，要進行 A，再更動
    如果是已經有內容的 project，從 C 開始，然後 A，會決定繼續 D 還是 P，然後進行 Cycle。


## 專案目標

此專案的目標是建立一個跨瀏覽器的擴充功能，讓使用者能將 Facebook 上的貼文一鍵分享至指定的 Notion Database。

## 技術棧

- **核心**: JavaScript (ES6+), WebExtensions API (Manifest V3)
- **建置工具**: 尚未決定，但可能會使用 `webpack` 或類似的 bundler 來處理模組化與跨瀏覽器打包。
- **測試**: 尚未決定，但應包含單元測試與 E2E 測試。

## 專案結構

```
ns4f/
├── AGENTS.md         # 開發指南 (就是本檔案)
├── README.md         # 專案說明
├── package.json      # 專案依賴與腳本
├── .gitignore        # Git 忽略清單
├── manifest.json     # 擴充功能核心設定檔
├── dist/             # 打包後的擴充功能 (各瀏覽器一個子目錄)
│   ├── chrome/
│   └── firefox/
├── src/              # 原始碼
│   ├── icons/        # 擴充功能圖示 (16x16, 48x48, 128x128)
│   ├── background/   # 背景腳本 (Service Worker for MV3)
│   │   └── service-worker.js
│   ├── content/      # 內容腳本 (注入 Facebook 頁面)
│   │   └── content-script.js
│   ├── options/      # 設定頁面
│   │   ├── options.html
│   │   └── options.js
│   └── lib/          # 共用函式庫
│       └── notion-api.js # Notion API 封裝
└── e2e/              # 前端驗證
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
    (注意: `build` 腳本尚待在 `package.json` 中定義)

3.  **載入擴充功能進行測試**:
    - **Chrome**: 前往 `chrome://extensions/`，啟用「開發人員模式」，點選「載入未封裝的擴充功能」，然後選擇 `dist/chrome` 目錄。
    - **Firefox**: 前往 `about:debugging#/runtime/this-firefox`，點選「載入暫時附加元件」，然後選擇 `dist/firefox/manifest.json` 檔案。

## 注意事項

- **Manifest V3**: 主要目標為 Manifest V3，以符合 Chrome 的最新要求。Firefox 的支援需要確認 `host_permissions` 等設定的相容性。
- **DOM 操作**: Facebook 的 DOM 結構經常變動。`content-script.js` 應使用穩固、有彈性的方式來尋找目標節點 (例如 `MutationObserver`)，避免因 class name 或 id 變更而失效。
- **Notion API**:
  - `Internal Integration Token` 模式較簡單，但 token 管理需注意安全性，不要硬編碼在程式碼中，應由使用者在設定頁面輸入，並儲存在 `chrome.storage.local`。
  - `OAuth` 模式是更安全的發布方式，但流程較複雜，可作為第二階段目標。
- **跨瀏覽器相容性**:
  - 盡量使用 `chrome.*` API，因為 `webextension-polyfill` 可以將其轉換為 `browser.*`。
  - 主要差異點可能在於 `service-worker` (Chrome) vs. `background script` (Firefox MV2/MV3)，以及儲存權限 (`chrome.storage` vs. `browser.storage`)。我們將優先使用 `chrome.storage` 搭配 polyfill。
- **前端驗證**:
  - 你必須在 `e2e/` 目錄下撰寫 Playwright 腳本來驗證你的變更。
  - 你必須在提交前呼叫 `frontend_verification_instructions` 來執行驗證。
  - **注意**: 請勿編寫需要使用者登入才能運作的 E2E 測試，因為我們的測試環境無法處理登入流程。


