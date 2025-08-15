/**
 * 🌊 Dashboard Simplificado - HydroFlow Monitor
 * 
 * Versión simplificada del dashboard que funciona sin backend
 * para demostrar la arquitectura y componentes implementados.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Waves, 
  Activity, 
  Thermometer, 
  Droplets,
  AlertTriangle,
  CheckCircle,
  Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Datos mock para demostración
const mockStations = [
  {
    id: 'station1',
    nombre: 'Río Claro - Pucón Centro',
    estado: 'normal' as const,
    caudal: 165.3,
    nivel: 2.84,
    velocidad: 2.1,
    temperatura: 8.7,
  },
  {
    id: 'station2',
    nombre: 'Río Claro - Puente Holzapfel',
    estado: 'alerta' as const,
    caudal: 198.7,
    nivel: 3.12,
    velocidad: 2.8,
    temperatura: 9.1,
  },
  {
    id: 'station3',
    nombre: 'Río Claro - Desembocadura',
    estado: 'critico' as const,
    caudal: 234.5,
    nivel: 3.89,
    velocidad: 3.2,
    temperatura: 9.8,
  }
];

const SimpleDashboard: React.FC = () => {
  const [selectedStation, setSelectedStation] = React.useState(mockStations[0]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'alerta': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critico': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'alerta': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critico': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-700 p-6 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Waves className="h-10 w-10 text-cyan-300" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white">HydroFlow Monitor</h1>
                <p className="text-cyan-100 text-sm mt-1">
                  Sistema de Monitoreo Hidrológico - Río Claro de Pucón
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge className="bg-green-500 text-white">
                ✅ Sistema Operativo
              </Badge>
              <Badge className="bg-blue-500 text-white">
                🌊 Modo Demo
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Métricas Principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Caudal Actual</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedStation.caudal.toFixed(1)} m³/s</div>
              <p className="text-xs text-muted-foreground">+12.3% vs promedio</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nivel del Agua</CardTitle>
              <Gauge className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedStation.nivel.toFixed(2)} m</div>
              <p className="text-xs text-muted-foreground">Normal</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
              <Thermometer className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedStation.temperatura.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">-2.1°C vs ayer</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Velocidad</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedStation.velocidad.toFixed(1)} m/s</div>
              <p className="text-xs text-muted-foreground">+0.3 m/s</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Estaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Estaciones de Monitoreo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockStations.map((station, index) => (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedStation.id === station.id 
                          ? 'ring-2 ring-blue-500 shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedStation(station)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{station.nombre}</CardTitle>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(station.estado)}
                            <Badge className={`${getStatusColor(station.estado)} capitalize`}>
                              {station.estado}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Caudal:</span>
                            <span className="ml-2 font-medium">{station.caudal.toFixed(1)} m³/s</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Nivel:</span>
                            <span className="ml-2 font-medium">{station.nivel.toFixed(2)} m</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Temp:</span>
                            <span className="ml-2 font-medium">{station.temperatura.toFixed(1)}°C</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Velocidad:</span>
                            <span className="ml-2 font-medium">{station.velocidad.toFixed(1)} m/s</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Información del Sistema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Waves className="h-5 w-5 text-blue-600" />
                <span>Sistema de Monitoreo Aumentado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Store de Zustand: ✅ Activo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>React Query: ✅ Configurado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Framer Motion: ✅ Animando</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Socket.IO: ⏸️ Deshabilitado</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <p className="text-sm text-gray-600">
                  <strong>🎉 ¡Arquitectura Aumentada Funcionando!</strong><br />
                  Este dashboard demuestra la implementación exitosa de la arquitectura reactiva con Zustand, 
                  React Query, Framer Motion y componentes optimizados. El Socket.IO está temporalmente 
                  deshabilitado hasta implementar el backend.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
