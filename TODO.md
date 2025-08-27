# NS4F Project TODO List

## ✅ **已完成 (Completed)**

*   **專案基礎建設**
    *   [x] 建立專案的目錄結構與 `manifest.json` 設定檔。
    *   [x] 設定 Webpack，用於建構 Chrome 和 Firefox 的擴充功能。
    *   [x] 設定 Playwright，用於進行端對端（E2E）測試。
    *   [x] 撰寫專案的 `README.md` 說明文件。

## ⬜ **未完成 (To-Do)**

*   **1. 選項頁面 (Options Page)**
    *   [x] **HTML 介面**：在 `src/options/options.html` 中，建立表單讓使用者輸入 Notion API Token 和 Database ID。
    *   [x] **功能邏輯**：在 `src/options/options.js` 中，實作儲存與讀取設定的功能，將使用者的輸入存進瀏覽器的儲存空間 (`chrome.storage`)。

*   **2. 內容腳本 (Content Script)**
    *   [x] **穩定性**：使用 `MutationObserver` 來應對 Facebook 動態載入的介面，確保能穩定地找到分享選單。
    *   [ ] **資料擷取**：為按鈕新增點擊事件，觸發時擷取當前頁面的標題、連結，以及使用者選取的文字。
    *   [ ] **訊息傳遞**：將擷取到的資料傳送給背景服務工作線程（Service Worker）。

*   **3. 背景腳本 (Background Script)**
    *   [ ] **監聽事件**：在 `src/background/service-worker.js` 中，建立監聽器以接收來自 Content Script 的訊息。
    *   [ ] **執行分享**：收到訊息後，從瀏覽器儲存空間讀取 Notion 設定，並呼叫 Notion API 將資料寫入指定的 Database。

*   **4. Notion API 函式庫**
    *   [ ] **API 封裝**：在 `src/lib/notion-api.js` 中，建立一個函式，專門用來與 Notion API 互動。
    *   [ ] **建立頁面**：此函式需要能接收 Notion Token、Database ID 和頁面內容，並發送 `fetch` 請求到 Notion API (`https://api.notion.hq/v1/pages`) 來建立新頁面。
    *   [ ] **錯誤處理**：處理 API 可能的回應與錯誤。

*   **5. 端對端測試 (E2E Testing)**
    *   [ ] **擴充測試案例**：在 `e2e/basic.spec.ts` 中撰寫更完整的測試，包含：
        *   [ ] 載入擴充功能並設定 Notion Token/Database ID。
        *   [ ] 模擬點擊按鈕，並攔截（Mock）對 Notion API 的請求，驗證傳送的資料是否正確。

*   **6. 跨瀏覽器相容性**
    *   [ ] **測試與修正**：在 Chrome、Firefox、Edge 上完整測試所有功能，並修正因瀏覽器差異（如 `chrome.*` vs `browser.*` API）導致的問題。
