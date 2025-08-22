# Agents.md

本文件定義專案中 **Agent 的行為規範**，包含 PDCA cycle 的操作方式、文件規則。

---

# PDCA 系統

## 1. PDCA 循環操作

### Plan（計劃）

* 若 `.pdca-cycle/plan.md` 尚未存在，需參考既有程式碼（如果有的話），並可詢問使用者，以撰寫初始的 `plan.md`
* 當 `plan.md` 存在時，參考其中的長遠目標 (goals)、中目標 (roadmap)、短目標 (todo list)
* 制定本循環任務與目標
* 在 `.pdca-cycle/cycle_journal.md` 新增 **Plan 區塊**

### Do（執行）

* 根據計劃執行任務
* 將進度與結果寫入 `cycle_journal.md` 的 **Do 區塊**

### Check（檢查）

* 比對執行結果與計劃
* 評估目標完成度，紀錄檢討
* 更新 `cycle_journal.md` 的 **Check 區塊**

### Act（改善）

* 根據檢討提出改善方案
* 必要時更新 `plan.md`
* 在 `cycle_journal.md` 新增 **Act 區塊**，並開啟下一輪

---

## 2. 文件規則

* `.pdca-cycle/plan.md` 應包含三個部分：

  * **Goals (長遠目標)**：每個目標為一個 **goal**
  * **Roadmap (中目標)**：每個目標為一個 **milestone**
  * **Todo List (短目標)**：每個目標為一個 **task**
* 所有紀錄保持 **簡短條列式**，每點不超過 3 行
* 所有文件使用 UTF-8 編碼與 Markdown 格式
* 新增的檔案需放在 `.pdca-cycle/`  資料夾

---







