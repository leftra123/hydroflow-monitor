/**
 * 🌐 HydroFlow Monitor - Servicio de Socket.IO
 * 
 * Este servicio maneja la conexión persistente con el backend para datos en tiempo real.
 * Implementa un patrón de reconexión automática, gestión de latencia, y eventos tipados.
 * 
 * Características:
 * - Reconexión automática con backoff exponencial
 * - Medición de latencia en tiempo real
 * - Eventos tipados para type safety
 * - Integración directa con el store de Zustand
 * - Manejo robusto de errores y desconexiones
 */

import { io, Socket } from 'socket.io-client';
import { useHydrologyStore } from '@/store/useHydrologyStore';
import { EstacionMonitoreo, DatosHistoricos, AlertaSistema } from '@/types';

// 🎯 Tipos de eventos del Socket
interface ServerToClientEvents {
  // Eventos de datos
  'station:update': (data: { stationId: string; data: Partial<EstacionMonitoreo> }) => void;
  'station:data': (data: EstacionMonitoreo) => void;
  'historical:data': (data: { stationId: string; data: DatosHistoricos[] }) => void;
  
  // Eventos de alertas
  'alert:new': (alert: AlertaSistema) => void;
  'alert:resolved': (alertId: string) => void;
  
  // Eventos de sistema
  'system:status': (status: { timestamp: Date; message: string }) => void;
  'connection:pong': (timestamp: number) => void;
}

interface ClientToServerEvents {
  // Suscripciones
  'subscribe:station': (stationId: string) => void;
  'unsubscribe:station': (stationId: string) => void;
  'subscribe:alerts': () => void;
  
  // Solicitudes de datos
  'request:historical': (params: { stationId: string; timeRange: string }) => void;
  'request:stations': () => void;
  
  // Ping para latencia
  'connection:ping': (timestamp: number) => void;
}

// 🏗️ Clase del Servicio de Socket
class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Inicial: 1 segundo
  private pingInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * 🚀 Inicializar la conexión Socket.IO
   */
  initialize() {
    if (this.isInitialized) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: false, // Manejamos la reconexión manualmente
    });

    this.setupEventListeners();
    this.startPingInterval();
    this.isInitialized = true;
  }

  /**
   * 🎧 Configurar los event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    // 🔌 Eventos de conexión
    this.socket.on('connect', () => {
      console.log('🌊 Socket conectado:', this.socket?.id);
      
      useHydrologyStore.getState().setConnectionState({
        isConnected: true,
        isReconnecting: false,
        lastConnected: new Date(),
      });
      
      useHydrologyStore.getState().resetConnectionAttempts();
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      // Solicitar datos iniciales
      this.requestInitialData();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket desconectado:', reason);
      
      useHydrologyStore.getState().setConnectionState({
        isConnected: false,
        isReconnecting: false,
      });

      // Intentar reconexión si no fue intencional
      if (reason === 'io server disconnect') {
        // El servidor cerró la conexión, reconectar manualmente
        this.attemptReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      
      useHydrologyStore.getState().setConnectionState({
        isConnected: false,
        isReconnecting: true,
      });
      
      this.attemptReconnection();
    });

    // 📊 Eventos de datos
    this.socket.on('station:update', ({ stationId, data }) => {
      useHydrologyStore.getState().updateStation(stationId, data);
    });

    this.socket.on('station:data', (station) => {
      useHydrologyStore.getState().updateStation(station.id, station);
    });

    this.socket.on('historical:data', ({ stationId, data }) => {
      useHydrologyStore.getState().setHistoricalData(stationId, data);
    });

    // 🚨 Eventos de alertas
    this.socket.on('alert:new', (alert) => {
      useHydrologyStore.getState().addAlert(alert);
      
      // Mostrar notificación si es crítica
      if (alert.nivel === 'rojo') {
        this.showCriticalAlert(alert);
      }
    });

    this.socket.on('alert:resolved', (alertId) => {
      useHydrologyStore.getState().removeAlert(alertId);
    });

    // 🏓 Eventos de ping/pong para latencia
    this.socket.on('connection:pong', (timestamp) => {
      const latency = Date.now() - timestamp;
      useHydrologyStore.getState().updateLatency(latency);
    });

    // 🔧 Eventos de sistema
    this.socket.on('system:status', (status) => {
      console.log('📡 Estado del sistema:', status);
    });
  }

  /**
   * 🔄 Intentar reconexión con backoff exponencial
   */
  private attemptReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
      useHydrologyStore.getState().setConnectionState({
        isReconnecting: false,
      });
      return;
    }

    this.reconnectAttempts++;
    useHydrologyStore.getState().incrementConnectionAttempts();

    console.log(`🔄 Intentando reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${this.reconnectDelay}ms`);

    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, this.reconnectDelay);

    // Backoff exponencial: duplicar el delay cada intento
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Máximo 30 segundos
  }

  /**
   * 📡 Solicitar datos iniciales al conectar
   */
  private requestInitialData() {
    if (!this.socket?.connected) return;

    // Solicitar lista de estaciones
    this.socket.emit('request:stations');
    
    // Suscribirse a alertas
    this.socket.emit('subscribe:alerts');
    
    // Si hay una estación seleccionada, suscribirse a ella
    const selectedStation = useHydrologyStore.getState().selectedStation;
    if (selectedStation) {
      this.subscribeToStation(selectedStation);
    }
  }

  /**
   * 🏓 Iniciar el intervalo de ping para medir latencia
   */
  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('connection:ping', Date.now());
      }
    }, 10000); // Ping cada 10 segundos
  }

  /**
   * 🚨 Mostrar alerta crítica
   */
  private showCriticalAlert(alert: AlertaSistema) {
    // Aquí se podría integrar con un sistema de notificaciones
    // Por ahora, usamos console y podrías integrar con react-hot-toast
    console.warn('🚨 ALERTA CRÍTICA:', alert.mensaje);
    
    // Si el navegador soporta notificaciones
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 HydroFlow - Alerta Crítica', {
        body: alert.mensaje,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    }
  }

  // 🎯 Métodos públicos para interactuar con el socket

  /**
   * 📡 Suscribirse a una estación específica
   */
  subscribeToStation(stationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:station', stationId);
    }
  }

  /**
   * 📡 Desuscribirse de una estación
   */
  unsubscribeFromStation(stationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:station', stationId);
    }
  }

  /**
   * 📊 Solicitar datos históricos
   */
  requestHistoricalData(stationId: string, timeRange: string) {
    if (this.socket?.connected) {
      this.socket.emit('request:historical', { stationId, timeRange });
    }
  }

  /**
   * 🔌 Desconectar manualmente
   */
  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isInitialized = false;
  }

  /**
   * 🔄 Reconectar manualmente
   */
  reconnect() {
    this.disconnect();
    this.initialize();
  }

  /**
   * 📊 Obtener estado de la conexión
   */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// 🌟 Instancia singleton del servicio
export const socketService = new SocketService();
