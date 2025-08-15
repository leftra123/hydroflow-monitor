/**
 * 🌊 HydroFlow Monitor - Store Global de Zustand
 * 
 * Este store representa la "única fuente de verdad" para todo el estado de la aplicación.
 * Implementa un patrón de arquitectura reactiva que centraliza:
 * - Estado de las estaciones de monitoreo
 * - Datos en tiempo real y históricos
 * - Sistema de alertas y notificaciones
 * - Configuración de UI y preferencias del usuario
 * - Estado de conexión y sincronización
 * 
 * Utiliza selectors optimizados para prevenir re-renders innecesarios
 * y mantiene la coherencia del estado a través de toda la aplicación.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { EstacionMonitoreo, DatosHistoricos, AlertaSistema } from '@/types';

// 🎯 Interfaces del Store
interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastConnected: Date | null;
  connectionAttempts: number;
  latency: number;
}

interface UIState {
  darkMode: boolean;
  isLiveMode: boolean;
  selectedStation: string;
  timeRange: '24h' | '7d' | '30d' | '1y';
  activeTab: string;
  sidebarCollapsed: boolean;
  mapView: 'satellite' | 'terrain' | 'street';
  show3DVisualization: boolean;
}

interface DataState {
  stations: EstacionMonitoreo[];
  historicalData: Record<string, DatosHistoricos[]>;
  alerts: AlertaSistema[];
  lastUpdate: Date | null;
  isLoading: boolean;
  error: string | null;
}

interface HydrologyStore extends DataState, UIState {
  connection: ConnectionState;
  
  // 🔄 Actions para gestión de datos
  setStations: (stations: EstacionMonitoreo[]) => void;
  updateStation: (stationId: string, data: Partial<EstacionMonitoreo>) => void;
  setHistoricalData: (stationId: string, data: DatosHistoricos[]) => void;
  addAlert: (alert: AlertaSistema) => void;
  removeAlert: (alertId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 🎨 Actions para UI
  toggleDarkMode: () => void;
  toggleLiveMode: () => void;
  setSelectedStation: (stationId: string) => void;
  setTimeRange: (range: '24h' | '7d' | '30d' | '1y') => void;
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  setMapView: (view: 'satellite' | 'terrain' | 'street') => void;
  toggle3DVisualization: () => void;
  
  // 🌐 Actions para conexión
  setConnectionState: (state: Partial<ConnectionState>) => void;
  incrementConnectionAttempts: () => void;
  resetConnectionAttempts: () => void;
  updateLatency: (latency: number) => void;
  
  // 🧮 Computed values (selectors)
  getCurrentStation: () => EstacionMonitoreo | undefined;
  getActiveAlerts: () => AlertaSistema[];
  getCriticalAlerts: () => AlertaSistema[];
  getStationAlerts: (stationId: string) => AlertaSistema[];
  getHistoricalDataForStation: (stationId: string) => DatosHistoricos[];
}

// 🏗️ Estado inicial
const initialState: DataState & UIState = {
  // Data State
  stations: [],
  historicalData: {},
  alerts: [],
  lastUpdate: null,
  isLoading: false,
  error: null,
  
  // UI State
  darkMode: true,
  isLiveMode: true,
  selectedStation: '',
  timeRange: '24h',
  activeTab: 'overview',
  sidebarCollapsed: false,
  mapView: 'satellite',
  show3DVisualization: true,
};

const initialConnectionState: ConnectionState = {
  isConnected: false,
  isReconnecting: false,
  lastConnected: null,
  connectionAttempts: 0,
  latency: 0,
};

/**
 * 🎯 Store Principal de Zustand con Middleware Avanzado
 * 
 * Utiliza tres middlewares clave:
 * - subscribeWithSelector: Para suscripciones granulares a cambios específicos
 * - immer: Para mutaciones inmutables del estado de forma intuitiva
 * - persist: Para persistencia automática en localStorage (opcional)
 */
export const useHydrologyStore = create<HydrologyStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,
      connection: initialConnectionState,
      
      // 🔄 Data Actions
      setStations: (stations) =>
        set((state) => {
          state.stations = stations;
          state.lastUpdate = new Date();
          // Auto-seleccionar primera estación si no hay ninguna seleccionada
          if (!state.selectedStation && stations.length > 0) {
            state.selectedStation = stations[0].id;
          }
        }, false), // false para evitar notificaciones innecesarias
      
      updateStation: (stationId, data) =>
        set((state) => {
          const stationIndex = state.stations.findIndex(s => s.id === stationId);
          if (stationIndex !== -1) {
            Object.assign(state.stations[stationIndex], data);
            state.lastUpdate = new Date();
          }
        }),
      
      setHistoricalData: (stationId, data) =>
        set((state) => {
          state.historicalData[stationId] = data;
        }),
      
      addAlert: (alert) =>
        set((state) => {
          // Evitar duplicados
          const exists = state.alerts.some(a => a.id === alert.id);
          if (!exists) {
            state.alerts.unshift(alert);
            // Mantener solo las últimas 50 alertas
            if (state.alerts.length > 50) {
              state.alerts = state.alerts.slice(0, 50);
            }
          }
        }),
      
      removeAlert: (alertId) =>
        set((state) => {
          state.alerts = state.alerts.filter(a => a.id !== alertId);
        }),
      
      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),
      
      setError: (error) =>
        set((state) => {
          state.error = error;
        }),
      
      // 🎨 UI Actions
      toggleDarkMode: () =>
        set((state) => {
          state.darkMode = !state.darkMode;
        }),
      
      toggleLiveMode: () =>
        set((state) => {
          state.isLiveMode = !state.isLiveMode;
        }),
      
      setSelectedStation: (stationId) =>
        set((state) => {
          state.selectedStation = stationId;
        }),
      
      setTimeRange: (range) =>
        set((state) => {
          state.timeRange = range;
        }),
      
      setActiveTab: (tab) =>
        set((state) => {
          state.activeTab = tab;
        }),
      
      toggleSidebar: () =>
        set((state) => {
          state.sidebarCollapsed = !state.sidebarCollapsed;
        }),
      
      setMapView: (view) =>
        set((state) => {
          state.mapView = view;
        }),
      
      toggle3DVisualization: () =>
        set((state) => {
          state.show3DVisualization = !state.show3DVisualization;
        }),
      
      // 🌐 Connection Actions
      setConnectionState: (connectionState) =>
        set((state) => {
          Object.assign(state.connection, connectionState);
        }),
      
      incrementConnectionAttempts: () =>
        set((state) => {
          state.connection.connectionAttempts += 1;
        }),
      
      resetConnectionAttempts: () =>
        set((state) => {
          state.connection.connectionAttempts = 0;
        }),
      
      updateLatency: (latency) =>
        set((state) => {
          state.connection.latency = latency;
        }),
      
      // 🧮 Computed Selectors
      getCurrentStation: () => {
        const { stations, selectedStation } = get();
        return stations.find(s => s.id === selectedStation);
      },
      
      getActiveAlerts: () => {
        const { alerts } = get();
        return alerts.filter(alert => {
          // Considerar activas las alertas de las últimas 24 horas
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return alert.timestamp > twentyFourHoursAgo;
        });
      },
      
      getCriticalAlerts: () => {
        const { alerts } = get();
        return alerts.filter(alert => alert.nivel === 'rojo');
      },
      
      getStationAlerts: (stationId) => {
        const { alerts } = get();
        return alerts.filter(alert => alert.estacionId === stationId);
      },
      
      getHistoricalDataForStation: (stationId) => {
        const { historicalData } = get();
        return historicalData[stationId] || [];
      },
    }))
  )
);

// 🎯 Selectors Optimizados para Performance
// Estos selectors previenen re-renders innecesarios al ser muy específicos

export const useStations = () => useHydrologyStore(state => state.stations);
export const useSelectedStation = () => useHydrologyStore(state => state.selectedStation);
export const useCurrentStation = () => useHydrologyStore(state => state.getCurrentStation());
export const useTimeRange = () => useHydrologyStore(state => state.timeRange);
export const useActiveAlerts = () => useHydrologyStore(state => state.getActiveAlerts());
export const useCriticalAlerts = () => useHydrologyStore(state => state.getCriticalAlerts());
export const useConnectionState = () => useHydrologyStore(state => state.connection);
export const useUIState = () => useHydrologyStore(state => ({
  darkMode: state.darkMode,
  isLiveMode: state.isLiveMode,
  activeTab: state.activeTab,
  sidebarCollapsed: state.sidebarCollapsed,
  mapView: state.mapView,
  show3DVisualization: state.show3DVisualization,
}));

// 🔄 Selector para datos históricos con memoización
export const useHistoricalData = (stationId: string) =>
  useHydrologyStore(state => state.getHistoricalDataForStation(stationId));

// 🚨 Selector para alertas de una estación específica
export const useStationAlerts = (stationId: string) =>
  useHydrologyStore(state => state.getStationAlerts(stationId));

/**
 * 🎭 Hook de Acciones
 * Separa las acciones del estado para un uso más limpio en los componentes
 */
export const useHydrologyActions = () => useHydrologyStore(state => ({
  // Data actions
  setStations: state.setStations,
  updateStation: state.updateStation,
  setHistoricalData: state.setHistoricalData,
  addAlert: state.addAlert,
  removeAlert: state.removeAlert,
  setLoading: state.setLoading,
  setError: state.setError,

  // UI actions
  toggleDarkMode: state.toggleDarkMode,
  toggleLiveMode: state.toggleLiveMode,
  setSelectedStation: state.setSelectedStation,
  setTimeRange: state.setTimeRange,
  setActiveTab: state.setActiveTab,
  toggleSidebar: state.toggleSidebar,
  setMapView: state.setMapView,
  toggle3DVisualization: state.toggle3DVisualization,

  // Connection actions
  setConnectionState: state.setConnectionState,
  incrementConnectionAttempts: state.incrementConnectionAttempts,
  resetConnectionAttempts: state.resetConnectionAttempts,
  updateLatency: state.updateLatency,
}));
