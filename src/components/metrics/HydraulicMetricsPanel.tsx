/**
 * 🧮 Panel de Métricas Hidráulicas
 * 
 * Componente que muestra los cálculos hidráulicos fundamentales
 * con visualización elegante y explicaciones técnicas.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Activity, 
  Waves, 
  Thermometer,
  Info,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { HydraulicCalculations } from '@/types/hydrology';
import { useThemeConfiguration } from '@/core/state';

interface HydraulicMetricsPanelProps {
  calculations: HydraulicCalculations;
  currentData: {
    flowRate: number;
    velocity: number;
    waterLevel: number;
    temperature: number;
  };
  className?: string;
}

export const HydraulicMetricsPanel: React.FC<HydraulicMetricsPanelProps> = ({
  calculations,
  currentData,
  className = ''
}) => {
  const theme = useThemeConfiguration();

  // 🎯 Configuración de métricas
  const metrics = [
    {
      id: 'reynolds',
      label: 'Número de Reynolds',
      value: calculations.reynoldsNumber,
      unit: '',
      icon: Activity,
      description: 'Caracteriza el régimen de flujo del río',
      interpretation: calculations.flowRegime,
      color: theme.colors.primary,
      status: calculations.flowRegime === 'turbulent' ? 'normal' : 
              calculations.flowRegime === 'laminar' ? 'warning' : 'info'
    },
    {
      id: 'froude',
      label: 'Número de Froude',
      value: calculations.froudeNumber,
      unit: '',
      icon: Waves,
      description: 'Relación entre fuerzas inerciales y gravitacionales',
      interpretation: calculations.flowType,
      color: theme.colors.secondary,
      status: calculations.flowType === 'subcritical' ? 'normal' :
              calculations.flowType === 'supercritical' ? 'warning' : 'critical'
    },
    {
      id: 'bernoulli',
      label: 'Velocidad de Bernoulli',
      value: calculations.bernoulliVelocity,
      unit: 'm/s',
      icon: Zap,
      description: 'Velocidad teórica basada en conservación de energía',
      interpretation: Math.abs(calculations.bernoulliVelocity - currentData.velocity) < 0.5 ? 'coherente' : 'desviación',
      color: theme.colors.warning,
      status: Math.abs(calculations.bernoulliVelocity - currentData.velocity) < 0.5 ? 'normal' : 'warning'
    }
  ];

  // 🎨 Función para obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'critical': return theme.colors.danger;
      default: return theme.colors.primary;
    }
  };

  // 🎯 Componente de métrica individual
  const MetricCard: React.FC<{ metric: typeof metrics[0]; index: number }> = ({ metric, index }) => {
    const IconComponent = metric.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
      >
        <Card className="h-full hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <IconComponent 
                    className="h-4 w-4" 
                    style={{ color: metric.color }}
                  />
                </div>
                <CardTitle className="text-sm font-medium">
                  {metric.label}
                </CardTitle>
              </div>
              
              <Badge 
                variant="outline"
                className="text-xs"
                style={{ 
                  borderColor: getStatusColor(metric.status),
                  color: getStatusColor(metric.status)
                }}
              >
                {metric.interpretation}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {/* Valor principal */}
              <div className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: metric.color }}
                >
                  {metric.value.toLocaleString('es-CL', { 
                    minimumFractionDigits: metric.id === 'reynolds' ? 0 : 3,
                    maximumFractionDigits: metric.id === 'reynolds' ? 0 : 3
                  })}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              <div className="text-xs text-muted-foreground text-center">
                {metric.description}
              </div>

              {/* Interpretación específica */}
              <div className="mt-3 p-2 rounded-lg bg-muted/50">
                <div className="flex items-start space-x-2">
                  <Info className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="text-xs">
                    {metric.id === 'reynolds' && (
                      <div>
                        <strong>Régimen:</strong> {calculations.flowRegime}
                        <br />
                        {calculations.reynoldsNumber < 2300 && "Flujo laminar - movimiento ordenado"}
                        {calculations.reynoldsNumber >= 2300 && calculations.reynoldsNumber < 4000 && "Flujo transicional - régimen mixto"}
                        {calculations.reynoldsNumber >= 4000 && "Flujo turbulento - mezcla intensa"}
                      </div>
                    )}
                    
                    {metric.id === 'froude' && (
                      <div>
                        <strong>Tipo:</strong> {calculations.flowType}
                        <br />
                        {calculations.froudeNumber < 1 && "Flujo subcrítico - tranquilo"}
                        {calculations.froudeNumber === 1 && "Flujo crítico - transición"}
                        {calculations.froudeNumber > 1 && "Flujo supercrítico - rápido"}
                      </div>
                    )}
                    
                    {metric.id === 'bernoulli' && (
                      <div>
                        <strong>Coherencia:</strong> {metric.interpretation}
                        <br />
                        Diferencia con velocidad medida: {Math.abs(calculations.bernoulliVelocity - currentData.velocity).toFixed(2)} m/s
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span>Cálculos Hidráulicos</span>
          </CardTitle>
          
          <Badge variant="outline" className="text-xs">
            Análisis en Tiempo Real
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Parámetros fundamentales de la dinámica de fluidos
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>

        {/* Resumen técnico */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-2">Interpretación Hidráulica</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Régimen de flujo:</strong> {calculations.flowRegime} 
                  (Re = {calculations.reynoldsNumber.toLocaleString()})
                </p>
                <p>
                  <strong>Tipo de flujo:</strong> {calculations.flowType} 
                  (Fr = {calculations.froudeNumber.toFixed(3)})
                </p>
                <p>
                  <strong>Coherencia hidráulica:</strong> {
                    Math.abs(calculations.bernoulliVelocity - currentData.velocity) < 0.5 
                      ? 'Excelente correlación entre mediciones'
                      : 'Desviación detectada - revisar instrumentación'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
