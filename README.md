# Notion Share for Facebook (NS4F)

在 Facebook 網頁上，當你點選「分享」按鈕時，這個跨瀏覽器插件會在「分享至 …」清單中新增 **「分享至 Notion」**。  
一鍵把當前貼文/頁面資訊（連結、標題、選取文字、備註）存進你指定的 Notion - Database。

> 支援：Chrome、Firefox、Edge（WebExtensions API / Manifest V3，Firefox 需 109+ 並啟用 MV3 支援）

---

## ✨ 功能亮點

- 🧩 **原生體驗**：插入 Facebook 網頁的官方分享選單（或平行選單）中。
- 🗂️ **Notion Database 寫入**：以 Database 為落點，欄位可自訂（例如 Title、URL、Excerpt、Note、Tag、CreatedAt）。
- 📝 **選取文字捕捉**：自動帶入你當下選取的段落（若有）。
- 🔐 **兩種 Notion 整合模式**：
  - 個人或小團隊：**Internal Integration Token**（簡單、快速）
  - 開放使用者：**OAuth 公開登入**（需 Notion OAuth App）
- 🧭 **跨瀏覽器**：單一程式碼庫，針對各家瀏覽器做最小差異化設定。
- 🧱 **防禦式注入**：使用 `MutationObserver` 追蹤分享面板節點動態生成，避免 Facebook DOM 結構更動造成失效。

---

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


## 注意事項

- **Manifest V3**: 主要目標為 Manifest V3，以符合 Chrome 的最新要求。Firefox 的支援需要確認 `host_permissions` 等設定的相容性。
- **DOM 操作**: Facebook 的 DOM 結構經常變動。`content-script.js` 應使用穩固、有彈性的方式來尋找目標節點 (例如 `MutationObserver`)，避免因 class name 或 id 變更而失效。
- **Notion API**:
  - `Internal Integration Token` 模式較簡單，但 token 管理需注意安全性，不要硬編碼在程式碼中，應由使用者在設定頁面輸入，並儲存在 `chrome.storage.local`。
  - `OAuth` 模式是更安全的發布方式，但流程較複雜，可作為第二階段目標。
- **跨瀏覽器相容性**:
  - 盡量使用 `chrome.*` API，因為 `webextension-polyfill` 可以將其轉換為 `browser.*`。
  - 主要差異點可能在於 `service-worker` (Chrome) vs. `background script` (Firefox MV2/MV3)，以及儲存權限 (`chrome.storage` vs. `browser.storage`)。我們將優先使用 `chrome.storage` 搭配 polyfill。
