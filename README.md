# 食一轉 · Eat & Spin 🍲🎡

> 香港專屬、結合動態加權投票與地點檢索的午餐決策 Web App！

「食一轉 · Eat & Spin」旨在解決上班族與團隊每天最煩惱的「中午食乜好」問題。支援周邊餐廳自動檢索、自訂地點查詢、A/B/C/D 餐牌模式，以及獨創的團隊投票加權輪盤，讓午餐選擇兼具效率與娛樂性！

🔗 **Live Demo:** [https://jackylawck.github.io/EatAndSpin/](https://jackylawck.github.io/EatAndSpin/)

---

## ✨ 核心特色 (Key Features)

- 🏪 **雙決策模式 (Dual Modes)**
  - **搵餐廳 Mode**：自動搜尋周邊或指定地區真實餐廳。
  - **揀 ABCD 餐 Mode**：針對單一餐廳快速決策餐牌選項（如干炒牛河、焗豬扒飯等）。
- 🗳️ **團隊加權投票輪盤 (Weighted Voting Wheel)**
  - 支援選項手動 `+1 / -1` 投票。
  - **動態扇形面積**：票數越多的選項，在 Canvas 輪盤上的扇形面積越大、中獎機率越高！
- 📍 **多元地點搜尋 (Location & GPS Search)**
  - **GPS 一鍵定位**：自動拉出周圍 500 米內 12 間真實餐廳。
  - **自訂地點查詢**：支援輸入「觀塘」、「中環」、「銅鑼灣」等香港地名自動檢索。
- 🔒 **隱私優先承諾 (Privacy-First Architecture)**
  - 位置數據僅於使用者瀏覽器本地（Client-Side）運算，絕不上傳或儲存至任何後端伺服器。
- 🗺️ **一鍵地圖導航 (One-Tap Navigation)**
  - 抽中結果後，提供 Google Maps 地圖導航與食評連結。
- 🌐 **雙語支援 (i18n)**
  - 支援繁體中文與英文介面切換。

---

## 🛠️ 技術架構 (Tech Stack)

- **Frontend:** Vanilla JavaScript (ES6+ Modules), HTML5 Canvas, CSS3 (Variables & Modern Flexbox)
- **Data & APIs:**
  - [OpenStreetMap Overpass API](https://overpass-api.de/) (免費免 Key 餐廳地理數據查詢)
  - [Nominatim OpenStreetMap API](https://nominatim.org/) (地名轉坐標地理編碼)
  - [Hong Kong Observatory API](https://www.hko.gov.hk/) (香港天文台天氣數據介接)
  - [KMB Open Data API](https://data.gov.hk/) (九巴即時到站班次查詢)
- **Deployment:** GitHub Pages

---

## 🔒 隱私與安全聲明 (Privacy & Security Notice)

本專案遵守嚴格的數據隱私原則：
1. **無後端追蹤**：本應用為純前端單頁應用（SPA），不設任何數據資料庫。
2. **GPS 數據保護**：用戶的地理位置僅於設備本地用於計算餐廳距離與 API 查詢，網頁關閉後即刻釋放，絕不上傳或出售個人位置數據。

---

## 📄 授權條款 (License)

MIT License © 2026 [Jacky Law](https://github.com/jackylawck)
