// js/main.js 中的餐廳清單升級
const defaultRestaurants = [
  { 
    name: '室內車仔麵', 
    indoor: true, 
    walkMins: 4, 
    footbridge: true, // 支援天橋直達
    nearestMtr: '觀塘站 B2 出口',
    kmbStopId: 'A1234', 
    kmbRoute: '1A' 
  },
  { 
    name: '露天煲仔飯', 
    indoor: false, 
    walkMins: 8, 
    footbridge: false,
    nearestMtr: '牛頭角站 A 出口'
  }
];
