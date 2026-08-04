// js/api/fetcher.js

/**
 * 安全的 Fetch 工具，自帶 Timeout 與 Error Handling
 * @param {string} url - API 網址
 * @param {object} options - Fetch 選項
 * @param {number} timeout - 超時時間 (ms)
 * @returns {Promise<object|null>} 返回 JSON 數據或 null
 */
export async function safeFetch(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`[SafeFetch] Request timed out: ${url}`);
    } else {
      console.warn(`[SafeFetch] Fetch failed: ${url}`, error.message);
    }
    return null; // 失敗時統一返回 null，方便調用方做容錯降級
  }
}
