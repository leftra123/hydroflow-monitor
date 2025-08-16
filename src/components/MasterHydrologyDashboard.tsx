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
  Monitor,
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
import { AdvancedAlertSystem } from './alerts/AdvancedAlertSystem';
import { ProfessionalDashboard } from './charts/ProfessionalDashboard';
import { STATIONS, THRESHOLD_CONFIGURATIONS, EMERGENCY_CONTACTS } from '@/data/stations';
import { StationDataPackage, AlertSeverity, DataQuality } from '@/types/sensors';
import { useTheme } from '@/hooks/useTheme';
import { WeatherSidebar } from './weather/WeatherSidebar';
import { useSmoothDataUpdates } from '@/hooks/useSmoothDataUpdates';
import { t, formatChileanTime } from '@/constants/translations';
import { AlarmControls } from './alarms/AlarmControls';
import { StationComparison } from './stations/StationComparison';
import { StationDetailCard } from './stations/StationDetailCard';
import { useAlarmSystem } from '@/hooks/useAlarmSystem';
import { 
  createStationId, 
  createTimestamp,
  TimeRange 
} from '@/types/hydrology';

// --- The following demonstrates potential real sensor data usage ---
// In production, this would connect to real DGA monitoring stations
const generateRealisticStationData = (): StationDataPackage[] => {
  return STATIONS.map(station => {
    const now = new Date();
    const baseWaterLevel = 1.35 + Math.sin(Date.now() / 300000) * 0.2;
    const baseFlowRate = 8.8 + Math.sin(Date.now() / 240000) * 1.8;
    const baseConductivity = 150 + Math.sin(Date.now() / 600000) * 50;

    return {
      stationId: station.id,
      timestamp: now.toISOString() as any,
      waterLevel: {
        level: {
          value: baseWaterLevel + (Math.random() - 0.5) * 0.1,
          timestamp: now.toISOString() as any,
          quality: DataQuality.EXCELLENT,
          uncertainty: 0.01
        },
        trend: baseWaterLevel > 1.4 ? 'rising' : baseWaterLevel < 1.3 ? 'falling' : 'stable',
        rateOfChange: (Math.random() - 0.5) * 0.2,
        floodStage: 2.5,
        alertLevel: baseWaterLevel > 2.5 ? AlertSeverity.EMERGENCY :
                   baseWaterLevel > 2.0 ? AlertSeverity.CRITICAL :
                   baseWaterLevel > 1.8 ? AlertSeverity.WARNING : AlertSeverity.NORMAL
      },
      flowRate: {
        discharge: {
          value: baseFlowRate + (Math.random() - 0.5) * 1.0,
          timestamp: now.toISOString() as any,
          quality: DataQuality.EXCELLENT,
          uncertainty: 0.05
        },
        velocity: {
          value: 0.8 + Math.sin(Date.now() / 180000) * 0.2,
          timestamp: now.toISOString() as any,
          quality: DataQuality.GOOD,
          uncertainty: 0.02
        },
        crossSectionalArea: 12.5,
        alertLevel: baseFlowRate > 25 ? AlertSeverity.CRITICAL :
                   baseFlowRate > 15 ? AlertSeverity.WARNING : AlertSeverity.NORMAL
      },
      waterQuality: {
        temperature: {
          value: 11.5 + Math.sin(Date.now() / 720000) * 2.5,
          timestamp: now.toISOString() as any,
          quality: DataQuality.EXCELLENT,
          uncertainty: 0.1
        },
        pH: {
          value: 7.2 + (Math.random() - 0.5) * 0.4,
          timestamp: now.toISOString() as any,
          quality: DataQuality.GOOD,
          uncertainty: 0.1
        },
        dissolvedOxygen: {
          value: 8.5 + (Math.random() - 0.5) * 1.0,
          timestamp: now.toISOString() as any,
          quality: DataQuality.EXCELLENT,
          uncertainty: 0.2
        },
        turbidity: {
          value: 2.1 + Math.random() * 1.5,
          timestamp: now.toISOString() as any,
          quality: DataQuality.GOOD,
          uncertainty: 0.1
        },
        conductivity: {
          value: baseConductivity + (Math.random() - 0.5) * 20,
          timestamp: now.toISOString() as any,
          quality: DataQuality.EXCELLENT,
          uncertainty: 1.0
        },
        totalDissolvedSolids: {
          value: 120 + (Math.random() - 0.5) * 30,
          timestamp: now.toISOString() as any,
          quality: DataQuality.GOOD,
          uncertainty: 5.0
        }
      },
      meteorological: {
        precipitation: {
          value: Math.max(0, Math.sin(Date.now() / 900000) * 5 + Math.random() * 2),
          timestamp: now.toISOString() as any,
          quality: DataQuality.EXCELLENT,
          uncertainty: 0.2
        },
        airTemperature: {
          value: 15 + Math.sin(Date.now() / 1440000) * 8,
          timestamp: now.toISOString() as any,
          quality: DataQuality.EXCELLENT,
          uncertainty: 0.5
        },
        humidity: {
          value: 65 + Math.sin(Date.now() / 360000) * 20,
          timestamp: now.toISOString() as any,
          quality: DataQuality.GOOD,
          uncertainty: 2.0
        },
        windSpeed: {
          value: 8 + Math.random() * 12,
          timestamp: now.toISOString() as any,
          quality: DataQuality.GOOD,
          uncertainty: 1.0
        },
        windDirection: {
          value: Math.random() * 360,
          timestamp: now.toISOString() as any,
          quality: DataQuality.FAIR,
          uncertainty: 10
        },
        barometricPressure: {
          value: 1013 + (Math.random() - 0.5) * 20,
          timestamp: now.toISOString() as any,
          quality: DataQuality.EXCELLENT,
          uncertainty: 0.5
        }
      },
      stationHealth: {
        battery: {
          voltage: {
            value: 12.6 + (Math.random() - 0.5) * 0.4,
            timestamp: now.toISOString() as any,
            quality: DataQuality.EXCELLENT,
            uncertainty: 0.01
          },
          current: {
            value: 2.1 + (Math.random() - 0.5) * 0.3,
            timestamp: now.toISOString() as any,
            quality: DataQuality.GOOD,
            uncertainty: 0.05
          },
          chargeLevel: {
            value: 85 + Math.random() * 10,
            timestamp: now.toISOString() as any,
            quality: DataQuality.EXCELLENT,
            uncertainty: 1.0
          },
          temperature: {
            value: 25 + (Math.random() - 0.5) * 5,
            timestamp: now.toISOString() as any,
            quality: DataQuality.GOOD,
            uncertainty: 0.5
          },
          cycleCount: 1250,
          estimatedLife: 8760
        },
        solar: {
          voltage: {
            value: 18.5 + (Math.random() - 0.5) * 1.0,
            timestamp: now.toISOString() as any,
            quality: DataQuality.EXCELLENT,
            uncertainty: 0.1
          },
          current: {
            value: 3.2 + (Math.random() - 0.5) * 0.8,
            timestamp: now.toISOString() as any,
            quality: DataQuality.GOOD,
            uncertainty: 0.1
          },
          power: {
            value: 55 + (Math.random() - 0.5) * 15,
            timestamp: now.toISOString() as any,
            quality: DataQuality.EXCELLENT,
            uncertainty: 2.0
          },
          efficiency: 0.85
        },
        communication: {
          signalStrength: {
            value: -65 + (Math.random() - 0.5) * 10,
            timestamp: now.toISOString() as any,
            quality: DataQuality.GOOD,
            uncertainty: 2.0
          },
          dataRate: {
            value: 1200 + Math.random() * 300,
            timestamp: now.toISOString() as any,
            quality: DataQuality.EXCELLENT,
            uncertainty: 50
          },
          packetLoss: {
            value: Math.random() * 2,
            timestamp: now.toISOString() as any,
            quality: DataQuality.GOOD,
            uncertainty: 0.1
          },
          latency: {
            value: 45 + Math.random() * 20,
            timestamp: now.toISOString() as any,
            quality: DataQuality.GOOD,
            uncertainty: 5
          }
        }
      },
      overallStatus: baseWaterLevel > 2.5 ? AlertSeverity.EMERGENCY :
                    baseWaterLevel > 2.0 ? AlertSeverity.CRITICAL :
                    baseWaterLevel > 1.8 ? AlertSeverity.WARNING : AlertSeverity.NORMAL
    };
  });
};

export const MasterHydrologyDashboard: React.FC = () => {
  const { state, actions, selectors } = useApplicationState();
  const { generateHistoricalData, calculateTimeSeriesStats } = useHydrologicalData();
  const { theme, toggleTheme } = useTheme();
  const [showWeatherSidebar, setShowWeatherSidebar] = React.useState(false);
  const [showAlertModal, setShowAlertModal] = React.useState(false);
  const [selectedStation, setSelectedStation] = React.useState(STATIONS[0].id);
  const [showStationComparison, setShowStationComparison] = React.useState(true);

  // Sistema de alarmas
  const { triggerAlarmBySeverity, isActive: alarmActive, playAlarm } = useAlarmSystem();

  // Detectar anomalías entre estaciones
  React.useEffect(() => {
    if (stationData.length >= 2) {
      const station1 = stationData[0];
      const station2 = stationData[1];

      // Calcular diferencias porcentuales
      const waterLevelDiff = Math.abs(
        (station2.waterLevel.level.value - station1.waterLevel.level.value) /
        station1.waterLevel.level.value * 100
      );

      const flowRateDiff = Math.abs(
        (station2.flowRate.discharge.value - station1.flowRate.discharge.value) /
        station1.flowRate.discharge.value * 100
      );

      // Activar alarmas por divergencias críticas
      if (waterLevelDiff > 30 || flowRateDiff > 30) {
        playAlarm('anomaly', `Divergencia crítica detectada entre estaciones: ${waterLevelDiff.toFixed(1)}% en nivel del agua`);
      }

      // Activar alarmas por valores críticos
      const maxWaterLevel = Math.max(station1.waterLevel.level.value, station2.waterLevel.level.value);
      const maxFlowRate = Math.max(station1.flowRate.discharge.value, station2.flowRate.discharge.value);
      const maxTemperature = Math.max(station1.waterQuality.temperature.value, station2.waterQuality.temperature.value);

      if (maxWaterLevel > 3.5 || maxFlowRate > 40) {
        playAlarm('emergency', 'Condiciones de emergencia detectadas en el río');
      } else if (maxWaterLevel > 3.0 || maxFlowRate > 30 || maxTemperature > 20) {
        playAlarm('critical', 'Nivel crítico alcanzado en parámetros del río');
      } else if (maxWaterLevel > 2.5 || maxFlowRate > 20) {
        playAlarm('warning', 'Condiciones de precaución en el río');
      }
    }
  }, [triggerAlarmBySeverity, playAlarm]);



  // 🎯 Smooth data updates without flickering
  const {
    data: stationData,
    isUpdating,
    lastUpdate,
    connectionStatus,
    refresh
  } = useSmoothDataUpdates(generateRealisticStationData, {
    updateInterval: 30000, // 30 seconds
    transitionDuration: 1000, // 1 second smooth transition
    enableSmoothing: true
  });

  // 🎯 Selección de estación activa
  const activeStation = useMemo(() => {
    return STATIONS.find(station => station.id === selectedStation) || STATIONS[0];
  }, [selectedStation]);

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

  // 🚨 Professional alert handlers
  const handleAlertAcknowledge = useCallback((alertId: string) => {
    console.log('Alert acknowledged:', alertId);
    // In production, this would update the alert status in the backend
  }, []);

  const handleEmergencyContact = useCallback((contactType: string) => {
    const contact = EMERGENCY_CONTACTS[contactType as keyof typeof EMERGENCY_CONTACTS];
    if (contact) {
      window.open(`tel:${contact.phone}`, '_self');
    }
  }, []);

  const handleExportData = useCallback(() => {
    // In production, this would export real data
    const exportData = {
      timestamp: new Date().toISOString(),
      stations: stationData,
      historicalData,
      thresholds: THRESHOLD_CONFIGURATIONS
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rio-claro-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [stationData, historicalData]);

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

  // 🎨 Animaciones de entrada mejoradas
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const slideInFromSide = (direction: 'left' | 'right') => ({
    initial: { opacity: 0, x: direction === 'left' ? -30 : 30 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 }
    }
  });

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
                onClick={() => {
                  console.log('🎨 Botón de tema clickeado, tema actual:', theme);
                  toggleTheme();
                }}
                className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-muted"
                title={`Cambiar tema - Actual: ${theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}`}
              >
                {theme === 'light' ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-blue-400" />
                ) : (
                  <Monitor className="h-4 w-4 text-gray-500" />
                )}
                <span className="text-xs font-medium">
                  {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}
                </span>
              </Button>

              {/* Controles de alarma compactos */}
              <div className="flex items-center gap-2 ml-2">
                <AlarmControls compact />

                {/* Indicador de estado de alarmas */}
                {alarmActive && (
                  <Badge variant="destructive" className="animate-pulse">
                    🚨 ALARMA ACTIVA
                  </Badge>
                )}
              </div>

              {/* Botón de comparación de estaciones */}
              <Button
                variant={showStationComparison ? "default" : "outline"}
                size="sm"
                onClick={() => setShowStationComparison(!showStationComparison)}
                className="flex items-center gap-2 px-3 py-2 transition-all duration-200"
                title="Activar/desactivar vista de comparación entre estaciones"
              >
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium hidden sm:inline">
                  {showStationComparison ? 'Ocultar Comparación' : 'Mostrar Comparación'}
                </span>
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
                Km {activeStation.location.riverKilometer}
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Dashboard</TabsTrigger>
              <TabsTrigger value="alerts">🚨 Alertas</TabsTrigger>
              <TabsTrigger value="analysis">Análisis</TabsTrigger>
              <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
              <TabsTrigger value="realtime">Tiempo Real</TabsTrigger>
            </TabsList>

            {/* Professional Dashboard */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div {...fadeInUp} className="space-y-6">
                {/* Comparación de estaciones - Siempre visible */}
                {stationData.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <StationComparison
                      stationNacimiento={stationData[0]}
                      stationPuente={stationData[1]}
                      className="mb-6"
                    />
                  </motion.div>
                )}

                {/* Vista Dual de Estaciones */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                >
                  {stationData.map((station, index) => (
                    <motion.div
                      key={station.stationId}
                      initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                      <StationDetailCard
                        station={station}
                        isUpdating={isUpdating}
                        lastUpdate={lastUpdate}
                        connectionStatus={connectionStatus}
                        timeRange={state.timeRange}
                        onTimeRangeChange={actions.setTimeRange}
                        onExportData={handleExportData}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Dashboard Profesional Completo */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <ProfessionalDashboard
                    stationData={stationData}
                    timeRange={state.timeRange}
                    onTimeRangeChange={actions.setTimeRange}
                    onStationSelect={setSelectedStation}
                    onExportData={handleExportData}
                    isUpdating={isUpdating}
                    lastUpdate={lastUpdate}
                    connectionStatus={connectionStatus}

                  />
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Advanced Alert System */}
            <TabsContent value="alerts" className="space-y-6">
              <motion.div {...fadeInUp}>
                <AdvancedAlertSystem
                  stationData={stationData}
                  onAlertAcknowledge={handleAlertAcknowledge}
                  onEmergencyContact={handleEmergencyContact}
                  onExportReport={handleExportData}
                />
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

      {/* Weather Sidebar */}
      <WeatherSidebar
        isOpen={showWeatherSidebar}
        onToggle={() => setShowWeatherSidebar(!showWeatherSidebar)}
      />


    </div>
  );
};
