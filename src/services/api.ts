// src/services/api.ts
import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const stationService = {
  getStations: async () => {
    const response = await api.get('/stations');
    return response.data;
  },
  
  getStationData: async (stationId: string) => {
    const response = await api.get(`/stations/${stationId}/data`);
    return response.data;
  },
  
  getHistoricalData: async (stationId: string, timeRange: string) => {
    const response = await api.get(`/stations/${stationId}/historical`, {
      params: { range: timeRange }
    });
    return response.data;
  }
};

export const alertService = {
  getActiveAlerts: async () => {
    const response = await api.get('/alerts/active');
    return response.data;
  },
  
  acknowledgeAlert: async (alertId: string) => {
    const response = await api.post(`/alerts/${alertId}/acknowledge`);
    return response.data;
  }
};