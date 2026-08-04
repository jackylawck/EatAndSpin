export const APP_CONFIG = {
  DEFAULT_LANG: 'zh',
  STORAGE_KEY_LANG: 'eat_spin_lang',
  API: {
    HKO: {
      WEATHER_URL: 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc',
      WARNING_URL: 'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc',
      TIMEOUT: 4000
    },
    KMB: {
      TIMEOUT: 3000
    }
  }
};
