import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Activity, AlertTriangle, Droplets, Thermometer,
  TrendingUp, TrendingDown, Waves, Bell,
  Gauge, Zap, Mountain, CloudRain,
  AlertCircle, CheckCircle, XCircle, Info
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar,
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
         RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Tipos de datos
interface EstacionMonitoreo {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  estado: 'normal' | 'alerta' | 'critico';
  caudal: number;
  nivel: number;
  velocidad: number;
  presion: number;
  temperatura: number;
  ph: number;
  oxigeno: number;
  turbidez: number;
}

// interface AlertasSistema {
//   nivel: 'verde' | 'amarillo' | 'naranja' | 'rojo';
//   mensaje: string;
//   timestamp: Date;
//   tipo: 'caudal' | 'nivel' | 'meteorologico' | 'calidad';
// }

// Datos simulados
const generateHistoricalData = (hours: number) => {
  const data = [];
  const now = new Date();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      fecha: time,
      caudal: 150 + Math.random() * 50 + (i < 12 ? 20 : 0),
      nivel: 2.5 + Math.random() * 0.5 + (i < 12 ? 0.3 : 0),
      velocidad: 1.8 + Math.random() * 0.4,
      presion: 101 + Math.random() * 5,
      temperatura: 8 + Math.random() * 2,
      ph: 7.2 + Math.random() * 0.3,
      oxigeno: 8.5 + Math.random() * 1,
      turbidez: 5 + Math.random() * 3,
      precipitacion: i < 12 ? Math.random() * 10 : 0
    });
  }
  return data;
};

const HydroFlowDashboard: React.FC = () => {
  const [selectedStation] = useState<string>('station1');
  const [timeRange] = useState<'24h' | '7d' | '30d' | '1y'>('24h');
  // const [alertLevel] = useState<'verde' | 'amarillo' | 'naranja' | 'rojo'>('verde');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [darkMode] = useState(true);

  // Datos de las estaciones
  const stations: EstacionMonitoreo[] = [
    {
      id: 'station1',
      nombre: 'Laguna Quillelhue',
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
      turbidez: 4.8
    },
    {
      id: 'station2',
      nombre: 'Confluencia Villarrica',
      lat: -39.2667,
      lng: -71.9333,
      estado: 'alerta',
      caudal: 198.7,
      nivel: 3.15,
      velocidad: 2.4,
      presion: 105.2,
      temperatura: 9.1,
      ph: 7.1,
      oxigeno: 8.8,
      turbidez: 6.2
    }
  ];

  const currentStation = stations.find(s => s.id === selectedStation) || stations[0];
  
  // Datos históricos
  const historicalData = useMemo(() => {
    switch(timeRange) {
      case '24h': return generateHistoricalData(24);
      case '7d': return generateHistoricalData(168);
      case '30d': return generateHistoricalData(720);
      case '1y': return generateHistoricalData(8760);
      default: return generateHistoricalData(24);
    }
  }, [timeRange]);

  // Cálculos hidráulicos (Bernoulli)
  const bernoulliCalculations = {
    energiaTotal: (currentStation.presion / (1000 * 9.81)) + 
                  (Math.pow(currentStation.velocidad, 2) / (2 * 9.81)) + 
                  currentStation.nivel,
    numeroFroude: currentStation.velocidad / Math.sqrt(9.81 * currentStation.nivel),
    numeroReynolds: (currentStation.velocidad * currentStation.nivel * 1000) / 0.001,
    regimen: currentStation.velocidad / Math.sqrt(9.81 * currentStation.nivel) > 1 ? 'Supercrítico' : 'Subcrítico'
  };

  // Datos para el gráfico de radar
  const radarData = [
    { parametro: 'Caudal', valor: (currentStation.caudal / 250) * 100, max: 100 },
    { parametro: 'Nivel', valor: (currentStation.nivel / 5) * 100, max: 100 },
    { parametro: 'Velocidad', valor: (currentStation.velocidad / 4) * 100, max: 100 },
    { parametro: 'Calidad', valor: (currentStation.ph / 14) * 100, max: 100 },
    { parametro: 'Oxígeno', valor: (currentStation.oxigeno / 12) * 100, max: 100 },
    { parametro: 'Claridad', valor: ((10 - currentStation.turbidez) / 10) * 100, max: 100 }
  ];

  // Sistema de alertas
  const getAlertStatus = (value: number, thresholds: number[]) => {
    if (value < thresholds[0]) return 'verde';
    if (value < thresholds[1]) return 'amarillo';
    if (value < thresholds[2]) return 'naranja';
    return 'rojo';
  };

  const currentAlertLevel = getAlertStatus(currentStation.nivel, [3, 3.5, 4]);

  const alertColors = {
    verde: 'bg-green-500',
    amarillo: 'bg-yellow-500',
    naranja: 'bg-orange-500',
    rojo: 'bg-red-500'
  };

  const alertIcons = {
    verde: <CheckCircle className="h-5 w-5" />,
    amarillo: <AlertCircle className="h-5 w-5" />,
    naranja: <AlertTriangle className="h-5 w-5" />,
    rojo: <XCircle className="h-5 w-5" />
  };

  // Actualización en tiempo real simulada
  useEffect(() => {
    if (!isLiveMode) return;
    
    const interval = setInterval(() => {
      // Aquí se actualizarían los datos en tiempo real
      console.log('Actualizando datos...');
    }, 5000);

    return () => clearInterval(interval);
  }, [isLiveMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-700 p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Waves className="h-10 w-10 text-cyan-300 animate-pulse" />
              <div>
                <h1 className="text-3xl font-bold text-white">HydroFlow Monitor</h1>
                <p className="text-cyan-100 text-sm mt-1">
                  Sistema de Monitoreo Hidrológico - Río Claro de Pucón
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isLiveMode ? "default" : "secondary"} className="animate-pulse">
                {isLiveMode ? '🔴 EN VIVO' : '⏸ PAUSADO'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsLiveMode(!isLiveMode)}
                className="text-white border-white hover:bg-white/20"
              >
                {isLiveMode ? 'Pausar' : 'Reanudar'}
              </Button>
              <Bell className="h-6 w-6 text-white cursor-pointer hover:text-yellow-300 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      <div className={`${alertColors[currentAlertLevel]} bg-opacity-90 text-white p-3`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {alertIcons[currentAlertLevel]}
            <span className="font-semibold">
              Nivel de Alerta: {currentAlertLevel.toUpperCase()}
            </span>
            <span className="text-sm opacity-90">
              | Última actualización: {new Date().toLocaleTimeString('es-CL')}
            </span>
          </div>
          <Button variant="secondary" size="sm">
            Ver Protocolo de Emergencia
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Caudal Actual</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStation.caudal.toFixed(1)} m³/s</div>
              <div className="flex items-center text-xs text-green-500 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.3% vs promedio
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-cyan-500 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nivel del Agua</CardTitle>
              <Waves className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStation.nivel.toFixed(2)} m</div>
              <Progress value={(currentStation.nivel / 5) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Velocidad</CardTitle>
              <Zap className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStation.velocidad.toFixed(1)} m/s</div>
              <div className="text-xs text-muted-foreground mt-1">
                Régimen: {bernoulliCalculations.regimen}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Energía Total</CardTitle>
              <Gauge className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bernoulliCalculations.energiaTotal.toFixed(2)} m</div>
              <div className="text-xs text-muted-foreground mt-1">
                Ecuación de Bernoulli
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Contenido Principal */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="hydraulics">Análisis Hidráulico</TabsTrigger>
            <TabsTrigger value="quality">Calidad del Agua</TabsTrigger>
            <TabsTrigger value="predictions">Predicciones</TabsTrigger>
            <TabsTrigger value="bernoulli">Bernoulli</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gráfico de Caudal */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolución del Caudal</CardTitle>
                  <CardDescription>
                    Monitoreo en tiempo real del flujo volumétrico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height="300">
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id="colorCaudal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="time" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                        labelStyle={{ color: '#cbd5e1' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="caudal" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorCaudal)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Nivel */}
              <Card>
                <CardHeader>
                  <CardTitle>Nivel del Río</CardTitle>
                  <CardDescription>
                    Altura del agua con umbrales de alerta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height="300">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="time" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                        labelStyle={{ color: '#cbd5e1' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="nivel" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={false}
                      />
                      {/* Líneas de umbral */}
                      <Line 
                        type="monotone" 
                        dataKey={() => 3} 
                        stroke="#eab308" 
                        strokeDasharray="5 5"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={() => 4} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Información Meteorológica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Precipitación Acumulada</CardTitle>
                  <CloudRain className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">24.5 mm</div>
                  <div className="text-xs text-muted-foreground">Últimas 24 horas</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>48h: 38.2 mm</span>
                      <span>7d: 125.8 mm</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Temperatura del Agua</CardTitle>
                  <Thermometer className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{currentStation.temperatura.toFixed(1)}°C</div>
                  <div className="text-xs text-muted-foreground">Óptima para ecosistema</div>
                  <Progress value={(currentStation.temperatura / 15) * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Isoterma 0°C</CardTitle>
                  <Mountain className="h-4 w-4 text-cyan-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">2,850 msnm</div>
                  <div className="text-xs text-muted-foreground">Aporte nival moderado</div>
                  <div className="flex items-center text-xs text-blue-500 mt-2">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Descendiendo 50m/día
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hydraulics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Parámetros Hidráulicos */}
              <Card>
                <CardHeader>
                  <CardTitle>Parámetros Hidráulicos Avanzados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm font-medium">Número de Froude</span>
                      <Badge variant={bernoulliCalculations.numeroFroude > 1 ? "destructive" : "default"}>
                        {bernoulliCalculations.numeroFroude.toFixed(3)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm font-medium">Número de Reynolds</span>
                      <Badge variant="secondary">
                        {bernoulliCalculations.numeroReynolds.toExponential(2)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm font-medium">Régimen de Flujo</span>
                      <Badge variant={bernoulliCalculations.regimen === 'Supercrítico' ? "destructive" : "default"}>
                        {bernoulliCalculations.regimen}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm font-medium">Coeficiente de Manning</span>
                      <Badge variant="outline">0.035</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Radar de Parámetros */}
              <Card>
                <CardHeader>
                  <CardTitle>Análisis Multidimensional</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height="300">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="parametro" stroke="#94a3b8" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
                      <Radar 
                        name="Estado Actual" 
                        dataKey="valor" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Distribución de Presión */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Presión y Velocidad</CardTitle>
                <CardDescription>
                  Análisis según el principio de conservación de energía
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="250">
                  <BarChart data={historicalData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" stroke="#888" />
                    <YAxis yAxisId="left" stroke="#888" />
                    <YAxis yAxisId="right" orientation="right" stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Bar yAxisId="left" dataKey="presion" fill="#8b5cf6" />
                    <Bar yAxisId="right" dataKey="velocidad" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">pH</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStation.ph.toFixed(1)}</div>
                  <Progress value={(currentStation.ph / 14) * 100} className="mt-2" />
                  <span className="text-xs text-green-500">Óptimo</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Oxígeno Disuelto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStation.oxigeno.toFixed(1)} mg/L</div>
                  <Progress value={(currentStation.oxigeno / 12) * 100} className="mt-2" />
                  <span className="text-xs text-green-500">Excelente</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Turbidez</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStation.turbidez.toFixed(1)} NTU</div>
                  <Progress value={(currentStation.turbidez / 20) * 100} className="mt-2" />
                  <span className="text-xs text-yellow-500">Aceptable</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Conductividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">125 µS/cm</div>
                  <Progress value={65} className="mt-2" />
                  <span className="text-xs text-green-500">Normal</span>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Calidad del Agua */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Parámetros de Calidad</CardTitle>
                <CardDescription>Monitoreo continuo de indicadores clave</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="300">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Line type="monotone" dataKey="ph" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="oxigeno" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="turbidez" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <Alert className="border-blue-500 bg-blue-500/10">
              <Info className="h-4 w-4" />
              <AlertTitle>Sistema de Predicción Activo</AlertTitle>
              <AlertDescription>
                Modelo híbrido basado en ML y análisis estacional para pronósticos de 72 horas
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Predicción de Caudal */}
              <Card>
                <CardHeader>
                  <CardTitle>Predicción de Caudal - 72 horas</CardTitle>
                  <CardDescription>Basado en patrones históricos y meteorología</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height="250">
                    <AreaChart data={historicalData.slice(-24)}>
                      <defs>
                        <linearGradient id="colorPrediccion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="time" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="caudal" 
                        stroke="#a855f7" 
                        fillOpacity={1} 
                        fill="url(#colorPrediccion)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tiempo de Llegada */}
              <Card>
                <CardHeader>
                  <CardTitle>Tiempo de Llegada de Crecidas</CardTitle>
                  <CardDescription>Propagación entre estaciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                      <div>
                        <p className="font-medium">Laguna Quillelhue → Confluencia</p>
                        <p className="text-xs text-muted-foreground">Distancia: 12.5 km</p>
                      </div>
                      <Badge variant="default">~2.5 horas</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-lg">
                      <div>
                        <p className="font-medium">Velocidad de Propagación</p>
                        <p className="text-xs text-muted-foreground">Onda de crecida</p>
                      </div>
                      <Badge variant="secondary">5.0 km/h</Badge>
                    </div>
                    <Progress value={75} className="mt-4" />
                    <p className="text-xs text-center text-muted-foreground">
                      Crecida en tránsito: 75% del recorrido
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Análisis Estacional */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis Estacional y Probabilístico</CardTitle>
                <CardDescription>Comparación con patrones históricos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="300">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="time" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Line type="monotone" dataKey="caudal" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                    <Line 
                      type="monotone" 
                      dataKey={() => 180} 
                      stroke="#10b981" 
                      strokeDasharray="5 5" 
                      name="Promedio Histórico"
                    />
                    <Line 
                      type="monotone" 
                      dataKey={() => 220} 
                      stroke="#f59e0b" 
                      strokeDasharray="3 3" 
                      name="P95 (Alerta)"
                    />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bernoulli" className="space-y-4">
            {/* Tributo a Bernoulli */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-purple-500">
              <CardHeader>
                <CardTitle className="text-2xl">Principio de Bernoulli</CardTitle>
                <CardDescription className="text-lg">
                  "En un fluido ideal, la energía total permanece constante"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 p-6 rounded-lg text-center mb-6">
                  <p className="text-3xl font-mono text-cyan-400 mb-4">
                    P/ρg + v²/2g + z = H (constante)
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Energía de Presión</p>
                      <p className="text-xl font-bold text-blue-400">
                        {(currentStation.presion / (1000 * 9.81)).toFixed(2)} m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Energía Cinética</p>
                      <p className="text-xl font-bold text-green-400">
                        {(Math.pow(currentStation.velocidad, 2) / (2 * 9.81)).toFixed(2)} m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Energía Potencial</p>
                      <p className="text-xl font-bold text-purple-400">
                        {currentStation.nivel.toFixed(2)} m
                      </p>
                    </div>
                  </div>
                </div>

                {/* Biografía de Bernoulli */}
                <div className="bg-slate-800/30 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Daniel Bernoulli (1700-1782)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Matemático y físico suizo, miembro de la extraordinaria familia Bernoulli. 
                    Su obra "Hydrodynamica" (1738) estableció los principios fundamentales de la 
                    mecánica de fluidos que revolucionaron la ingeniería hidráulica.
                  </p>
                </div>

                {/* Calculadora Interactiva */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Calculadora de Bernoulli - Puntos del Río</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm font-medium mb-2">Punto A: Laguna Quillelhue</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Altura (z):</span>
                          <span className="font-mono">850 msnm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Velocidad (v):</span>
                          <span className="font-mono">2.1 m/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Presión (P):</span>
                          <span className="font-mono">103.5 kPa</span>
                        </div>
                        <div className="flex justify-between font-bold text-cyan-400">
                          <span>Energía Total:</span>
                          <span className="font-mono">863.45 m</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <p className="text-sm font-medium mb-2">Punto B: Confluencia Villarrica</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Altura (z):</span>
                          <span className="font-mono">750 msnm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Velocidad (v):</span>
                          <span className="font-mono">2.4 m/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Presión (P):</span>
                          <span className="font-mono">105.2 kPa</span>
                        </div>
                        <div className="flex justify-between font-bold text-cyan-400">
                          <span>Energía Total:</span>
                          <span className="font-mono">763.89 m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Alert className="border-yellow-500 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      La diferencia de energía (99.56 m) representa las pérdidas por fricción 
                      y turbulencia en el recorrido del río.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Visualización de la Ecuación */}
            <Card>
              <CardHeader>
                <CardTitle>Aplicación en Tiempo Real</CardTitle>
                <CardDescription>Visualización del balance energético del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="300">
                  <BarChart data={[
                    { name: 'Presión', valor: (currentStation.presion / (1000 * 9.81)), fill: '#3b82f6' },
                    { name: 'Cinética', valor: (Math.pow(currentStation.velocidad, 2) / (2 * 9.81)), fill: '#10b981' },
                    { name: 'Potencial', valor: currentStation.nivel, fill: '#a855f7' },
                    { name: 'Total', valor: bernoulliCalculations.energiaTotal, fill: '#f59e0b' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                      formatter={(value: number) => `${value.toFixed(2)} m`}
                    />
                    <Bar dataKey="valor" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer con Estadísticas */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Registros/día</p>
                  <p className="text-xl font-bold">17,280</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Precisión</p>
                  <p className="text-xl font-bold">99.7%</p>
                </div>
                <Gauge className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="text-xl font-bold">99.99%</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Alertas Hoy</p>
                  <p className="text-xl font-bold">3</p>
                </div>
                <Bell className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Powered by Bernoulli Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Waves className="h-4 w-4" />
            Powered by Bernoulli • HydroFlow Monitor v1.0 • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HydroFlowDashboard;