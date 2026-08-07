# 食一轉 · Eat & Spin 🍲🎡

[Traditional Chinese](#繁體中文) | [English](#english)

---

<a name="繁體中文"></a>
## 🇭🇰 繁體中文

香港專屬、結合動態加權投票與地點檢索的餐飲決策 Web App！

「食一轉 · Eat & Spin」旨在解決最煩惱的「食乜好」問題；結合周邊餐廳自動檢索、自訂地點查詢、A/B/C/D 餐牌模式，以及獨創的投票加權輪盤，讓各類選擇兼具效率與娛樂性！

🔗 **Live Demo:** [https://jackylawck.github.io/EatAndSpin/](https://jackylawck.github.io/EatAndSpin/)

### ✨ 核心特色 (Key Features)

- 🏪 **雙決策模式 (Dual Modes)**
  - **搵餐廳 Mode**：自動搜尋周邊或指定地區真實餐廳。
  - **揀 ABCD 餐 Mode**：針對單一餐廳快速決策餐牌選項（如干炒牛河、焗豬扒飯等）。
- 🎯 **預先類別與菜式篩選 (Chips Filter)**
  - 支援事前剔除 Cafe/咖啡店，並可按「中菜/點心」、「日韓料理」、「東南亞/粉麵」、「西式/披薩」進行精準類別篩選。
- 🗳️ **團隊加權投票輪盤 (Weighted Voting Wheel)**
  - 支援選項手動 `+1 / -1` 投票。
  - **動態扇形面積**：票數越多的選項，在 Canvas 輪盤上的扇形面積越大、中獎機率越高！
- 📍 **多元地點搜尋 (Location & GPS Search)**
  - **GPS 一鍵定位**：自動檢索周圍約 1 公里內最多 12 間真實營運餐廳。
  - **自訂地點查詢**：支援輸入「觀塘」、「中環」、「銅鑼灣」等香港地區名稱自動檢索。
- ❌ **一鍵刪除與智能補抓 (Blacklist & Smart Replenish)**
  - 剔除無效或不符合條件的店舖時，自動紀錄至黑名單（Blacklist）。
  - **補抓機制**：按下 `🔄 補抓附近其他餐廳` 時，會自動跳過所有已刪除項目，精準補滿 12 間全新選項。
- 🔍 **OpenRice 一鍵食評對接 (OpenRice Integration)**
  - 轉出結果後，提供鮮明按鈕直達 OpenRice 香港搜尋頁，方便即時確認營業狀態、最新菜單與食評。
- 🔒 **隱私優先承諾 (Privacy-First Architecture)**
  - 位置數據僅於使用者瀏覽器本地（Client-Side）運算，絕不上傳或儲存至任何後端伺服器。
- 🌐 **雙語即時切換 (i18n)**
  - 支援繁體中文與英文介面即時切換（包含全站介面文字與 API 店名解析）。

### 🛠️ 技術架構 (Tech Stack)

- **Frontend:** Vanilla JavaScript (ES6+ Modules), HTML5 Canvas, CSS3 (Variables & Modern Flexbox)
- **Data & APIs:**
  - [OpenStreetMap Overpass API](https://overpass-api.de/) (免費免 Key 餐廳地理數據查詢，內建多鏡像備用節點)
  - [Nominatim OpenStreetMap API](https://nominatim.org/) (地名轉坐標地理編碼)
  - [Hong Kong Observatory API](https://www.hko.gov.hk/) (香港天文台天氣數據介接)
  - [KMB Open Data API](https://data.gov.hk/) (九巴即時到站班次查詢)
- **Deployment:** GitHub Pages

### 🛡️ 合規與 ISO 標準對齊 (ISO Compliance Alignment)

本專案在架構設計上嚴格遵循 **ISO/IEC 資訊安全與隱私國際標準** 之規範：

* **ISO/IEC 27701 (PIMS) / GDPR — 設計即隱私 (Privacy by Design)**
  * **無後端資料留存 (Zero Server Storage)**：採用純前端（Client-Side）運算架構，位置數據僅於使用者瀏覽器 Session 中即時處置，網頁關閉後自動釋放。
  * **資料最小化 (Data Minimization)**：不設置使用者註冊系統、不收集任何個人可識別資訊（PII）。
* **ISO/IEC 27001 (ISMS) — 通訊安全與權限控制**
  * **傳輸層加密 (TLS Encryption)**：全站與第三方 API 介接（OpenStreetMap / HKO / KMB）均強制採用 `HTTPS` 安全加密傳輸。
  * **明確授權 (Explicit Consent)**：地理位置存取嚴格遵循 W3C 隱私規範，必須取得使用者主動授權方可執行。
* **ISO/IEC 42001 (AIMS) / ISO 22301 — 系統透明度與營運韌性**
  * **容錯與備援機制 (Exception Handling)**：內建多重 Mirror API 節點切換、自動過濾已結業/無效標籤（Disused Tags），並提供 Fallback 預設選單，確保第三方 API 異常時仍能穩定運作。
  * **演算法透明度 (Algorithmic Transparency)**：輪盤轉動與加權機率演算完全公開、可追溯，且黑名單刪除邏輯無隱藏偏見。

---

<a name="english"></a>
## 🇬🇧 English

A Hong Kong-centric Web App combining real-time location retrieval, dynamic weighted voting, and interactive wheel decision-making for dining choices!

**Eat & Spin** is designed to solve the everyday dilemma: *"What to eat?"* It integrates nearby restaurant fetching, location querying, set-menu decision mode, and a dynamic weighted probability wheel, making dining decisions both efficient and entertaining!

🔗 **Live Demo:** [https://jackylawck.github.io/EatAndSpin/](https://jackylawck.github.io/EatAndSpin/)

### ✨ Key Features

- 🏪 **Dual Decision Modes**
  - **Find Restaurants Mode**: Automatically searches for real nearby or district-specific restaurants.
  - **Set Menu Mode**: Helps decide specific menu options for a single restaurant (e.g., Set A, Set B).
- 🎯 **Pre-filtering Chips**
  - Allows quick exclusion of cafes and filtering by cuisines (Chinese/Dim Sum, Japanese/Korean, Asian/Noodles, Western/Pizza).
- 🗳️ **Weighted Voting Wheel**
  - Supports manual `+1 / -1` voting for each option.
  - **Dynamic Slice Size**: Options with higher votes get larger slices on the HTML5 Canvas wheel, increasing their winning probability!
- 📍 **Flexible Location Retrieval**
  - **One-Tap GPS**: Fetches up to 12 nearby operational restaurants within a 1km radius.
  - **Custom District Query**: Supports search by Hong Kong district names (e.g., Kwun Tong, Central, Causeway Bay).
- ❌ **One-Tap Removal & Smart Replenishment**
  - Removed options are automatically added to a session blacklist.
  - Clicking `🔄 Replenish` fills the wheel up to 12 items while strictly excluding blacklisted/deleted options.
- 🔍 **Direct OpenRice Integration**
  - Spinning results include a direct link to OpenRice Hong Kong for instant access to reviews, menus, and business status.
- 🔒 **Privacy-First Architecture**
  - All location processing happens purely client-side in the browser. Zero server-side tracking or storage.
- 🌐 **Real-Time Bilingual Support (i18n)**
  - Seamless toggle between Traditional Chinese and English for both UI labels and API location names.

### 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+ Modules), HTML5 Canvas, CSS3 (CSS Variables & Flexbox)
- **Data & APIs:**
  - [OpenStreetMap Overpass API](https://overpass-api.de/) (Geospatial data queries with multi-mirror failover)
  - [Nominatim OpenStreetMap API](https://nominatim.org/) (Geocoding / Address-to-Coordinates)
  - [Hong Kong Observatory API](https://www.hko.gov.hk/) (Local weather data integration)
  - [KMB Open Data API](https://data.gov.hk/) (Bus arrival time queries)
- **Deployment:** GitHub Pages

### 🛡️ ISO Standard & Compliance Alignment

This project adheres strictly to **ISO/IEC international standards** regarding information security, privacy, and system resilience:

* **ISO/IEC 27701 (PIMS) / GDPR — Privacy by Design**
  * **Zero Server Storage**: Operates on a pure client-side architecture. Location data exists solely within the browser session and is purged upon tab closure.
  * **Data Minimization**: No user registration or collection of Personally Identifiable Information (PII).
* **ISO/IEC 27001 (ISMS) — Communication Security & Authorization**
  * **TLS Encryption**: All third-party API queries are strictly enforced over encrypted `HTTPS` endpoints.
  * **Explicit Consent**: Geolocation API access follows W3C privacy standards and requires explicit user permission.
* **ISO/IEC 42001 (AIMS) / ISO 22301 — Algorithmic Transparency & Business Continuity**
  * **Fault Tolerance & Failover**: Features multi-mirror Overpass endpoints, automated filtering of closed/disused tags, and fallback menus for high availability during API downtime.
  * **Algorithmic Transparency**: Wheel rotation and weighted probability algorithms are fully open, deterministic, and unbiased.

---

## 📄 License

MIT License © 2026 [Jacky Law](https://github.com/jackylawck)
