// js/config.js

export const APP_CONFIG = {
  DEFAULT_LANG: 'zh',
  STORAGE_KEY_LANG: 'eat_spin_lang',
  API: {
    HKO: {
      WEATHER_URL: 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc',
      WARNING_URL: 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc',
      TIMEOUT: 4000 // 4秒超時
    },
    KMB: {
      BASE_URL: 'https://data.etagmb.gov.hk',
      TIMEOUT: 3000
    }
  }
};
