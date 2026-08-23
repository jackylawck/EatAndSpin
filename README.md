# 食一轉 · Eat & Spin 🍱🎡

An open-source, privacy-first decision-making web app for finding local dining options in Hong Kong using weighted random algorithms.

一款注重隱私、全本地端運算、專為香港在地用餐決策設計的加權抽籤轉盤網頁應用。

🔗 **Live Demo / 線上體驗：** [https://jackylawck.github.io/EatAndSpin/](https://jackylawck.github.io/EatAndSpin/)

---

## ✨ Features 特點

* 🏪 **Find Restaurants Mode 搵餐廳 Mode:** Dynamically query nearby restaurants using the **Google Places API** based on GPS coordinates or manual location input (e.g., Central, Kwun Tong).
* 🍱 **Set Menu Mode 揀 ABCD 餐 Mode:** Custom choices with weighted voting options for office lunch groups.
* 🎡 **Interactive Canvas Wheel 互動輪盤:** Smooth quartic ease-out spinning animation with smart text inversion and Retina display auto-scaling.
* 🔒 **Privacy-First (No Backend):** 100% client-side computing. Zero personal data or location tracking.
* 🌐 **Bilingual Interface:** Seamless real-time toggle between English and Traditional Chinese (zh-HK).
* ♿ **Accessibility (A11y):** Built with semantic HTML5, full ARIA attributes, and WCAG AA+ high contrast support.

---

## 🛠️ Tech Stack 技術架構

* **Frontend:** HTML5, Modern CSS3 (Design Tokens, Responsive Grid), Pure JavaScript (ES Modules, Canvas API)
* **APIs:** Google Places API (New - Text Search Endpoint), Hong Kong Observatory (HKO) API, KMB API
* **Security & Governance:** Strict CSP (Content Security Policy), XSS-immune DOM rendering, GDPR / PDPO compliance
* **Hosting:** GitHub Pages

---

## 📜 Legal & Compliance Powered by Google Statement

This project uses the Google Places API to retrieve real-time location and restaurant information.

> **Powered by Google**  
> Map and location data provided by [Google Places API](https://developers.google.com/maps/documentation/places/web-service). Usage of this application is subject to [Google Privacy Policy](https://policies.google.com/privacy) and [Google Terms of Service](https://policies.google.com/terms).

### Privacy & Governance
* [Privacy Policy 隱私政策](PRIVACY.md)
* [Terms of Service 服務條款與免責聲明](TERMS.md)

---

## 📄 License 授權

This project is open-source and available under the [MIT License](LICENSE).
