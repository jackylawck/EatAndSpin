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
    return null;
  }
}
