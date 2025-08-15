/**
 * 🔌 Hook para Conexión en Tiempo Real
 * 
 * Este hook proporciona una interfaz reactiva para el servicio de Socket.IO.
 * Maneja automáticamente la inicialización, limpieza, y sincronización con el store.
 * 
 * Características:
 * - Inicialización automática del socket
 * - Limpieza automática en unmount
 * - Sincronización con cambios de estación seleccionada
 * - Solicitud automática de datos históricos
 * - Manejo de permisos de notificaciones
 */

import { useEffect, useRef } from 'react';
import { socketService } from '@/services/socket';
import { 
  useSelectedStation, 
  useTimeRange, 
  useConnectionState,
  useHydrologyActions 
} from '@/store/useHydrologyStore';

interface UseRealtimeConnectionOptions {
  /**
   * Si debe inicializar automáticamente la conexión
   * @default true
   */
  autoConnect?: boolean;
  
  /**
   * Si debe solicitar permisos de notificación
   * @default true
   */
  requestNotificationPermission?: boolean;
  
  /**
   * Si debe solicitar datos históricos automáticamente
   * @default true
   */
  autoRequestHistoricalData?: boolean;
}

/**
 * 🌐 Hook principal para conexión en tiempo real
 */
export const useRealtimeConnection = (options: UseRealtimeConnectionOptions = {}) => {
  const {
    autoConnect = true,
    requestNotificationPermission = true,
    autoRequestHistoricalData = true,
  } = options;

  // Estado del store
  const selectedStation = useSelectedStation();
  const timeRange = useTimeRange();
  const connectionState = useConnectionState();
  const actions = useHydrologyActions();

  // Referencias para evitar efectos innecesarios
  const previousStation = useRef<string>('');
  const previousTimeRange = useRef<string>('');
  const isInitialized = useRef(false);

  /**
   * 🚀 Inicializar conexión (DESHABILITADO para evitar errores)
   */
  useEffect(() => {
    // Temporalmente deshabilitado para evitar errores de conexión
    // hasta que se implemente el backend
    console.log('🌊 Socket.IO deshabilitado (no hay backend)');

    // Solicitar permisos de notificación
    if (requestNotificationPermission && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('🔔 Permisos de notificación:', permission);
        });
      }
    }
  }, [requestNotificationPermission]);

  /**
   * 📡 Manejar cambios de estación seleccionada
   */
  useEffect(() => {
    if (!selectedStation || !socketService.isConnected) return;

    // Desuscribirse de la estación anterior
    if (previousStation.current && previousStation.current !== selectedStation) {
      socketService.unsubscribeFromStation(previousStation.current);
    }

    // Suscribirse a la nueva estación
    if (selectedStation !== previousStation.current) {
      console.log('📡 Suscribiéndose a estación:', selectedStation);
      socketService.subscribeToStation(selectedStation);
      previousStation.current = selectedStation;
    }
  }, [selectedStation, connectionState.isConnected]);

  /**
   * 📊 Manejar solicitudes de datos históricos
   */
  useEffect(() => {
    if (!autoRequestHistoricalData || !selectedStation || !socketService.isConnected) return;

    // Solicitar datos históricos si cambió la estación o el rango de tiempo
    if (
      selectedStation !== previousStation.current || 
      timeRange !== previousTimeRange.current
    ) {
      console.log('📊 Solicitando datos históricos:', { selectedStation, timeRange });
      socketService.requestHistoricalData(selectedStation, timeRange);
      previousTimeRange.current = timeRange;
    }
  }, [selectedStation, timeRange, connectionState.isConnected, autoRequestHistoricalData]);

  /**
   * 🔄 Métodos de control de conexión
   */
  const connectionControls = {
    /**
     * Reconectar manualmente
     */
    reconnect: () => {
      console.log('🔄 Reconectando manualmente...');
      socketService.reconnect();
    },

    /**
     * Desconectar manualmente
     */
    disconnect: () => {
      console.log('🔌 Desconectando manualmente...');
      socketService.disconnect();
      actions.setConnectionState({ isConnected: false });
    },

    /**
     * Conectar manualmente
     */
    connect: () => {
      console.log('🚀 Conectando manualmente...');
      socketService.initialize();
    },

    /**
     * Solicitar datos históricos manualmente
     */
    requestHistoricalData: (stationId?: string, range?: string) => {
      const station = stationId || selectedStation;
      const timeRangeToUse = range || timeRange;
      
      if (station && socketService.isConnected) {
        socketService.requestHistoricalData(station, timeRangeToUse);
      }
    },

    /**
     * Cambiar suscripción de estación
     */
    subscribeToStation: (stationId: string) => {
      if (previousStation.current) {
        socketService.unsubscribeFromStation(previousStation.current);
      }
      socketService.subscribeToStation(stationId);
      previousStation.current = stationId;
    },
  };

  return {
    // Estado de conexión
    isConnected: connectionState.isConnected,
    isReconnecting: connectionState.isReconnecting,
    connectionAttempts: connectionState.connectionAttempts,
    latency: connectionState.latency,
    lastConnected: connectionState.lastConnected,
    
    // Controles
    ...connectionControls,
  };
};

/**
 * 🎯 Hook simplificado para componentes que solo necesitan el estado
 */
export const useConnectionStatus = () => {
  const connectionState = useConnectionState();
  
  return {
    isConnected: connectionState.isConnected,
    isReconnecting: connectionState.isReconnecting,
    latency: connectionState.latency,
    connectionAttempts: connectionState.connectionAttempts,
    lastConnected: connectionState.lastConnected,
  };
};

/**
 * 🚨 Hook para alertas en tiempo real
 */
export const useRealtimeAlerts = () => {
  const actions = useHydrologyActions();
  
  useEffect(() => {
    // Este hook se puede extender para manejar alertas específicas
    // Por ejemplo, reproducir sonidos, mostrar notificaciones personalizadas, etc.
    
    return () => {
      // Cleanup si es necesario
    };
  }, []);

  return {
    // Métodos para manejar alertas
    acknowledgeAlert: (alertId: string) => {
      actions.removeAlert(alertId);
    },
  };
};

/**
 * 🔔 Hook para gestión de notificaciones
 */
export const useNotifications = () => {
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('🔔 Notificaciones no soportadas en este navegador');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
    return null;
  };

  return {
    permission: 'Notification' in window ? Notification.permission : 'denied',
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
  };
};
