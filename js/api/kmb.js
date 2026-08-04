// js/api/kmb.js
import { safeFetch } from './fetcher.js';
import { APP_CONFIG } from '../config.js';

/**
 * 獲取特定巴士站與路線的 ETA (Estimated Time of Arrival)
 * @param {string} stopId - 巴士站 ID
 * @param {string} route - 路線 (例: "1A")
 */
export async function getKmbETA(stopId, route) {
  const url = `https://data.etagmb.gov.hk/eta/get-eta-by-stop/${stopId}/${route}/1`;
  const data = await safeFetch(url, {}, APP_CONFIG.API.KMB.TIMEOUT);

  if (data && data.data && data.data.length > 0) {
    const nextBus = data.data[0];
    const etaTime = new Date(nextBus.eta);
    const minutesLeft = Math.max(0, Math.round((etaTime - new Date()) / 60000));
    return {
      success: true,
      route: nextBus.route,
      minutesLeft: minutesLeft,
      remark: nextBus.rmk_tc || ''
    };
  }

  return { success: false, minutesLeft: null };
}
