/**
 * 🌊 Dashboard Hidrológico Maestro
 * 
 * La pieza central de arte funcional que orquesta todos los componentes
 * en una sinfonía de datos hidrológicos en tiempo real.
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Waves, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  RefreshCw,
  MapPin,
  Calendar,
  Activity,
  Zap
} from 'lucide-react';

import { MultiScaleAnalysisChart } from './charts/MultiScaleAnalysisChart';
import { CorrelationAnalysisChart } from './charts/CorrelationAnalysisChart';
import { RealTimeGaugeChart } from './charts/RealTimeGaugeChart';
import { DimensionalAnalysisChart } from './charts/DimensionalAnalysisChart';
import { HydraulicMetricsPanel } from './metrics/HydraulicMetricsPanel';
import { AlertsPanel } from './alerts/AlertsPanel';

import { 
  useApplicationState, 
  useHydrologicalData, 
  useThemeConfiguration 
} from '@/core/state';
import { 
  computeHydraulicCalculations,
  generateRealisticHydrologicalPattern 
} from '@/core/hydraulics';
import { 
  createStationId, 
  createTimestamp,
  TimeRange 
} from '@/types/hydrology';

// 🏭 Configuración de Estaciones
const STATIONS = [
  {
    id: createStationId('station-pucon-centro'),
    name: 'Río Claro - Pucón Centro',
    location: { lat: -39.2833, lng: -71.7167, elevation: 230, riverKm: 0 },
    description: 'Estación principal en el centro urbano'
  },
  {
    id: createStationId('station-holzapfel'),
    name: 'Río Claro - Puente Holzapfel', 
    location: { lat: -39.2900, lng: -71.7200, elevation: 245, riverKm: 2.5 },
    description: 'Estación aguas arriba del puente'
  }
] as const;

export const MasterHydrologyDashboard: React.FC = () => {
  const { state, actions, selectors } = useApplicationState();
  const { generateHistoricalData, calculateTimeSeriesStats } = useHydrologicalData();
  const theme = useThemeConfiguration();

  // 🎯 Selección de estación activa
  const activeStation = useMemo(() => {
    return STATIONS.find(station => station.id === state.selectedStation) || STATIONS[0];
  }, [state.selectedStation]);

  // 📊 Generación de datos históricos
  const historicalData = useMemo(() => {
    return generateHistoricalData(state.timeRange, activeStation.id);
  }, [generateHistoricalData, state.timeRange, activeStation.id]);

  // 📈 Datos actuales (último punto de la serie)
  const currentData = useMemo(() => {
    if (historicalData.length === 0) return null;
    return historicalData[historicalData.length - 1];
  }, [historicalData]);

  // 🧮 Cálculos hidráulicos en tiempo real
  const hydraulicCalculations = useMemo(() => {
    if (!currentData) return null;
    
    return computeHydraulicCalculations(
      currentData.flowRate,
      currentData.velocity,
      currentData.waterLevel,
      currentData.temperature
    );
  }, [currentData]);

  // 📊 Estadísticas de la serie temporal
  const timeSeriesStats = useMemo(() => {
    return calculateTimeSeriesStats(historicalData);
  }, [calculateTimeSeriesStats, historicalData]);

  // 🔄 Auto-actualización en modo tiempo real
  useEffect(() => {
    if (!state.isRealTimeMode) return;

    const interval = setInterval(() => {
      actions.updateTimestamp();
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, [state.isRealTimeMode, actions]);

  // 🎨 Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    if (selectors.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [selectors.isDarkMode]);

  // 🎨 Animaciones de entrada simplificadas
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (!currentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Cargando datos hidrológicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${selectors.themeClasses}`}>
      {/* 🎭 Header Maestro */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
              >
                <Waves className="h-6 w-6 text-white" />
              </motion.div>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  HydroFlow Monitor
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de Monitoreo Hidrológico Avanzado
                </p>
              </div>
            </div>

            {/* Controles principales */}
            <div className="flex items-center space-x-4">
              {/* Selector de estación */}
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <select
                  value={activeStation.id}
                  onChange={(e) => actions.selectStation(createStationId(e.target.value))}
                  className="bg-background border rounded-lg px-3 py-1 text-sm"
                >
                  {STATIONS.map(station => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de rango temporal */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <select
                  value={state.timeRange}
                  onChange={(e) => actions.setTimeRange(e.target.value as any)}
                  className="bg-background border rounded-lg px-3 py-1 text-sm"
                >
                  <option value="1h">1 Hora</option>
                  <option value="24h">24 Horas</option>
                  <option value="7d">7 Días</option>
                  <option value="30d">30 Días</option>
                  <option value="1y">1 Año</option>
                </select>
              </div>

              {/* Control de tiempo real */}
              <Button
                variant={state.isRealTimeMode ? "default" : "outline"}
                size="sm"
                onClick={actions.toggleRealTime}
                className="flex items-center space-x-2"
              >
                {state.isRealTimeMode ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{state.isRealTimeMode ? 'Pausar' : 'Tiempo Real'}</span>
              </Button>

              {/* Toggle de tema */}
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.toggleTheme}
                className="p-2"
              >
                {selectors.isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Información de la estación activa */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>{activeStation.name}</span>
              </Badge>
              <Badge variant="secondary">
                Elevación: {activeStation.location.elevation}m
              </Badge>
              <Badge variant="secondary">
                Km {activeStation.location.riverKm}
              </Badge>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Última actualización:</span>
              <span className="font-mono">
                {new Date(state.lastUpdate).toLocaleTimeString('es-CL')}
              </span>
              {state.isRealTimeMode && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* 📊 Contenido Principal */}
      <main className="container mx-auto px-6 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="analysis">Análisis</TabsTrigger>
              <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
              <TabsTrigger value="realtime">Tiempo Real</TabsTrigger>
            </TabsList>

            {/* Vista General */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div {...fadeInUp} className="space-y-6">
                <MultiScaleAnalysisChart
                  data={historicalData}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RealTimeGaugeChart data={currentData} />
                  <DimensionalAnalysisChart
                    currentData={currentData}
                    historicalAverage={timeSeriesStats}
                  />
                </div>

                {hydraulicCalculations && (
                  <HydraulicMetricsPanel
                    calculations={hydraulicCalculations}
                    currentData={currentData}
                  />
                )}
              </motion.div>
            </TabsContent>

            {/* Análisis Avanzado */}
            <TabsContent value="analysis" className="space-y-6">
              <motion.div {...fadeInUp}>
                <CorrelationAnalysisChart data={historicalData} />
              </motion.div>
            </TabsContent>

            {/* Correlaciones */}
            <TabsContent value="correlations" className="space-y-6">
              <motion.div {...fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MultiScaleAnalysisChart data={historicalData} />
                <CorrelationAnalysisChart data={historicalData} />
              </motion.div>
            </TabsContent>

            {/* Tiempo Real */}
            <TabsContent value="realtime" className="space-y-6">
              <motion.div {...fadeInUp} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <RealTimeGaugeChart data={currentData} />
                  </div>
                  <AlertsPanel
                    currentData={currentData}
                    hydraulicCalculations={hydraulicCalculations}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DimensionalAnalysisChart
                    currentData={currentData}
                    historicalAverage={timeSeriesStats}
                  />
                  {hydraulicCalculations && (
                    <HydraulicMetricsPanel
                      calculations={hydraulicCalculations}
                      currentData={currentData}
                    />
                  )}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
      </main>
    </div>
  );
};
