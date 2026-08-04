// js/api/kmb.js
import { safeFetch } from './fetcher.js';
import { APP_CONFIG } from '../config.js';

export async function getKmbETA(stopId, route) {
  if (!stopId || !route) return { success: false };
  const url = `https://data.etagmb.gov.hk/eta/get-eta-by-stop/${stopId}/${route}/1`;
  const data = await safeFetch(url, {}, APP_CONFIG.API.KMB?.TIMEOUT || 3000);

  if (data && data.data && data.data.length > 0) {
    const nextBus = data.data[0];
    if (nextBus.eta) {
      const etaTime = new Date(nextBus.eta);
      const minutesLeft = Math.max(0, Math.round((etaTime - new Date()) / 60000));
      return {
        success: true,
        route: nextBus.route,
        minutesLeft: minutesLeft
      };
    }
  }
  return { success: false };
}
