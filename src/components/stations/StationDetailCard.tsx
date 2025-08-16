/**
 * 🏭 Tarjeta Detallada de Estación
 * 
 * Componente que muestra información completa de una estación individual
 * con métricas en tiempo real, gráficos y estado de conexión
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Waves, 
  Activity, 
  Thermometer, 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  WifiOff,
  Download,
  BarChart3,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { StationDataPackage } from '@/types/sensors';
import { formatChileanTime } from '@/constants/translations';
import { getContextualExplanation } from '@/constants/technicalExplanations';
import { MetricTooltip } from '@/components/ui/MetricTooltip';

interface StationDetailCardProps {
  station: StationDataPackage;
  isUpdating: boolean;
  lastUpdate: Date;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting' | 'connecting' | 'error';
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onExportData: (stationId: string) => void;
  className?: string;
}

export const StationDetailCard: React.FC<StationDetailCardProps> = ({
  station,
  isUpdating,
  lastUpdate,
  connectionStatus,
  timeRange,
  onTimeRangeChange,
  onExportData,
  className = ''
}) => {
  // Calcular estado general de la estación
  const stationStatus = useMemo(() => {
    const waterLevel = station.waterLevel.level.value;
    const flowRate = station.flowRate.discharge.value;
    const temperature = station.waterQuality.temperature.value;
    
    // Determinar nivel de riesgo basado en umbrales
    if (waterLevel > 3.5 || flowRate > 40 || temperature > 20) {
      return { level: 'emergency', label: 'EMERGENCIA', color: 'bg-red-600' };
    } else if (waterLevel > 3.0 || flowRate > 30 || temperature > 18) {
      return { level: 'critical', label: 'CRÍTICO', color: 'bg-red-500' };
    } else if (waterLevel > 2.5 || flowRate > 20 || temperature > 15) {
      return { level: 'warning', label: 'PRECAUCIÓN', color: 'bg-yellow-500' };
    } else {
      return { level: 'normal', label: 'NORMAL', color: 'bg-green-500' };
    }
  }, [station]);

  // Generar datos para mini-gráficos
  const generateMiniChartData = (parameter: string) => {
    // Simular datos históricos de las últimas 24 horas
    const now = new Date();
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      let value;
      
      switch (parameter) {
        case 'waterLevel':
          value = station.waterLevel.level.value + (Math.random() - 0.5) * 0.3;
          break;
        case 'discharge':
          value = station.flowRate.discharge.value + (Math.random() - 0.5) * 2;
          break;
        case 'temperature':
          value = station.waterQuality.temperature.value + (Math.random() - 0.5) * 1;
          break;
        default:
          value = 0;
      }
      
      data.push({
        time: time.getHours(),
        value: Math.max(0, value),
        timestamp: time
      });
    }
    return data;
  };

  const getTrendIcon = (current: number, previous: number) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.01) return <Minus className="w-3 h-3 text-gray-500" />;
    return diff > 0 ? 
      <TrendingUp className="w-3 h-3 text-red-500" /> : 
      <TrendingDown className="w-3 h-3 text-green-500" />;
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'reconnecting':
        return <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className={`station-detail-card ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Waves className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg">{station.stationId === 'EST-001' ? 'Estación Nacimiento' : 'Estación Puente'}</CardTitle>
            </div>
            <Badge className={`${stationStatus.color} text-white animate-pulse`}>
              {stationStatus.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span className="text-xs text-muted-foreground">
              {formatChileanTime(lastUpdate)}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          📍 {station.stationId === 'EST-001' ? 'Cabecera - Condiciones Prístinas' : 'Zona Turística - Monitoreo de Impacto'}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Métricas Principales */}
        <div className="grid grid-cols-2 gap-4">
          {/* Nivel del Agua */}
          <MetricTooltip
            parameter="waterLevel"
            value={station.waterLevel.level.value}
            trend="stable"
          >
            <Card className="metric-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Nivel del Agua</span>
                  </div>
                  {getTrendIcon(station.waterLevel.level.value, station.waterLevel.level.value - 0.1)}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {station.waterLevel.level.value.toFixed(2)} m
                  </div>
                  
                  {/* Mini gráfico */}
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateMiniChartData('waterLevel')}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={false}
                        />
                        <ReferenceLine y={3.0} stroke="#ef4444" strokeDasharray="2 2" />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload[0]) {
                              return (
                                <div className="bg-white p-2 border rounded shadow text-xs">
                                  {payload[0].value?.toFixed(2)} m
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Umbral crítico: 3.0m
                  </div>
                </div>
              </CardContent>
            </Card>
          </MetricTooltip>

          {/* Caudal */}
          <MetricTooltip
            parameter="flowRate"
            value={station.flowRate.discharge.value}
            trend="stable"
          >
            <Card className="metric-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Caudal</span>
                  </div>
                  {getTrendIcon(station.flowRate.discharge.value, station.flowRate.discharge.value - 1)}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {station.flowRate.discharge.value.toFixed(1)} m³/s
                  </div>
                  
                  {/* Mini gráfico */}
                  <div className="h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateMiniChartData('discharge')}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#7c3aed"
                          strokeWidth={2}
                          dot={false}
                        />
                        <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="2 2" />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload[0]) {
                              return (
                                <div className="bg-white p-2 border rounded shadow text-xs">
                                  {payload[0].value?.toFixed(1)} m³/s
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Umbral crítico: 30 m³/s
                  </div>
                </div>
              </CardContent>
            </Card>
          </MetricTooltip>

          {/* Temperatura */}
          <MetricTooltip
            parameter="temperature"
            value={station.waterQuality.temperature.value}
            trend="stable"
          >
            <Card className="metric-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Temperatura</span>
                  </div>
                  {getTrendIcon(station.waterQuality.temperature.value, station.waterQuality.temperature.value - 0.5)}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-orange-600">
                    {station.waterQuality.temperature.value.toFixed(1)}°C
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {station.waterQuality.temperature.value > 18 ? 
                      '⚠️ Temperatura elevada' : 
                      '✅ Temperatura normal'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </MetricTooltip>

          {/* Calidad del Agua */}
          <Card className="metric-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Calidad</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-lg font-bold text-green-600">
                  {station.waterQuality.pH.value > 6.5 && station.waterQuality.pH.value < 8.5 ? 'Excelente' : 'Regular'}
                </div>
                
                <div className="space-y-1 text-xs">
                  <div>pH: {station.waterQuality.pH.value.toFixed(1)}</div>
                  <div>OD: {station.waterQuality.dissolvedOxygen.value.toFixed(1)} mg/L</div>
                  <div>Conductividad: {station.waterQuality.conductivity.value.toFixed(0)} μS/cm</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas específicas de la estación */}
        {stationStatus.level !== 'normal' && (
          <Alert variant={stationStatus.level === 'emergency' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atención requerida:</strong> {
                stationStatus.level === 'emergency' ? 
                  'Condiciones de emergencia detectadas. Contactar autoridades inmediatamente.' :
                stationStatus.level === 'critical' ?
                  'Nivel crítico alcanzado. Monitorear de cerca y preparar protocolos.' :
                  'Condiciones de precaución. Aumentar frecuencia de monitoreo.'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Acciones rápidas */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Actualizado: {isUpdating ? 'Actualizando...' : formatChileanTime(lastUpdate)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportData(station.stationId)}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Exportar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Detalles
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
