/**
 * ⚡ Utilidades de Optimización de Performance
 * 
 * Conjunto de utilidades y hooks para optimizar el rendimiento de la aplicación.
 * Incluye memoización inteligente, lazy loading, debouncing, y monitoreo de performance.
 * 
 * Características:
 * - Memoización selectiva con dependencias personalizadas
 * - Lazy loading de componentes pesados
 * - Debouncing y throttling para eventos frecuentes
 * - Monitoreo de métricas de performance
 * - Optimización de re-renders
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { debounce, throttle } from 'lodash-es';

// 🎯 Hook de Memoización Profunda
export const useDeepMemo = <T>(factory: () => T, deps: React.DependencyList): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T } | undefined>(undefined);
  
  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    ref.current = {
      deps: [...deps],
      value: factory()
    };
  }
  
  return ref.current.value;
};

// 🔄 Comparación profunda de dependencias
const areEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      // Para objetos, hacer comparación superficial
      if (typeof a[i] === 'object' && typeof b[i] === 'object') {
        if (!shallowEqual(a[i], b[i])) return false;
      } else {
        return false;
      }
    }
  }
  
  return true;
};

// 🔍 Comparación superficial de objetos
const shallowEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
};

// 🚀 Hook de Debouncing
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay, ...deps]
  );

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback as unknown as T;
};

// 🎛️ Hook de Throttling
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay, ...deps]
  );

  useEffect(() => {
    return () => {
      throttledCallback.cancel();
    };
  }, [throttledCallback]);

  return throttledCallback as unknown as T;
};

// 📊 Hook de Monitoreo de Performance
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef<number | undefined>(undefined);
  
  useEffect(() => {
    renderCount.current += 1;
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        
        // Solo log en desarrollo y si el render toma más de 16ms (60fps)
        if (import.meta.env.DEV && renderTime > 16) {
          console.warn(
            `🐌 Render lento detectado en ${componentName}: ${renderTime.toFixed(2)}ms (Render #${renderCount.current})`
          );
        }
      }
    };
  });

  return {
    renderCount: renderCount.current,
    logPerformance: (operation: string, time: number) => {
      if (import.meta.env.DEV) {
        console.log(`⚡ ${componentName} - ${operation}: ${time.toFixed(2)}ms`);
      }
    }
  };
};

// 🎭 Hook de Lazy Loading con Suspense
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    importFunc()
      .then((module) => {
        if (mounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { Component, loading, error, Fallback: fallback };
};

// 🔄 Hook de Intersection Observer para Lazy Loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
};

// 📱 Hook de Detección de Viewport
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  });

  useEffect(() => {
    const handleResize = throttle(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, []);

  return viewport;
};

// 🎯 Hook de Memoización de Callbacks Complejos
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  const callbackRef = useRef<T>(callback);
  const depsRef = useRef<React.DependencyList>(deps);

  // Actualizar callback solo si las dependencias cambian
  if (!areEqual(depsRef.current, deps)) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
};

// 📈 Utilidades de Medición de Performance
export const performanceUtils = {
  /**
   * Medir tiempo de ejecución de una función
   */
  measureTime: async <T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    if (import.meta.env.DEV) {
      console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  },

  /**
   * Crear un mark de performance
   */
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  /**
   * Medir entre dos marks
   */
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        
        if (import.meta.env.DEV) {
          const measure = performance.getEntriesByName(name, 'measure')[0];
          if (measure) {
            console.log(`📊 ${name}: ${measure.duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        console.warn('Error measuring performance:', error);
      }
    }
  },

  /**
   * Obtener métricas de Web Vitals
   */
  getWebVitals: () => {
    if (typeof window === 'undefined') return null;

    return {
      // First Contentful Paint
      getFCP: () => {
        const entries = performance.getEntriesByType('paint');
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : null;
      },

      // Largest Contentful Paint
      getLCP: () => {
        return new Promise((resolve) => {
          if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry.startTime);
              observer.disconnect();
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
          } else {
            resolve(null);
          }
        });
      },

      // Cumulative Layout Shift
      getCLS: () => {
        return new Promise((resolve) => {
          if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                  clsValue += (entry as any).value;
                }
              }
            });
            observer.observe({ entryTypes: ['layout-shift'] });
            
            // Resolver después de 5 segundos
            setTimeout(() => {
              resolve(clsValue);
              observer.disconnect();
            }, 5000);
          } else {
            resolve(null);
          }
        });
      }
    };
  }
};

// 🎨 Función para crear HOC de Lazy Loading
export const createLazyLoadingHOC = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { targetRef, hasIntersected } = useIntersectionObserver();

    return React.createElement(
      'div',
      { ref: targetRef },
      hasIntersected
        ? React.createElement(Component, { ...props as any, ref })
        : fallback
          ? React.createElement(fallback)
          : React.createElement('div', {
              className: 'h-64 bg-gray-100 animate-pulse rounded'
            })
    );
  });
};
