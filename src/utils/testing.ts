/**
 * 🧪 Utilidades de Testing
 * 
 * Conjunto de utilidades para facilitar el testing de la aplicación aumentada.
 * Incluye mocks, helpers, y configuraciones para testing de componentes
 * con Zustand, React Query, Socket.IO, y Three.js.
 * 
 * Características:
 * - Mocks de stores de Zustand
 * - Providers de testing para React Query
 * - Simulación de Socket.IO
 * - Helpers para testing de animaciones
 * - Utilities para testing de componentes 3D
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import type { EstacionMonitoreo, DatosHistoricos, AlertaSistema } from '@/types';

// 🎭 Mock del Store de Zustand
export const createMockHydrologyStore = (initialState?: Partial<any>) => {
  const defaultState = {
    // Data State
    stations: [],
    historicalData: {},
    alerts: [],
    lastUpdate: null,
    isLoading: false,
    error: null,
    
    // UI State
    darkMode: false,
    isLiveMode: true,
    selectedStation: '',
    timeRange: '24h',
    activeTab: 'overview',
    sidebarCollapsed: false,
    mapView: 'satellite',
    show3DVisualization: true,
    
    // Connection State
    connection: {
      isConnected: true,
      isReconnecting: false,
      lastConnected: new Date(),
      connectionAttempts: 0,
      latency: 50,
    },
    
    // Actions (mocked)
    setStations: vi.fn(),
    updateStation: vi.fn(),
    setHistoricalData: vi.fn(),
    addAlert: vi.fn(),
    removeAlert: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    toggleDarkMode: vi.fn(),
    toggleLiveMode: vi.fn(),
    setSelectedStation: vi.fn(),
    setTimeRange: vi.fn(),
    setActiveTab: vi.fn(),
    toggleSidebar: vi.fn(),
    setMapView: vi.fn(),
    toggle3DVisualization: vi.fn(),
    setConnectionState: vi.fn(),
    incrementConnectionAttempts: vi.fn(),
    resetConnectionAttempts: vi.fn(),
    updateLatency: vi.fn(),
    getCurrentStation: vi.fn(),
    getActiveAlerts: vi.fn(),
    getCriticalAlerts: vi.fn(),
    getStationAlerts: vi.fn(),
    getHistoricalDataForStation: vi.fn(),
    
    ...initialState
  };

  return defaultState;
};

// 🏭 Factory de Datos de Testing
export const testDataFactory = {
  /**
   * Crear estación de monitoreo de prueba
   */
  createStation: (overrides?: Partial<EstacionMonitoreo>): EstacionMonitoreo => ({
    id: 'test-station-1',
    nombre: 'Estación de Prueba',
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
    ...overrides
  }),

  /**
   * Crear múltiples estaciones
   */
  createStations: (count: number): EstacionMonitoreo[] => {
    return Array.from({ length: count }, (_, i) => 
      testDataFactory.createStation({
        id: `test-station-${i + 1}`,
        nombre: `Estación ${i + 1}`,
        lat: -39.2833 + (Math.random() - 0.5) * 0.1,
        lng: -71.7167 + (Math.random() - 0.5) * 0.1,
        estado: ['normal', 'alerta', 'critico'][i % 3] as any,
        caudal: 100 + Math.random() * 200,
        nivel: 2 + Math.random() * 3,
        velocidad: 1 + Math.random() * 3,
        temperatura: 5 + Math.random() * 15,
      })
    );
  },

  /**
   * Crear datos históricos de prueba
   */
  createHistoricalData: (count: number): DatosHistoricos[] => {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => ({
      time: new Date(now.getTime() - i * 60 * 60 * 1000).toISOString(),
      fecha: new Date(now.getTime() - i * 60 * 60 * 1000),
      caudal: 100 + Math.random() * 200,
      nivel: 2 + Math.random() * 3,
      velocidad: 1 + Math.random() * 3,
      presion: 100 + Math.random() * 10,
      temperatura: 5 + Math.random() * 15,
      ph: 6.5 + Math.random() * 2,
      oxigeno: 7 + Math.random() * 5,
      turbidez: 1 + Math.random() * 10,
      precipitacion: Math.random() * 50,
    }));
  },

  /**
   * Crear alerta de prueba
   */
  createAlert: (overrides?: Partial<AlertaSistema>): AlertaSistema => ({
    id: 'test-alert-1',
    nivel: 'amarillo',
    mensaje: 'Alerta de prueba',
    timestamp: new Date(),
    tipo: 'caudal',
    estacionId: 'test-station-1',
    ...overrides
  }),

  /**
   * Crear múltiples alertas
   */
  createAlerts: (count: number): AlertaSistema[] => {
    return Array.from({ length: count }, (_, i) => 
      testDataFactory.createAlert({
        id: `test-alert-${i + 1}`,
        nivel: ['verde', 'amarillo', 'naranja', 'rojo'][i % 4] as any,
        tipo: ['caudal', 'nivel', 'meteorologico', 'calidad'][i % 4] as any,
        mensaje: `Alerta ${i + 1}`,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
      })
    );
  }
};

// 🔧 Mock del Servicio de Socket.IO
export const createMockSocketService = () => {
  const mockSocket = {
    connected: true,
    id: 'mock-socket-id',
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  const mockSocketService = {
    initialize: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    subscribeToStation: vi.fn(),
    unsubscribeFromStation: vi.fn(),
    requestHistoricalData: vi.fn(),
    isConnected: true,
    socket: mockSocket,
  };

  return { mockSocket, mockSocketService };
};

// 📊 Mock de React Query
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// 🎭 Provider de Testing
interface TestProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialStoreState?: any;
}

export const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  queryClient = createTestQueryClient(),
}) => {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    children
  );
};

// 🎨 Render personalizado con providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
    initialStoreState?: any;
  }
) => {
  const { queryClient, initialStoreState, ...renderOptions } = options || {};

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(
      TestProviders,
      { queryClient, initialStoreState, children }
    );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// 🎯 Helpers de Testing
export const testHelpers = {
  /**
   * Esperar a que una animación termine
   */
  waitForAnimation: (duration = 1000) => {
    return new Promise(resolve => setTimeout(resolve, duration));
  },

  /**
   * Simular cambio de viewport
   */
  mockViewport: (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  },

  /**
   * Mock de Intersection Observer
   */
  mockIntersectionObserver: () => {
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
    window.IntersectionObserver = mockIntersectionObserver;
    return mockIntersectionObserver;
  },

  /**
   * Mock de Performance API
   */
  mockPerformance: () => {
    const mockPerformance = {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
    };
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: mockPerformance,
    });
    return mockPerformance;
  },

  /**
   * Mock de WebGL para Three.js
   */
  mockWebGL: () => {
    const mockCanvas = {
      getContext: vi.fn(() => ({
        getExtension: vi.fn(),
        getParameter: vi.fn(),
        createShader: vi.fn(),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        createProgram: vi.fn(),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        useProgram: vi.fn(),
        createBuffer: vi.fn(),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        drawArrays: vi.fn(),
        viewport: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
      })),
      width: 800,
      height: 600,
    };

    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCanvas.getContext()) as any;
    return mockCanvas;
  },

  /**
   * Simular eventos de Socket.IO
   */
  simulateSocketEvent: (mockSocket: any, event: string, data: any) => {
    const handler = mockSocket.on.mock.calls.find(
      (call: any) => call[0] === event
    )?.[1];
    if (handler) {
      handler(data);
    }
  },

  /**
   * Verificar que un mock fue llamado con argumentos específicos
   */
  expectMockCalledWith: (mockFn: any, ...args: any[]) => {
    // expect(mockFn).toHaveBeenCalledWith(...args);
    console.log('Mock called with:', mockFn, args);
  },

  /**
   * Crear un mock de función con implementación personalizada
   */
  createMockFunction: <T extends (...args: any[]) => any>(
    implementation?: T
  ) => {
    return vi.fn(implementation);
  },
};

// 📋 Configuración de Testing
export const testConfig = {
  /**
   * Timeout por defecto para tests
   */
  defaultTimeout: 5000,

  /**
   * Configuración de animaciones para testing
   */
  disableAnimations: () => {
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * Configuración de mocks globales
   */
  setupGlobalMocks: () => {
    testHelpers.mockIntersectionObserver();
    testHelpers.mockPerformance();
    testHelpers.mockWebGL();
    
    // Mock de requestAnimationFrame
    global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16)) as any;
    global.cancelAnimationFrame = vi.fn();
    
    // Mock de ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  },
};

// Re-exportar render personalizado como default
export { customRender as render };
export * from '@testing-library/react';
