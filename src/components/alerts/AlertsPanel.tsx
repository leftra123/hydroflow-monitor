/**
 * 🚨 Panel de Alertas Inteligentes
 * 
 * Sistema de alertas que analiza los datos en tiempo real
 * y genera notificaciones contextuales basadas en umbrales dinámicos.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Zap,
  Droplets,
  Thermometer,
  Activity,
  Bell,
  X
} from 'lucide-react';
import { useThemeConfiguration } from '@/core/state';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  parameter: string;
  value: number;
  threshold: number;
  timestamp: Date;
  icon: React.ComponentType<any>;
}

interface AlertsPanelProps {
  currentData: {
    waterLevel: number;
    flowRate: number;
    velocity: number;
    temperature: number;
    pH: number;
    dissolvedOxygen: number;
    turbidity: number;
  };
  hydraulicCalculations?: {
    reynoldsNumber: number;
    froudeNumber: number;
    flowRegime: string;
    flowType: string;
  };
  className?: string;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  currentData,
  hydraulicCalculations,
  className = ''
}) => {
  const theme = useThemeConfiguration();

  // 🎯 Generación inteligente de alertas
  const alerts = useMemo((): Alert[] => {
    const generatedAlerts: Alert[] = [];
    const now = new Date();

    // Alerta de nivel del agua
    if (currentData.waterLevel > 3.5) {
      generatedAlerts.push({
        id: 'water-level-high',
        type: 'warning',
        title: 'Nivel del Agua Elevado',
        message: `El nivel actual de ${currentData.waterLevel.toFixed(2)}m supera el umbral de seguridad de 3.5m`,
        parameter: 'waterLevel',
        value: currentData.waterLevel,
        threshold: 3.5,
        timestamp: now,
        icon: Droplets
      });
    } else if (currentData.waterLevel < 1.0) {
      generatedAlerts.push({
        id: 'water-level-low',
        type: 'warning',
        title: 'Nivel del Agua Bajo',
        message: `El nivel actual de ${currentData.waterLevel.toFixed(2)}m está por debajo del mínimo operativo de 1.0m`,
        parameter: 'waterLevel',
        value: currentData.waterLevel,
        threshold: 1.0,
        timestamp: now,
        icon: Droplets
      });
    }

    // Alerta de caudal
    if (currentData.flowRate > 250) {
      generatedAlerts.push({
        id: 'flow-rate-high',
        type: 'critical',
        title: 'Caudal Crítico',
        message: `Caudal de ${currentData.flowRate.toFixed(1)} m³/s supera el límite crítico de 250 m³/s`,
        parameter: 'flowRate',
        value: currentData.flowRate,
        threshold: 250,
        timestamp: now,
        icon: Activity
      });
    }

    // Alerta de temperatura
    if (currentData.temperature > 20) {
      generatedAlerts.push({
        id: 'temperature-high',
        type: 'warning',
        title: 'Temperatura Elevada',
        message: `Temperatura de ${currentData.temperature.toFixed(1)}°C puede afectar el ecosistema acuático`,
        parameter: 'temperature',
        value: currentData.temperature,
        threshold: 20,
        timestamp: now,
        icon: Thermometer
      });
    } else if (currentData.temperature < 2) {
      generatedAlerts.push({
        id: 'temperature-low',
        type: 'info',
        title: 'Temperatura Baja',
        message: `Temperatura de ${currentData.temperature.toFixed(1)}°C indica condiciones invernales`,
        parameter: 'temperature',
        value: currentData.temperature,
        threshold: 2,
        timestamp: now,
        icon: Thermometer
      });
    }

    // Alerta de pH
    if (currentData.pH < 6.5 || currentData.pH > 8.0) {
      generatedAlerts.push({
        id: 'ph-abnormal',
        type: 'warning',
        title: 'pH Fuera de Rango',
        message: `pH de ${currentData.pH.toFixed(2)} está fuera del rango óptimo (6.5-8.0)`,
        parameter: 'pH',
        value: currentData.pH,
        threshold: currentData.pH < 6.5 ? 6.5 : 8.0,
        timestamp: now,
        icon: Activity
      });
    }

    // Alerta de oxígeno disuelto
    if (currentData.dissolvedOxygen < 6.0) {
      generatedAlerts.push({
        id: 'oxygen-low',
        type: 'critical',
        title: 'Oxígeno Disuelto Crítico',
        message: `Nivel de ${currentData.dissolvedOxygen.toFixed(1)} mg/L compromete la vida acuática`,
        parameter: 'dissolvedOxygen',
        value: currentData.dissolvedOxygen,
        threshold: 6.0,
        timestamp: now,
        icon: Activity
      });
    }

    // Alerta de turbidez
    if (currentData.turbidity > 10) {
      generatedAlerts.push({
        id: 'turbidity-high',
        type: 'warning',
        title: 'Alta Turbidez',
        message: `Turbidez de ${currentData.turbidity.toFixed(1)} NTU indica posible contaminación`,
        parameter: 'turbidity',
        value: currentData.turbidity,
        threshold: 10,
        timestamp: now,
        icon: Droplets
      });
    }

    // Alertas hidráulicas
    if (hydraulicCalculations) {
      if (hydraulicCalculations.froudeNumber > 1.2) {
        generatedAlerts.push({
          id: 'froude-supercritical',
          type: 'warning',
          title: 'Flujo Supercrítico',
          message: `Número de Froude ${hydraulicCalculations.froudeNumber.toFixed(3)} indica flujo rápido y potencialmente erosivo`,
          parameter: 'froudeNumber',
          value: hydraulicCalculations.froudeNumber,
          threshold: 1.2,
          timestamp: now,
          icon: Zap
        });
      }
    }

    // Si no hay alertas, mostrar estado normal
    if (generatedAlerts.length === 0) {
      generatedAlerts.push({
        id: 'system-normal',
        type: 'success',
        title: 'Sistema Operativo Normal',
        message: 'Todos los parámetros están dentro de rangos aceptables',
        parameter: 'system',
        value: 100,
        threshold: 100,
        timestamp: now,
        icon: CheckCircle
      });
    }

    return generatedAlerts.sort((a, b) => {
      const priority = { critical: 3, warning: 2, info: 1, success: 0 };
      return priority[b.type] - priority[a.type];
    });
  }, [currentData, hydraulicCalculations]);

  // 🎨 Función para obtener colores por tipo
  const getAlertColors = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-950',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: 'text-red-600 dark:text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: 'text-blue-600 dark:text-blue-400'
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-950',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          icon: 'text-green-600 dark:text-green-400'
        };
    }
  };

  // 🎯 Componente de alerta individual
  const AlertItem: React.FC<{ alert: Alert; index: number }> = ({ alert, index }) => {
    const colors = getAlertColors(alert.type);
    const IconComponent = alert.icon;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
      >
        <div className="flex items-start space-x-3">
          <div className={`p-1 rounded-full ${colors.icon}`}>
            <IconComponent className="h-4 w-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className={`font-medium text-sm ${colors.text}`}>
                {alert.title}
              </h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${colors.text} ${colors.border}`}
              >
                {alert.type.toUpperCase()}
              </Badge>
            </div>
            
            <p className={`text-xs ${colors.text} opacity-90 mb-2`}>
              {alert.message}
            </p>
            
            <div className="flex items-center justify-between text-xs opacity-75">
              <span className={colors.text}>
                {alert.timestamp.toLocaleTimeString('es-CL')}
              </span>
              {alert.parameter !== 'system' && (
                <span className={colors.text}>
                  {alert.parameter}: {alert.value.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
              <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span>Alertas del Sistema</span>
          </CardTitle>
          
          <Badge 
            variant={alerts.some(a => a.type === 'critical') ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Monitoreo inteligente de parámetros críticos
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <AlertItem key={alert.id} alert={alert} index={index} />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};
