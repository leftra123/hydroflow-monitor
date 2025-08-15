/**
 * 📊 Hooks de React Query para Datos en Tiempo Real
 * 
 * Este módulo proporciona hooks personalizados que combinan React Query
 * con el store de Zustand para un manejo inteligente de datos del servidor.
 * 
 * Características:
 * - Caching inteligente con invalidación automática
 * - Sincronización con datos en tiempo real via Socket.IO
 * - Optimistic updates para mejor UX
 * - Background refetching y stale-while-revalidate
 * - Error handling robusto con retry automático
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stationService, alertService } from '@/services/api';
import { 
  useHydrologyActions, 
  useSelectedStation, 
  useTimeRange,
  useConnectionState 
} from '@/store/useHydrologyStore';
import { EstacionMonitoreo, DatosHistoricos, AlertaSistema } from '@/types';

// 🎯 Query Keys para organización y invalidación
export const queryKeys = {
  stations: ['stations'] as const,
  station: (id: string) => ['stations', id] as const,
  historicalData: (stationId: string, timeRange: string) => 
    ['historical', stationId, timeRange] as const,
  alerts: ['alerts'] as const,
  activeAlerts: ['alerts', 'active'] as const,
  stationAlerts: (stationId: string) => ['alerts', 'station', stationId] as const,
} as const;

/**
 * 🏭 Hook para obtener todas las estaciones
 */
export const useStationsQuery = () => {
  const actions = useHydrologyActions();

  return useQuery({
    queryKey: queryKeys.stations,
    queryFn: async (): Promise<EstacionMonitoreo[]> => {
      // Datos mock para desarrollo sin backend
      const mockStations: EstacionMonitoreo[] = [
        {
          id: 'station1',
          nombre: 'Río Claro - Pucón Centro',
          lat: -39.2833,
          lng: -71.7167,
          estado: 'normal',
          caudal: 165.3,
          nivel: 2.84,
          velocidad: 2.1,
          presion: 103.5,
          temperatura: 8.7,
          ph: 7.3,
          oxigeno: 9.2,
          turbidez: 4.8,
        },
        {
          id: 'station2',
          nombre: 'Río Claro - Puente Holzapfel',
          lat: -39.2900,
          lng: -71.7200,
          estado: 'alerta',
          caudal: 198.7,
          nivel: 3.12,
          velocidad: 2.8,
          presion: 102.8,
          temperatura: 9.1,
          ph: 7.1,
          oxigeno: 8.9,
          turbidez: 6.2,
        },
        {
          id: 'station3',
          nombre: 'Río Claro - Desembocadura',
          lat: -39.2750,
          lng: -71.7100,
          estado: 'critico',
          caudal: 234.5,
          nivel: 3.89,
          velocidad: 3.2,
          presion: 101.9,
          temperatura: 9.8,
          ph: 6.9,
          oxigeno: 8.1,
          turbidez: 8.7,
        }
      ];

      // Sincronizar con el store de Zustand
      actions.setStations(mockStations);
      return mockStations;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false, // Deshabilitar para evitar requests
    refetchOnReconnect: false,
    refetchInterval: false, // Deshabilitar polling
    retry: false, // No reintentar
  });
};

/**
 * 🎯 Hook para obtener datos de una estación específica
 */
export const useStationQuery = (stationId: string) => {
  const actions = useHydrologyActions();

  return useQuery({
    queryKey: queryKeys.station(stationId),
    queryFn: async (): Promise<EstacionMonitoreo> => {
      const stationData = await stationService.getStationData(stationId);
      // Actualizar el store con los nuevos datos
      actions.updateStation(stationId, stationData);
      return stationData;
    },
    enabled: !!stationId, // Solo ejecutar si hay stationId
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10000, // Refetch cada 10 segundos para datos en vivo
  });
};

/**
 * 📈 Hook para datos históricos con invalidación inteligente
 */
export const useHistoricalDataQuery = (stationId?: string, timeRange?: string) => {
  const selectedStation = useSelectedStation();
  const currentTimeRange = useTimeRange();
  const actions = useHydrologyActions();
  
  // Usar parámetros proporcionados o valores del store
  const finalStationId = stationId || selectedStation;
  const finalTimeRange = timeRange || currentTimeRange;

  return useQuery({
    queryKey: queryKeys.historicalData(finalStationId, finalTimeRange),
    queryFn: async (): Promise<DatosHistoricos[]> => {
      if (!finalStationId) throw new Error('No station ID provided');
      
      const historicalData = await stationService.getHistoricalData(
        finalStationId, 
        finalTimeRange
      );
      
      // Sincronizar con el store
      actions.setHistoricalData(finalStationId, historicalData);
      return historicalData;
    },
    enabled: !!finalStationId, // Solo ejecutar si hay estación
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    // Los datos históricos no cambian frecuentemente
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

/**
 * 🚨 Hook para alertas activas
 */
export const useActiveAlertsQuery = () => {
  const actions = useHydrologyActions();

  return useQuery({
    queryKey: queryKeys.activeAlerts,
    queryFn: async (): Promise<AlertaSistema[]> => {
      const alerts = await alertService.getActiveAlerts();
      // Sincronizar alertas con el store
      alerts.forEach(alert => actions.addAlert(alert));
      return alerts;
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 15000, // Refetch cada 15 segundos
    refetchOnWindowFocus: true,
  });
};

/**
 * ✅ Mutation para reconocer alertas
 */
export const useAcknowledgeAlertMutation = () => {
  const queryClient = useQueryClient();
  const actions = useHydrologyActions();

  return useMutation({
    mutationFn: async (alertId: string) => {
      return await alertService.acknowledgeAlert(alertId);
    },
    onMutate: async (alertId) => {
      // Optimistic update: remover la alerta inmediatamente
      actions.removeAlert(alertId);
      
      // Cancelar queries en progreso para evitar conflictos
      await queryClient.cancelQueries({ queryKey: queryKeys.activeAlerts });
      
      // Snapshot del estado anterior para rollback
      const previousAlerts = queryClient.getQueryData(queryKeys.activeAlerts);
      
      // Optimistic update en el cache de React Query
      queryClient.setQueryData(queryKeys.activeAlerts, (old: AlertaSistema[] = []) => 
        old.filter(alert => alert.id !== alertId)
      );
      
      return { previousAlerts };
    },
    onError: (err, alertId, context) => {
      // Rollback en caso de error
      if (context?.previousAlerts) {
        queryClient.setQueryData(queryKeys.activeAlerts, context.previousAlerts);
      }
      console.error('Error al reconocer alerta:', err);
    },
    onSettled: () => {
      // Invalidar y refetch las alertas para asegurar consistencia
      queryClient.invalidateQueries({ queryKey: queryKeys.activeAlerts });
    },
  });
};

/**
 * 🔄 Hook para invalidación manual de datos
 */
export const useDataInvalidation = () => {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidar datos de estaciones
     */
    invalidateStations: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stations });
    },

    /**
     * Invalidar datos de una estación específica
     */
    invalidateStation: (stationId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.station(stationId) });
    },

    /**
     * Invalidar datos históricos
     */
    invalidateHistoricalData: (stationId?: string, timeRange?: string) => {
      if (stationId && timeRange) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.historicalData(stationId, timeRange) 
        });
      } else {
        // Invalidar todos los datos históricos
        queryClient.invalidateQueries({ queryKey: ['historical'] });
      }
    },

    /**
     * Invalidar alertas
     */
    invalidateAlerts: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
    },

    /**
     * Invalidar todos los datos
     */
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },

    /**
     * Limpiar cache específico
     */
    clearCache: (queryKey: readonly unknown[]) => {
      queryClient.removeQueries({ queryKey });
    },

    /**
     * Refetch manual de datos específicos
     */
    refetchStations: () => {
      return queryClient.refetchQueries({ queryKey: queryKeys.stations });
    },

    refetchHistoricalData: (stationId: string, timeRange: string) => {
      return queryClient.refetchQueries({ 
        queryKey: queryKeys.historicalData(stationId, timeRange) 
      });
    },
  };
};

/**
 * 🎯 Hook combinado para la estación actual
 * Combina datos de la estación seleccionada con sus datos históricos
 */
export const useCurrentStationData = () => {
  const selectedStation = useSelectedStation();
  const timeRange = useTimeRange();
  
  const stationQuery = useStationQuery(selectedStation);
  const historicalQuery = useHistoricalDataQuery(selectedStation, timeRange);
  
  return {
    // Datos de la estación actual
    station: stationQuery.data,
    isStationLoading: stationQuery.isLoading,
    stationError: stationQuery.error,
    
    // Datos históricos
    historicalData: historicalQuery.data,
    isHistoricalLoading: historicalQuery.isLoading,
    historicalError: historicalQuery.error,
    
    // Estado combinado
    isLoading: stationQuery.isLoading || historicalQuery.isLoading,
    hasError: !!stationQuery.error || !!historicalQuery.error,
    
    // Métodos de refetch
    refetchStation: stationQuery.refetch,
    refetchHistorical: historicalQuery.refetch,
    refetchAll: () => Promise.all([
      stationQuery.refetch(),
      historicalQuery.refetch(),
    ]),
  };
};
