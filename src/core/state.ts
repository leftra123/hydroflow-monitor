/**
 * 🎭 Arquitectura de Estado Pura
 * 
 * Reducer inmutable que gestiona el estado global de la aplicación.
 * Cada transición de estado es predecible, auditable y reversible.
 */

import { useReducer, useCallback, useMemo } from 'react';
import {
  ApplicationState,
  AppAction,
  ActionType,
  TimeRangeType,
  StationId,
  createTimestamp
} from '@/types/hydrology';

// 🎯 Estado Inicial - Configuración Inmutable
const INITIAL_STATE: ApplicationState = {
  theme: 'dark',
  selectedStation: null,
  timeRange: '24h',
  isRealTimeMode: true,
  lastUpdate: createTimestamp(new Date())
} as const;

// 🔄 Reducer Puro - Función de Transición de Estado
export const applicationReducer = (
  state: ApplicationState,
  action: AppAction
): ApplicationState => {
  switch (action.type) {
    case ActionType.TOGGLE_THEME:
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light',
        lastUpdate: createTimestamp(new Date())
      };

    case ActionType.SELECT_STATION:
      return {
        ...state,
        selectedStation: action.payload as StationId,
        lastUpdate: createTimestamp(new Date())
      };

    case ActionType.SET_TIME_RANGE:
      return {
        ...state,
        timeRange: action.payload as TimeRangeType,
        lastUpdate: createTimestamp(new Date())
      };

    case ActionType.TOGGLE_REALTIME:
      return {
        ...state,
        isRealTimeMode: !state.isRealTimeMode,
        lastUpdate: createTimestamp(new Date())
      };

    case ActionType.UPDATE_TIMESTAMP:
      return {
        ...state,
        lastUpdate: createTimestamp(new Date())
      };

    default:
      return state;
  }
};

// 🎨 Hook de Estado de Aplicación - Interfaz Reactiva
export const useApplicationState = () => {
  const [state, dispatch] = useReducer(applicationReducer, INITIAL_STATE);

  // 🎯 Acciones Memoizadas - Prevención de Re-renders
  const actions = useMemo(() => ({
    toggleTheme: () => dispatch({ type: ActionType.TOGGLE_THEME }),
    
    selectStation: (stationId: StationId) => 
      dispatch({ type: ActionType.SELECT_STATION, payload: stationId }),
    
    setTimeRange: (timeRange: TimeRangeType) => 
      dispatch({ type: ActionType.SET_TIME_RANGE, payload: timeRange }),
    
    toggleRealTime: () => dispatch({ type: ActionType.TOGGLE_REALTIME }),
    
    updateTimestamp: () => dispatch({ type: ActionType.UPDATE_TIMESTAMP })
  }), []);

  // 🧮 Selectores Computados - Derivación de Estado
  const selectors = useMemo(() => ({
    isDarkMode: state.theme === 'dark',
    hasSelectedStation: state.selectedStation !== null,
    isLongTermAnalysis: ['30d', '1y'].includes(state.timeRange),
    themeClasses: state.theme === 'dark' ? 'dark' : '',
    
    // Configuración de tema para gráficos
    chartTheme: {
      backgroundColor: state.theme === 'dark' ? '#0f172a' : '#ffffff',
      textColor: state.theme === 'dark' ? '#e2e8f0' : '#1e293b',
      gridColor: state.theme === 'dark' ? '#334155' : '#e2e8f0',
      tooltipBackground: state.theme === 'dark' ? '#1e293b' : '#f8fafc'
    }
  }), [state]);

  return {
    state,
    actions,
    selectors
  };
};

// 🌊 Hook de Datos Hidrológicos - Gestión de Datos del Dominio
export const useHydrologicalData = () => {
  // 📊 Generación de Datos Históricos Realistas
  const generateHistoricalData = useCallback((
    timeRange: TimeRangeType,
    stationId: StationId
  ) => {
    const now = new Date();
    const dataPoints: any[] = [];
    
    // Configuración temporal basada en el rango
    const timeConfig = {
      '1h': { points: 60, interval: 1, unit: 'minutes' },
      '24h': { points: 24, interval: 1, unit: 'hours' },
      '7d': { points: 168, interval: 1, unit: 'hours' },
      '30d': { points: 30, interval: 1, unit: 'days' },
      '1y': { points: 365, interval: 1, unit: 'days' }
    }[timeRange];

    // Parámetros base por estación
    const stationParams = {
      'station-pucon-centro': {
        baseFlow: 165,
        baseLevel: 2.8,
        baseVelocity: 2.1,
        baseTemp: 8.7,
        basePH: 7.3,
        baseOxygen: 9.2,
        baseTurbidity: 4.8
      },
      'station-holzapfel': {
        baseFlow: 198,
        baseLevel: 3.1,
        baseVelocity: 2.8,
        baseTemp: 9.1,
        basePH: 7.1,
        baseOxygen: 8.9,
        baseTurbidity: 6.2
      }
    }[stationId as string] || {
      baseFlow: 180,
      baseLevel: 2.9,
      baseVelocity: 2.4,
      baseTemp: 8.9,
      basePH: 7.2,
      baseOxygen: 9.0,
      baseTurbidity: 5.5
    };

    // Generación de serie temporal
    for (let i = 0; i < timeConfig.points; i++) {
      const timestamp = new Date(now);
      
      if (timeConfig.unit === 'minutes') {
        timestamp.setMinutes(timestamp.getMinutes() - (timeConfig.points - i));
      } else if (timeConfig.unit === 'hours') {
        timestamp.setHours(timestamp.getHours() - (timeConfig.points - i));
      } else {
        timestamp.setDate(timestamp.getDate() - (timeConfig.points - i));
      }

      // Patrones realistas con variaciones estacionales y diarias
      const seasonalFactor = 1 + 0.3 * Math.sin((i / timeConfig.points) * 2 * Math.PI);
      const dailyFactor = 1 + 0.1 * Math.sin((i / 24) * 2 * Math.PI);
      const noiseFactor = 1 + (Math.random() - 0.5) * 0.1;
      
      const combinedFactor = seasonalFactor * dailyFactor * noiseFactor;

      // Simulación de evento de precipitación ocasional
      const precipitationEvent = Math.random() < 0.05 ? Math.random() * 15 : 0;
      const precipitationEffect = precipitationEvent > 0 ? 1.2 : 1.0;

      dataPoints.push({
        timestamp: createTimestamp(timestamp),
        time: timestamp.toISOString(),
        waterLevel: Math.max(0.5, stationParams.baseLevel * combinedFactor * precipitationEffect),
        flowRate: Math.max(50, stationParams.baseFlow * combinedFactor * precipitationEffect),
        velocity: Math.max(0.5, stationParams.baseVelocity * combinedFactor),
        temperature: stationParams.baseTemp + (Math.random() - 0.5) * 2,
        pH: Math.max(6.0, Math.min(8.0, stationParams.basePH + (Math.random() - 0.5) * 0.4)),
        dissolvedOxygen: Math.max(6.0, stationParams.baseOxygen + (Math.random() - 0.5) * 1.5),
        turbidity: Math.max(1.0, stationParams.baseTurbidity * (1 + (Math.random() - 0.5) * 0.3)),
        precipitation: precipitationEvent
      });
    }

    return dataPoints;
  }, []);

  // 📈 Cálculo de Estadísticas de Serie Temporal
  const calculateTimeSeriesStats = useCallback((data: any[]) => {
    if (data.length === 0) return null;

    const metrics = ['waterLevel', 'flowRate', 'velocity', 'temperature', 'pH', 'dissolvedOxygen', 'turbidity'];
    const stats: any = {};

    metrics.forEach(metric => {
      const values = data.map(d => d[metric]).filter(v => v != null);
      if (values.length === 0) return;

      stats[metric] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        current: values[values.length - 1],
        trend: analyzeTrend(values)
      };
    });

    return stats;
  }, []);

  return {
    generateHistoricalData,
    calculateTimeSeriesStats
  };
};

// 🎨 Hook de Tema Dinámico - Gestión de Apariencia
export const useThemeConfiguration = (isDarkMode?: boolean) => {
  // Si se pasa isDarkMode como parámetro, usarlo; sino, obtenerlo del estado
  const { selectors } = useApplicationState();
  const darkMode = isDarkMode !== undefined ? isDarkMode : selectors.isDarkMode;

  const themeConfig = useMemo(() => ({
    // Colores principales
    colors: {
      primary: darkMode ? '#0ea5e9' : '#0284c7',
      secondary: darkMode ? '#06b6d4' : '#0891b2',
      success: darkMode ? '#10b981' : '#059669',
      warning: darkMode ? '#f59e0b' : '#d97706',
      danger: darkMode ? '#ef4444' : '#dc2626',
      background: darkMode ? '#0f172a' : '#ffffff',
      surface: darkMode ? '#1e293b' : '#f8fafc',
      text: darkMode ? '#e2e8f0' : '#1e293b',
      textMuted: darkMode ? '#94a3b8' : '#64748b'
    },

    // Configuración de gráficos
    charts: {
      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
      gridColor: darkMode ? '#334155' : '#e2e8f0',
      textColor: darkMode ? '#e2e8f0' : '#1e293b',
      tooltipBg: darkMode ? '#0f172a' : '#ffffff',
      tooltipBorder: darkMode ? '#334155' : '#e2e8f0'
    },

    // Gradientes
    gradients: {
      water: darkMode
        ? ['#0ea5e9', '#06b6d4', '#0891b2']
        : ['#3b82f6', '#06b6d4', '#0284c7'],
      temperature: darkMode
        ? ['#8b5cf6', '#a855f7', '#c084fc']
        : ['#6366f1', '#8b5cf6', '#a855f7'],
      quality: darkMode
        ? ['#10b981', '#f59e0b', '#ef4444']
        : ['#059669', '#d97706', '#dc2626']
    }
  }), [darkMode]);

  return themeConfig;
};

// 🧮 Función de Análisis de Tendencias (importada desde hydraulics)
const analyzeTrend = (values: readonly number[]): 'increasing' | 'decreasing' | 'stable' => {
  if (values.length < 2) return 'stable';
  
  let increases = 0;
  let decreases = 0;
  
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (Math.abs(diff) < 0.01) continue;
    
    if (diff > 0) increases++;
    else decreases++;
  }
  
  const totalChanges = increases + decreases;
  if (totalChanges === 0) return 'stable';
  
  const increaseRatio = increases / totalChanges;
  
  if (increaseRatio > 0.6) return 'increasing';
  if (increaseRatio < 0.4) return 'decreasing';
  return 'stable';
};
