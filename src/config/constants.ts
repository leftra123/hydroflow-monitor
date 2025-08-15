// src/config/constants.ts
export const REFRESH_INTERVAL = 5000; // 5 segundos
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const ALERT_THRESHOLDS = {
  NIVEL: {
    VERDE: 3,
    AMARILLO: 3.5,
    NARANJA: 4,
    ROJO: 4.5
  },
  CAUDAL: {
    VERDE: 150,
    AMARILLO: 200,
    NARANJA: 250,
    ROJO: 300
  }
};

export const STATION_COORDS = {
  LAGUNA_QUILLELHUE: {
    lat: -39.2833,
    lng: -71.7167,
    altitude: 850
  },
  CONFLUENCIA_VILLARRICA: {
    lat: -39.2667,
    lng: -71.9333,
    altitude: 750
  }
};