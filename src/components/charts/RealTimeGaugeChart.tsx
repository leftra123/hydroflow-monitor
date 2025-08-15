/**
 * ⚡ Medición en Tiempo Real - Gauge Radial
 *
 * Componente de medición que simula instrumentos analógicos profesionales.
 * Visualiza múltiples parámetros con indicadores radiales dinámicos.
 */

import React, { useMemo } from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Gauge,
  Droplets,
  Thermometer,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useThemeConfiguration } from '@/core/state';

interface RealTimeGaugeChartProps {
  data: {
    waterLevel: number;
    pH: number;
    dissolvedOxygen: number;
    temperature: number;
    turbidity: number;
  };
  className?: string;
}

export const RealTimeGaugeChart: React.FC<RealTimeGaugeChartProps> = ({
  data,
  className = ''
}) => {
  const theme = useThemeConfiguration();

  // 🎯 Configuración de parámetros y rangos
  const parameterConfig = useMemo(() => ({
    waterLevel: {
      value: data.waterLevel,
      min: 0,
      max: 5,
      optimal: { min: 1.5, max: 3.5 },
      unit: 'm',
      label: 'Nivel del Agua',
      icon: Droplets,
      color: theme.colors.primary
    },
    pH: {
      value: data.pH,
      min: 6,
      max: 8.5,
      optimal: { min: 6.8, max: 7.8 },
      unit: '',
      label: 'pH',
      icon: Activity,
      color: theme.colors.success
    },
    dissolvedOxygen: {
      value: data.dissolvedOxygen,
      min: 5,
      max: 12,
      optimal: { min: 8, max: 11 },
      unit: 'mg/L',
      label: 'Oxígeno Disuelto',
      icon: Activity,
      color: theme.colors.secondary
    },
    temperature: {
      value: data.temperature,
      min: 0,
      max: 25,
      optimal: { min: 5, max: 15 },
      unit: '°C',
      label: 'Temperatura',
      icon: Thermometer,
      color: theme.colors.warning
    }
  }), [data, theme]);

  // 🧮 Cálculo de estado y porcentajes
  const gaugeData = useMemo(() => {
    return Object.entries(parameterConfig).map(([key, config]) => {
      const percentage = ((config.value - config.min) / (config.max - config.min)) * 100;
      const isOptimal = config.value >= config.optimal.min && config.value <= config.optimal.max;
      const status = isOptimal ? 'optimal' : 
                    (config.value < config.optimal.min || config.value > config.optimal.max) ? 'warning' : 'normal';

      return {
        name: config.label,
        value: Math.max(0, Math.min(100, percentage)),
        actualValue: config.value,
        unit: config.unit,
        status,
        color: config.color,
        icon: config.icon,
        isOptimal
      };
    });
  }, [parameterConfig]);

  // 🎨 Componente de Gauge Individual
  const IndividualGauge: React.FC<{
    data: typeof gaugeData[0];
    size?: number;
  }> = ({ data: gaugeItem, size = 120 }) => {
    const IconComponent = gaugeItem.icon;
    
    const gaugeChartData = [
      {
        name: gaugeItem.name,
        value: gaugeItem.value,
        fill: gaugeItem.color
      }
    ];

    const backgroundData = [
      {
        name: 'background',
        value: 100,
        fill: theme.charts.gridColor
      }
    ];

    return (
      <div className="relative flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              startAngle={90}
              endAngle={-270}
              data={backgroundData}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={0}
                fill="#e2e8f0"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                data={gaugeChartData}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={4}
                  fill={gaugeItem.color}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Centro del gauge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <IconComponent className="h-4 w-4 mb-1" style={{ color: gaugeItem.color }} />
            <div className="text-lg font-bold" style={{ color: gaugeItem.color }}>
              {gaugeItem.actualValue.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {gaugeItem.unit}
            </div>
          </div>
        </div>

        {/* Etiqueta y estado */}
        <div className="mt-2 text-center">
          <div className="text-sm font-medium">{gaugeItem.name}</div>
          <Badge 
            variant={gaugeItem.isOptimal ? 'default' : 'secondary'}
            className="text-xs mt-1"
          >
            {gaugeItem.isOptimal ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertTriangle className="h-3 w-3 mr-1" />
            )}
            {gaugeItem.isOptimal ? 'Óptimo' : 'Fuera de rango'}
          </Badge>
        </div>
      </div>
    );
  };

  // 🎯 Gauge Principal de Calidad del Agua
  const overallQualityScore = useMemo(() => {
    const optimalCount = gaugeData.filter(item => item.isOptimal).length;
    const score = (optimalCount / gaugeData.length) * 100;
    
    return {
      score: Math.round(score),
      status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
      color: score >= 80 ? theme.colors.success : 
             score >= 60 ? theme.colors.primary :
             score >= 40 ? theme.colors.warning : theme.colors.danger
    };
  }, [gaugeData, theme]);

  const qualityGaugeData = [
    {
      name: 'Calidad',
      value: overallQualityScore.score,
      fill: overallQualityScore.color
    }
  ];

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Gauge className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span>Medición en Tiempo Real</span>
          </CardTitle>
          
          <Badge 
            variant={overallQualityScore.status === 'excellent' ? 'default' : 'secondary'}
            className="text-xs"
          >
            Calidad: {overallQualityScore.score}%
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Parámetros de calidad del agua • Actualización continua
        </div>
      </CardHeader>

      <CardContent>
        {/* Gauge principal de calidad */}
        <div className="flex justify-center mb-6">
          <div className="relative" style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                data={[{ value: 100, fill: theme.charts.gridColor }]}
              >
                <RadialBar dataKey="value" cornerRadius={0} />
              </RadialBarChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="90%"
                  startAngle={90}
                  endAngle={-270}
                  data={qualityGaugeData}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={8}
                    fill={overallQualityScore.color}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Gauge className="h-6 w-6 mb-2" style={{ color: overallQualityScore.color }} />
              <div className="text-3xl font-bold" style={{ color: overallQualityScore.color }}>
                {overallQualityScore.score}
              </div>
              <div className="text-sm text-muted-foreground">Calidad General</div>
              <Badge 
                variant="outline" 
                className="mt-2 text-xs capitalize"
                style={{ borderColor: overallQualityScore.color, color: overallQualityScore.color }}
              >
                {overallQualityScore.status === 'excellent' ? 'Excelente' :
                 overallQualityScore.status === 'good' ? 'Buena' :
                 overallQualityScore.status === 'fair' ? 'Regular' : 'Deficiente'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Gauges individuales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {gaugeData.map((item, index) => (
            <IndividualGauge key={index} data={item} size={100} />
          ))}
        </div>

        {/* Resumen de estado */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Estado del Sistema</span>
            <div className="flex items-center space-x-1">
              {overallQualityScore.score >= 80 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">
                {gaugeData.filter(item => item.isOptimal).length} de {gaugeData.length} parámetros óptimos
              </span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {overallQualityScore.score >= 80 
              ? 'Todos los parámetros están dentro de rangos óptimos. El ecosistema acuático está en excelente estado.'
              : overallQualityScore.score >= 60
              ? 'La mayoría de parámetros están en rangos aceptables. Monitoreo continuo recomendado.'
              : 'Algunos parámetros requieren atención. Se recomienda investigación adicional.'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
