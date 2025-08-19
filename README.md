# Notion Share for Facebook (NS4F)

在 Facebook 網頁上，當你點選「分享」按鈕時，這個跨瀏覽器插件會在「分享至 …」清單中新增 **「分享至 Notion」**。  
一鍵把當前貼文/頁面資訊（連結、標題、選取文字、備註）存進你指定的 Notion Database。

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

## 🧰 架構概覽

/ (repo root)
├─ src/
│ ├─ manifest.json # MV3；Firefox 以 browser_specific_settings 補充 gecko id
│ ├─ background/
│ │ └─ service-worker.ts # 負責與 Notion API 溝通、收 token、storage
│ ├─ content/
│ │ ├─ fb-share-hook.ts # 監聽並注入「分享至 Notion」選項
│ │ └─ selection.ts # 抓取選取文字與當前 context
│ ├─ ui/
│ │ └─ options.html / .ts # Options 頁面（設定 Notion token、Database）
│ ├─ lib/
│ │ ├─ notion.ts # Notion API 包裝（寫入/測試連線）
│ │ ├─ dom.ts # DOM 工具（查找分享面板、注入項目）
│ │ └─ bridge.ts # content <-> background 的 message 協定
│ └─ styles/
│ └─ inject.css # 注入項目的樣式（維持和 Facebook 一致的視覺）
├─ tools/
│ ├─ build.mjs # 打包 / 產出各瀏覽器套件
│ └─ web-ext.config.js # Firefox 本機調試
├─ .github/
│ └─ workflows/release.yml # （可選）CI 打包並產生壓縮檔
├─ README.md
└─ Agents.md
