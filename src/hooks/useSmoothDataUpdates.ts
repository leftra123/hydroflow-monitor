/**
 * 🔄 Smooth Data Updates Hook
 * 
 * Eliminates visual flickering by implementing smooth data transitions
 * Uses incremental updates and optimized polling for seamless real-time monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { StationDataPackage } from '@/types/sensors';

interface SmoothUpdateOptions {
  updateInterval: number; // milliseconds
  transitionDuration: number; // milliseconds
  enableSmoothing: boolean;
  maxRetries: number;
  retryDelay: number;
}

interface UpdateState {
  data: StationDataPackage[];
  isUpdating: boolean;
  lastUpdate: Date;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
}

const DEFAULT_OPTIONS: SmoothUpdateOptions = {
  updateInterval: 30000, // 30 seconds instead of 5 seconds
  transitionDuration: 1000, // 1 second smooth transition
  enableSmoothing: true,
  maxRetries: 3,
  retryDelay: 5000
};

export const useSmoothDataUpdates = (
  dataGenerator: () => StationDataPackage[],
  options: Partial<SmoothUpdateOptions> = {}
) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<UpdateState>({
    data: [],
    isUpdating: false,
    lastUpdate: new Date(),
    error: null,
    connectionStatus: 'connecting'
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const previousDataRef = useRef<StationDataPackage[]>([]);

  // Smooth interpolation between old and new values
  const interpolateValue = useCallback((
    oldValue: number,
    newValue: number,
    progress: number
  ): number => {
    if (!opts.enableSmoothing) return newValue;
    return oldValue + (newValue - oldValue) * progress;
  }, [opts.enableSmoothing]);

  // Create smooth transition between data sets
  const createSmoothTransition = useCallback((
    oldData: StationDataPackage[],
    newData: StationDataPackage[]
  ): Promise<StationDataPackage[]> => {
    return new Promise((resolve) => {
      if (!opts.enableSmoothing || isTransitioningRef.current) {
        resolve(newData);
        return;
      }

      isTransitioningRef.current = true;
      const startTime = Date.now();
      const duration = opts.transitionDuration;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic function for smooth animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const interpolatedData = newData.map((newStation, index) => {
          const oldStation = oldData[index];
          if (!oldStation || oldStation.stationId !== newStation.stationId) {
            return newStation;
          }

          return {
            ...newStation,
            waterLevel: {
              ...newStation.waterLevel,
              level: {
                ...newStation.waterLevel.level,
                value: interpolateValue(
                  oldStation.waterLevel.level.value,
                  newStation.waterLevel.level.value,
                  easeProgress
                )
              },
              rateOfChange: interpolateValue(
                oldStation.waterLevel.rateOfChange,
                newStation.waterLevel.rateOfChange,
                easeProgress
              )
            },
            flowRate: {
              ...newStation.flowRate,
              discharge: {
                ...newStation.flowRate.discharge,
                value: interpolateValue(
                  oldStation.flowRate.discharge.value,
                  newStation.flowRate.discharge.value,
                  easeProgress
                )
              },
              velocity: {
                ...newStation.flowRate.velocity,
                value: interpolateValue(
                  oldStation.flowRate.velocity.value,
                  newStation.flowRate.velocity.value,
                  easeProgress
                )
              }
            },
            waterQuality: {
              ...newStation.waterQuality,
              temperature: {
                ...newStation.waterQuality.temperature,
                value: interpolateValue(
                  oldStation.waterQuality.temperature.value,
                  newStation.waterQuality.temperature.value,
                  easeProgress
                )
              },
              conductivity: {
                ...newStation.waterQuality.conductivity,
                value: interpolateValue(
                  oldStation.waterQuality.conductivity.value,
                  newStation.waterQuality.conductivity.value,
                  easeProgress
                )
              }
            },
            meteorological: {
              ...newStation.meteorological,
              precipitation: {
                ...newStation.meteorological.precipitation,
                value: interpolateValue(
                  oldStation.meteorological.precipitation.value,
                  newStation.meteorological.precipitation.value,
                  easeProgress
                )
              }
            }
          };
        });

        setState(prev => ({
          ...prev,
          data: interpolatedData,
          isUpdating: progress < 1
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          isTransitioningRef.current = false;
          resolve(newData);
        }
      };

      requestAnimationFrame(animate);
    });
  }, [opts.enableSmoothing, opts.transitionDuration, interpolateValue]);

  // Fetch new data with error handling
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'connecting',
        error: null 
      }));

      // Simulate network delay for realistic behavior
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

      const newData = dataGenerator();
      const oldData = previousDataRef.current;

      // Only update if data has actually changed
      const hasChanged = JSON.stringify(oldData) !== JSON.stringify(newData);
      
      if (hasChanged || oldData.length === 0) {
        await createSmoothTransition(oldData, newData);
        previousDataRef.current = newData;
      }

      setState(prev => ({
        ...prev,
        data: newData,
        lastUpdate: new Date(),
        connectionStatus: 'connected',
        error: null,
        isUpdating: false
      }));

      retryCountRef.current = 0;

    } catch (error) {
      console.error('Data fetch error:', error);
      
      setState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido',
        isUpdating: false
      }));

      // Retry logic
      if (retryCountRef.current < opts.maxRetries) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData();
        }, opts.retryDelay);
      } else {
        setState(prev => ({
          ...prev,
          connectionStatus: 'disconnected'
        }));
      }
    }
  }, [dataGenerator, opts.maxRetries, opts.retryDelay, createSmoothTransition]);

  // Manual refresh function
  const refresh = useCallback(() => {
    if (!isTransitioningRef.current) {
      fetchData();
    }
  }, [fetchData]);

  // Start/stop automatic updates
  const startUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initial fetch
    fetchData();

    // Set up interval for subsequent updates
    intervalRef.current = setInterval(() => {
      if (!isTransitioningRef.current) {
        fetchData();
      }
    }, opts.updateInterval);
  }, [fetchData, opts.updateInterval]);

  const stopUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    startUpdates();
    return () => stopUpdates();
  }, [startUpdates, stopUpdates]);

  // Update interval when options change
  useEffect(() => {
    if (intervalRef.current) {
      startUpdates();
    }
  }, [opts.updateInterval, startUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data: state.data,
    isUpdating: state.isUpdating,
    lastUpdate: state.lastUpdate,
    error: state.error,
    connectionStatus: state.connectionStatus,
    refresh,
    startUpdates,
    stopUpdates
  };
};

// Hook for smooth chart data updates
export const useSmoothChartData = <T>(
  data: T[],
  transitionDuration: number = 1000
) => {
  const [smoothData, setSmoothData] = useState<T[]>(data);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (JSON.stringify(data) === JSON.stringify(smoothData)) {
      return;
    }

    setIsTransitioning(true);
    
    // Use requestAnimationFrame for smooth transitions
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / transitionDuration, 1);
      
      if (progress >= 1) {
        setSmoothData(data);
        setIsTransitioning(false);
        return;
      }
      
      // For chart data, we typically just want a smooth opacity transition
      // The actual data interpolation is handled by the chart library
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [data, smoothData, transitionDuration]);

  return {
    data: smoothData,
    isTransitioning
  };
};

// Connection status types for external components
export interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastUpdate: Date;
}

export const getConnectionStatusColor = (status: ConnectionStatusProps['status']) => {
  switch (status) {
    case 'connected': return 'bg-green-500';
    case 'connecting': return 'bg-yellow-500 animate-pulse';
    case 'disconnected': return 'bg-gray-500';
    case 'error': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const getConnectionStatusText = (status: ConnectionStatusProps['status']) => {
  switch (status) {
    case 'connected': return 'Conectado';
    case 'connecting': return 'Conectando...';
    case 'disconnected': return 'Desconectado';
    case 'error': return 'Error de conexión';
    default: return 'Desconocido';
  }
};
