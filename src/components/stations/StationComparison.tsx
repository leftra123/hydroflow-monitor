/**
 * 🔄 Comparación de Estaciones
 * 
 * Vista dividida para comparar ambas estaciones simultáneamente
 * Detecta divergencias anormales y calcula tiempo de propagación
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Activity,
  Waves,
  Thermometer,
  Droplets
} from 'lucide-react';
import { StationDataPackage } from '@/types/sensors';
import { formatChileanTime } from '@/constants/translations';

interface StationComparisonProps {
  stationNacimiento: StationDataPackage;
  stationPuente: StationDataPackage;
  className?: string;
}

interface ComparisonMetric {
  parameter: string;
  nacimiento: number;
  puente: number;
  difference: number;
  percentageDiff: number;
  status: 'normal' | 'warning' | 'critical';
  unit: string;
  icon: React.ReactNode;
}

export const StationComparison: React.FC<StationComparisonProps> = ({
  stationNacimiento,
  stationPuente,
  className = ''
}) => {
  // Calcular métricas de comparación
  const comparisonMetrics = useMemo((): ComparisonMetric[] => {
    const metrics: ComparisonMetric[] = [
      {
        parameter: 'Nivel del Agua',
        nacimiento: stationNacimiento.waterLevel.level.value,
        puente: stationPuente.waterLevel.level.value,
        difference: 0,
        percentageDiff: 0,
        status: 'normal',
        unit: 'm',
        icon: <Waves className="w-4 h-4 text-blue-500" />
      },
      {
        parameter: 'Caudal',
        nacimiento: stationNacimiento.flowRate.discharge.value,
        puente: stationPuente.flowRate.discharge.value,
        difference: 0,
        percentageDiff: 0,
        status: 'normal',
        unit: 'm³/s',
        icon: <Activity className="w-4 h-4 text-purple-500" />
      },
      {
        parameter: 'Temperatura',
        nacimiento: stationNacimiento.waterQuality.temperature.value,
        puente: stationPuente.waterQuality.temperature.value,
        difference: 0,
        percentageDiff: 0,
        status: 'normal',
        unit: '°C',
        icon: <Thermometer className="w-4 h-4 text-orange-500" />
      },
      {
        parameter: 'Conductividad',
        nacimiento: stationNacimiento.waterQuality.conductivity.value,
        puente: stationPuente.waterQuality.conductivity.value,
        difference: 0,
        percentageDiff: 0,
        status: 'normal',
        unit: 'μS/cm',
        icon: <Droplets className="w-4 h-4 text-green-500" />
      }
    ];

    // Calcular diferencias y estados
    return metrics.map(metric => {
      const diff = metric.puente - metric.nacimiento;
      const percentDiff = metric.nacimiento !== 0 ? (diff / metric.nacimiento) * 100 : 0;
      
      // Determinar estado basado en el parámetro
      let status: 'normal' | 'warning' | 'critical' = 'normal';
      
      if (metric.parameter === 'Nivel del Agua') {
        if (Math.abs(percentDiff) > 30) status = 'critical';
        else if (Math.abs(percentDiff) > 15) status = 'warning';
      } else if (metric.parameter === 'Caudal') {
        if (Math.abs(percentDiff) > 25) status = 'critical';
        else if (Math.abs(percentDiff) > 10) status = 'warning';
      } else if (metric.parameter === 'Temperatura') {
        if (Math.abs(diff) > 5) status = 'critical';
        else if (Math.abs(diff) > 2) status = 'warning';
      } else if (metric.parameter === 'Conductividad') {
        if (Math.abs(percentDiff) > 50) status = 'critical';
        else if (Math.abs(percentDiff) > 20) status = 'warning';
      }

      return {
        ...metric,
        difference: diff,
        percentageDiff: percentDiff,
        status
      };
    });
  }, [stationNacimiento, stationPuente]);

  // Calcular tiempo de propagación estimado
  const propagationTime = useMemo(() => {
    // Distancia aproximada entre estaciones: 8 km
    // Velocidad promedio del agua: 1.5 m/s
    const distance = 8000; // metros
    const avgVelocity = stationNacimiento.flowRate.velocity.value || 1.5; // m/s
    const timeSeconds = distance / avgVelocity;
    const timeMinutes = Math.round(timeSeconds / 60);
    
    return {
      minutes: timeMinutes,
      hours: Math.round(timeMinutes / 60 * 10) / 10,
      velocity: avgVelocity
    };
  }, [stationNacimiento.flowRate.velocity.value]);

  // Detectar anomalías críticas
  const criticalAnomalies = comparisonMetrics.filter(m => m.status === 'critical');
  const warningAnomalies = comparisonMetrics.filter(m => m.status === 'warning');

  const getDifferenceIcon = (diff: number) => {
    if (Math.abs(diff) < 0.01) return <Minus className="w-3 h-3 text-gray-500" />;
    return diff > 0 ? 
      <ArrowUp className="w-3 h-3 text-red-500" /> : 
      <ArrowDown className="w-3 h-3 text-green-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical': return <Badge variant="destructive">CRÍTICO</Badge>;
      case 'warning': return <Badge variant="default">ADVERTENCIA</Badge>;
      default: return <Badge variant="outline">NORMAL</Badge>;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Encabezado de comparación */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Comparación de Estaciones en Tiempo Real
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              Río Claro - Pucón
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Análisis comparativo entre Estación Nacimiento (cabecera) y Estación Puente (zona turística)
          </div>
        </CardHeader>
      </Card>

      {/* Alertas de anomalías */}
      {criticalAnomalies.length > 0 && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>🚨 DIVERGENCIA CRÍTICA DETECTADA:</strong> {criticalAnomalies.map(a => a.parameter).join(', ')}
            <br />
            <span className="text-sm">
              Posible falla de sensor o evento anormal en el río. Verificar inmediatamente ambas estaciones.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {warningAnomalies.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Diferencias significativas:</strong> {warningAnomalies.map(a => a.parameter).join(', ')}
            <br />
            <span className="text-sm">
              Monitorear evolución de las diferencias entre estaciones.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Información de propagación */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-blue-500" />
            Tiempo de Propagación Hidráulica
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Distancia entre estaciones: 8 km • Desnivel: ~560 m
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{propagationTime.minutes}</div>
              <div className="text-sm text-muted-foreground">minutos</div>
              <div className="text-xs text-blue-500 mt-1">Tiempo estimado</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{propagationTime.hours}</div>
              <div className="text-sm text-muted-foreground">horas</div>
              <div className="text-xs text-blue-500 mt-1">Equivalente</div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{propagationTime.velocity.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">m/s</div>
              <div className="text-xs text-blue-500 mt-1">Velocidad promedio</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              💡 <strong>Interpretación:</strong> Los cambios en la estación Nacimiento se reflejarán
              en la estación Puente aproximadamente en {propagationTime.minutes} minutos,
              permitiendo alertas tempranas para la zona turística.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Comparación detallada */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Comparación de Estaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonMetrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <span className="font-medium">{metric.parameter}</span>
                  </div>
                  {getStatusBadge(metric.status)}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Estación Nacimiento */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Nacimiento</div>
                    <div className="text-lg font-bold">
                      {metric.nacimiento.toFixed(2)} {metric.unit}
                    </div>
                  </div>

                  {/* Diferencia */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getDifferenceIcon(metric.difference)}
                      <span className="text-sm font-medium">
                        {metric.difference > 0 ? '+' : ''}{metric.difference.toFixed(2)} {metric.unit}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({metric.percentageDiff > 0 ? '+' : ''}{metric.percentageDiff.toFixed(1)}%)
                    </div>
                  </div>

                  {/* Estación Puente */}
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Puente</div>
                    <div className="text-lg font-bold">
                      {metric.puente.toFixed(2)} {metric.unit}
                    </div>
                  </div>
                </div>

                {/* Explicación de la diferencia */}
                {metric.status !== 'normal' && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                    {metric.status === 'critical' && (
                      <span className="text-red-600 font-medium">
                        ⚠️ Diferencia anormal - Verificar sensores y condiciones del río
                      </span>
                    )}
                    {metric.status === 'warning' && (
                      <span className="text-yellow-600 font-medium">
                        ⚡ Diferencia significativa - Monitorear evolución
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumen del estado */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-sm">
              <strong>Última actualización:</strong> {formatChileanTime(new Date())}
            </div>
            <div className="text-sm mt-1">
              <strong>Estado general:</strong> {
                criticalAnomalies.length > 0 ? '🔴 Crítico - Requiere atención inmediata' :
                warningAnomalies.length > 0 ? '🟡 Advertencia - Monitorear de cerca' :
                '🟢 Normal - Operación estable'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
