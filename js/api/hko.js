import { safeFetch } from './fetcher.js';
import { APP_CONFIG } from '../config.js';

let weatherCache = null;

export async function getHKOStatus() {
  if (weatherCache) return weatherCache;

  try {
    const [weatherData, warningData] = await Promise.all([
      safeFetch(APP_CONFIG.API.HKO.WEATHER_URL, {}, APP_CONFIG.API.HKO.TIMEOUT),
      safeFetch(APP_CONFIG.API.HKO.WARNING_URL, {}, APP_CONFIG.API.HKO.TIMEOUT)
    ]);

    const isRaining = weatherData?.rainfall?.data?.some(r => r.max > 0) || false;
    const isVeryHot = !!warningData?.WHOT;
    const temp = weatherData?.temperature?.data[0]?.value || 25;

    weatherCache = {
      success: !!weatherData,
      temp,
      isRaining,
      isVeryHot
    };
  } catch (err) {
    console.warn("HKO API error, fallback to default", err);
    weatherCache = { success: false, temp: 25, isRaining: false, isVeryHot: false };
  }

  return weatherCache;
}
