/**
 * 🔄 Provider de React Query
 * 
 * Configuración centralizada del cliente de React Query con:
 * - Configuración optimizada para aplicaciones en tiempo real
 * - Error handling global
 * - DevTools en desarrollo
 * - Integración con el sistema de notificaciones
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 🎯 Configuración del Query Client
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 🔄 Configuración de refetch
        staleTime: 1 * 60 * 1000, // 1 minuto por defecto
        gcTime: 5 * 60 * 1000, // 5 minutos (antes cacheTime)
        
        // 🌐 Configuración de red
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // 🔁 Configuración de retry
        retry: (failureCount, error: any) => {
          // No retry para errores 4xx (client errors)
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          // Retry hasta 3 veces para otros errores
          return failureCount < 3;
        },
        
        // ⏱️ Delay entre retries (backoff exponencial)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // 🚫 Configuración de error handling
        throwOnError: false, // Manejar errores a través del estado de la query
      },
      mutations: {
        // 🔁 Retry para mutations críticas
        retry: (failureCount, error: any) => {
          // Solo retry para errores de red o 5xx
          if (error?.response?.status >= 500 || !error?.response) {
            return failureCount < 2;
          }
          return false;
        },
        
        // ⏱️ Delay para mutations
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      },
    },
    
    // 🎯 Query Cache configuration
    queryCache: undefined, // Usar configuración por defecto
    
    // 🔄 Mutation Cache configuration  
    mutationCache: undefined, // Usar configuración por defecto
  });
};

// 🌟 Instancia singleton del cliente
let queryClient: QueryClient | undefined;

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

// 🎭 Props del Provider
interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * 🏗️ Provider principal de React Query
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* 🛠️ DevTools solo en desarrollo */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
};

/**
 * 🎯 Hook para acceder al Query Client
 */
export const useQueryClientInstance = () => {
  return getQueryClient();
};

/**
 * 🔧 Utilidades para manejo global de queries
 */
export const queryUtils = {
  /**
   * Limpiar todo el cache
   */
  clearAllCache: () => {
    const client = getQueryClient();
    client.clear();
  },

  /**
   * Invalidar todas las queries
   */
  invalidateAll: () => {
    const client = getQueryClient();
    client.invalidateQueries();
  },

  /**
   * Obtener datos del cache sin trigger de fetch
   */
  getCachedData(queryKey: readonly unknown[]) {
    const client = getQueryClient();
    return client.getQueryData(queryKey);
  },

  /**
   * Establecer datos en el cache manualmente
   */
  setCachedData(queryKey: readonly unknown[], data: any) {
    const client = getQueryClient();
    client.setQueryData(queryKey, data);
  },

  /**
   * Prefetch de datos
   */
  async prefetchQuery(
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    options?: { staleTime?: number }
  ) {
    const client = getQueryClient();
    return client.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime || 1 * 60 * 1000, // 1 minuto por defecto
    });
  },

  /**
   * Obtener estado de una query específica
   */
  getQueryState: (queryKey: readonly unknown[]) => {
    const client = getQueryClient();
    return client.getQueryState(queryKey);
  },

  /**
   * Cancelar queries en progreso
   */
  cancelQueries: async (queryKey?: readonly unknown[]) => {
    const client = getQueryClient();
    return client.cancelQueries({ queryKey });
  },
};

// 🎯 Configuración específica para diferentes tipos de datos
export const queryConfigs = {
  /**
   * Configuración para datos en tiempo real (alta frecuencia)
   */
  realtime: {
    staleTime: 10 * 1000, // 10 segundos
    gcTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 5000, // 5 segundos
    refetchIntervalInBackground: true,
  },

  /**
   * Configuración para datos estáticos (baja frecuencia)
   */
  static: {
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchInterval: false,
  },

  /**
   * Configuración para datos históricos
   */
  historical: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    refetchInterval: false,
  },

  /**
   * Configuración para alertas críticas
   */
  alerts: {
    staleTime: 5 * 1000, // 5 segundos
    gcTime: 30 * 1000, // 30 segundos
    refetchInterval: 10000, // 10 segundos
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  },
};

export default QueryProvider;
