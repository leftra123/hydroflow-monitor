/**
 * 📊 Professional Hydrological Dashboard
 * 
 * Advanced real-time monitoring dashboard with early warning capabilities
 * Following WMO, DGA Chile, and NCh 1333 standards
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Waves, 
  CloudRain, 
  Thermometer,
  Activity,
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  Zap,
  MapPin
} from 'lucide-react';
import { HistoricalDataPoint, AlertSeverity, StationDataPackage } from '@/types/sensors';
import { 
  WATER_LEVEL_COLORS, 
  PRECIPITATION_COLORS, 
  FLOW_RATE_COLORS, 
  TEMPERATURE_COLORS,
  getAlertColor,
  getConductivityColor,
  getPrecipitationColor
} from '@/constants/professionalColors';

interface ProfessionalDashboardProps {
  stationData: StationDataPackage[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onStationSelect: (stationId: any) => void;
  onExportData: () => void;
}

// --- The following demonstrates potential real sensor data usage ---
// In production, this would receive real-time data from sensor networks
const generateRealtimeData = (timeRange: string): HistoricalDataPoint[] => {
  const now = new Date();
  const points = timeRange === '1h' ? 12 : timeRange === '24h' ? 48 : timeRange === '7d' ? 168 : 720;
  const interval = timeRange === '1h' ? 5 : timeRange === '24h' ? 30 : timeRange === '7d' ? 60 : 360;
  
  return Array.from({ length: points }, (_, i) => {
    const timestamp = new Date(now.getTime() - (points - i - 1) * interval * 60000);
    const hour = timestamp.getHours();
    const dayOfYear = Math.floor((timestamp.getTime() - new Date(timestamp.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Realistic Río Claro patterns with seasonal and diurnal variations
    const seasonalFactor = 1 + 0.4 * Math.sin((dayOfYear / 365) * 2 * Math.PI);
    const diurnalFactor = 1 + 0.15 * Math.sin((hour / 24) * 2 * Math.PI);
    const stormProbability = Math.random() < 0.08 ? 2 + Math.random() * 3 : 1;
    
    // Base values for Río Claro
    const baseWaterLevel = 1.35 + Math.sin(i * 0.12) * 0.25 * seasonalFactor;
    const baseFlowRate = 8.8 + Math.sin(i * 0.18) * 2.2 * seasonalFactor * stormProbability;
    const basePrecipitation = Math.max(0, Math.sin(i * 0.25) * 4 * stormProbability + Math.random() * 1.5);
    const baseTemperature = 11.5 + 4 * Math.sin((dayOfYear / 365) * 2 * Math.PI) + 3 * Math.sin((hour / 24) * 2 * Math.PI);
    
    return {
      timestamp: timestamp.toISOString() as any,
      waterLevel: Number((baseWaterLevel * diurnalFactor + (Math.random() - 0.5) * 0.05).toFixed(3)),
      flowRate: Number((baseFlowRate * diurnalFactor + (Math.random() - 0.5) * 0.8).toFixed(2)),
      temperature: Number((baseTemperature + (Math.random() - 0.5) * 1.2).toFixed(1)),
      precipitation: Number(basePrecipitation.toFixed(1)),
      quality: Math.random() > 0.85 ? 'fair' as any : 'excellent' as any
    };
  });
};

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({
  stationData,
  timeRange,
  onTimeRangeChange,
  onStationSelect,
  onExportData
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Generate realistic data
  const chartData = useMemo(() => generateRealtimeData(timeRange), [timeRange]);

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Format data for display
  const formattedData = useMemo(() => {
    return chartData.map(point => ({
      ...point,
      timeLabel: timeRange === '1h' 
        ? new Date(point.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
        : timeRange === '24h'
        ? new Date(point.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
        : timeRange === '7d'
        ? new Date(point.timestamp).toLocaleDateString('es-CL', { weekday: 'short', hour: '2-digit' })
        : new Date(point.timestamp).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }),
      alertLevel: point.waterLevel > 2.5 ? 'emergency' : point.waterLevel > 2.0 ? 'critical' : point.waterLevel > 1.8 ? 'warning' : 'normal'
    }));
  }, [chartData, timeRange]);

  // Current status analysis
  const currentStatus = useMemo(() => {
    if (formattedData.length === 0) return null;
    
    const latest = formattedData[formattedData.length - 1];
    const previous = formattedData[formattedData.length - 2];
    
    return {
      waterLevel: {
        current: latest.waterLevel,
        trend: previous ? (latest.waterLevel > previous.waterLevel ? 'rising' : latest.waterLevel < previous.waterLevel ? 'falling' : 'stable') : 'stable',
        change: previous ? ((latest.waterLevel - previous.waterLevel) * 100).toFixed(1) : '0',
        alertLevel: latest.alertLevel
      },
      flowRate: {
        current: latest.flowRate,
        trend: previous ? (latest.flowRate > previous.flowRate ? 'increasing' : latest.flowRate < previous.flowRate ? 'decreasing' : 'stable') : 'stable',
        change: previous ? ((latest.flowRate - previous.flowRate) * 100).toFixed(1) : '0'
      },
      precipitation: {
        current: latest.precipitation,
        intensity: latest.precipitation > 20 ? 'extreme' : latest.precipitation > 10 ? 'heavy' : latest.precipitation > 2 ? 'moderate' : 'light'
      },
      temperature: {
        current: latest.temperature,
        classification: latest.temperature > 20 ? 'warm' : latest.temperature > 15 ? 'normal' : latest.temperature > 10 ? 'cool' : 'cold'
      }
    };
  }, [formattedData]);

  const ProfessionalTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background border rounded-lg shadow-lg p-4 min-w-[250px]">
        <p className="font-medium mb-3 text-sm border-b pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.name}</span>
            </div>
            <span className="text-lg font-bold" style={{ color: entry.color }}>
              {entry.value} {entry.name === 'Nivel de Agua' ? 'm' : 
                           entry.name === 'Caudal' ? 'm³/s' : 
                           entry.name === 'Precipitación' ? 'mm/h' : '°C'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Waves className="w-6 h-6 text-blue-600" />
            Dashboard Profesional - Río Claro
          </h2>
          <Badge variant={currentStatus?.waterLevel.alertLevel === 'normal' ? 'default' : 'destructive'}>
            {currentStatus?.waterLevel.alertLevel?.toUpperCase() || 'NORMAL'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto
          </Button>
          
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="1h">1 Hora</option>
            <option value="24h">24 Horas</option>
            <option value="7d">7 Días</option>
            <option value="30d">30 Días</option>
          </select>
          
          <Button variant="outline" size="sm" onClick={onExportData}>
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Current Status Cards */}
      {currentStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`border-l-4 ${currentStatus.waterLevel.alertLevel === 'normal' ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nivel de Agua</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentStatus.waterLevel.current.toFixed(3)}m
                  </p>
                  <p className="text-xs flex items-center gap-1">
                    {currentStatus.waterLevel.trend === 'rising' ? 
                      <TrendingUp className="w-3 h-3 text-red-500" /> : 
                      currentStatus.waterLevel.trend === 'falling' ?
                      <TrendingDown className="w-3 h-3 text-green-500" /> :
                      <Activity className="w-3 h-3 text-gray-500" />
                    }
                    {currentStatus.waterLevel.trend}
                  </p>
                </div>
                <Waves className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Caudal</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentStatus.flowRate.current.toFixed(1)} m³/s
                  </p>
                  <p className="text-xs flex items-center gap-1">
                    {currentStatus.flowRate.trend === 'increasing' ? 
                      <TrendingUp className="w-3 h-3 text-red-500" /> : 
                      currentStatus.flowRate.trend === 'decreasing' ?
                      <TrendingDown className="w-3 h-3 text-green-500" /> :
                      <Activity className="w-3 h-3 text-gray-500" />
                    }
                    {currentStatus.flowRate.trend}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Precipitación</p>
                  <p className="text-2xl font-bold text-green-600">
                    {currentStatus.precipitation.current.toFixed(1)} mm/h
                  </p>
                  <p className="text-xs">
                    Intensidad: {currentStatus.precipitation.intensity}
                  </p>
                </div>
                <CloudRain className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Temperatura</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {currentStatus.temperature.current.toFixed(1)}°C
                  </p>
                  <p className="text-xs">
                    Estado: {currentStatus.temperature.classification}
                  </p>
                </div>
                <Thermometer className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monitoreo en Tiempo Real</span>
            <div className="text-sm text-muted-foreground">
              Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="waterLevelGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={WATER_LEVEL_COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={WATER_LEVEL_COLORS.primary} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="precipitationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRECIPITATION_COLORS.primary} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={PRECIPITATION_COLORS.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="timeLabel" 
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Nivel (m)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Otros Parámetros', angle: 90, position: 'insideRight' }}
                />
                <Tooltip content={<ProfessionalTooltip />} />
                <Legend />
                
                {/* Water Level - Primary parameter */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="waterLevel"
                  stroke={WATER_LEVEL_COLORS.primary}
                  fill="url(#waterLevelGradient)"
                  strokeWidth={3}
                  name="Nivel de Agua"
                />
                
                {/* Flow Rate */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="flowRate"
                  stroke={FLOW_RATE_COLORS.primary}
                  strokeWidth={2}
                  name="Caudal"
                  dot={{ r: 1 }}
                />
                
                {/* Precipitation as bars */}
                <Bar
                  yAxisId="right"
                  dataKey="precipitation"
                  fill={PRECIPITATION_COLORS.primary}
                  fillOpacity={0.6}
                  name="Precipitación"
                />
                
                {/* Temperature */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temperature"
                  stroke={TEMPERATURE_COLORS.normal}
                  strokeWidth={2}
                  name="Temperatura"
                  dot={{ r: 1 }}
                />
                
                {/* Critical thresholds */}
                <ReferenceLine
                  yAxisId="left"
                  y={2.0}
                  stroke="#f59e0b"
                  strokeDasharray="8 4"
                  label={{ value: "Advertencia", position: "top" }}
                />
                <ReferenceLine
                  yAxisId="left"
                  y={2.5}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: "Crítico", position: "top" }}
                />
                <ReferenceLine
                  yAxisId="left"
                  y={3.0}
                  stroke="#dc2626"
                  strokeDasharray="2 2"
                  strokeWidth={2}
                  label={{ value: "EMERGENCIA", position: "top" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
