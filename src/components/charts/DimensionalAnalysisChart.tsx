/**
 * 🕸️ Análisis Dimensional - Radar Chart
 * 
 * Visualización multidimensional que compara múltiples parámetros
 * en un único gráfico radial, revelando patrones y desequilibrios.
 */

import React, { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Radar as RadarIcon, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useThemeConfiguration } from '@/core/state';

interface DimensionalAnalysisChartProps {
  currentData: {
    waterLevel: number;
    flowRate: number;
    velocity: number;
    temperature: number;
    pH: number;
    dissolvedOxygen: number;
    turbidity: number;
  };
  historicalAverage?: {
    waterLevel: number;
    flowRate: number;
    velocity: number;
    temperature: number;
    pH: number;
    dissolvedOxygen: number;
    turbidity: number;
  };
  className?: string;
}

export const DimensionalAnalysisChart: React.FC<DimensionalAnalysisChartProps> = ({
  currentData,
  historicalAverage,
  className = ''
}) => {
  const theme = useThemeConfiguration();

  // 🎯 Configuración de parámetros normalizados
  const parameterConfig = useMemo(() => ({
    waterLevel: {
      label: 'Nivel del Agua',
      min: 0,
      max: 5,
      optimal: 2.5,
      unit: 'm'
    },
    flowRate: {
      label: 'Caudal',
      min: 50,
      max: 300,
      optimal: 175,
      unit: 'm³/s'
    },
    velocity: {
      label: 'Velocidad',
      min: 0.5,
      max: 4,
      optimal: 2.2,
      unit: 'm/s'
    },
    temperature: {
      label: 'Temperatura',
      min: 0,
      max: 25,
      optimal: 12,
      unit: '°C'
    },
    pH: {
      label: 'pH',
      min: 6,
      max: 8.5,
      optimal: 7.2,
      unit: ''
    },
    dissolvedOxygen: {
      label: 'Oxígeno Disuelto',
      min: 5,
      max: 12,
      optimal: 9,
      unit: 'mg/L'
    },
    turbidity: {
      label: 'Turbidez',
      min: 0,
      max: 15,
      optimal: 3,
      unit: 'NTU',
      inverted: true // Menor es mejor
    }
  }), []);

  // 🧮 Normalización de datos para el radar
  const normalizeValue = (value: number, config: any): number => {
    const normalized = ((value - config.min) / (config.max - config.min)) * 100;
    // Para parámetros invertidos (como turbidez), invertir la escala
    return config.inverted ? 100 - Math.max(0, Math.min(100, normalized)) : Math.max(0, Math.min(100, normalized));
  };

  const radarData = useMemo(() => {
    const parameters = Object.keys(parameterConfig);
    
    return parameters.map(param => {
      const config = parameterConfig[param as keyof typeof parameterConfig];
      const currentValue = currentData[param as keyof typeof currentData];
      const historicalValue = historicalAverage?.[param as keyof typeof historicalAverage];
      const optimalValue = config.optimal;

      return {
        parameter: config.label,
        current: normalizeValue(currentValue, config),
        historical: historicalValue ? normalizeValue(historicalValue, config) : null,
        optimal: normalizeValue(optimalValue, config),
        actualCurrent: currentValue,
        actualHistorical: historicalValue,
        actualOptimal: optimalValue,
        unit: config.unit,
        fullMark: 100
      };
    });
  }, [currentData, historicalAverage, parameterConfig]);

  // 📊 Análisis de desviación del óptimo
  const deviationAnalysis = useMemo(() => {
    const deviations = radarData.map(item => {
      const deviation = Math.abs(item.current - item.optimal);
      return {
        parameter: item.parameter,
        deviation,
        isWithinRange: deviation <= 15 // 15% de tolerancia
      };
    });

    const averageDeviation = deviations.reduce((sum, item) => sum + item.deviation, 0) / deviations.length;
    const parametersInRange = deviations.filter(item => item.isWithinRange).length;
    
    return {
      averageDeviation: Math.round(averageDeviation * 10) / 10,
      parametersInRange,
      totalParameters: deviations.length,
      overallScore: Math.max(0, 100 - averageDeviation),
      status: averageDeviation <= 10 ? 'excellent' : 
              averageDeviation <= 20 ? 'good' : 
              averageDeviation <= 35 ? 'fair' : 'poor'
    };
  }, [radarData]);

  // 🎨 Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = radarData.find(item => item.parameter === label);
    if (!data) return null;

    return (
      <div className={`
        p-3 rounded-lg border shadow-lg
        ${theme.charts.tooltipBg === '#ffffff' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'}
      `}>
        <p className="font-medium text-sm mb-2" style={{ color: theme.charts.textColor }}>
          {label}
        </p>
        
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span style={{ color: theme.colors.primary }}>Actual:</span>
            <strong>{data.actualCurrent.toFixed(1)} {data.unit}</strong>
          </div>
          
          {data.actualHistorical && (
            <div className="flex items-center justify-between">
              <span style={{ color: theme.colors.secondary }}>Promedio:</span>
              <strong>{data.actualHistorical.toFixed(1)} {data.unit}</strong>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span style={{ color: theme.colors.success }}>Óptimo:</span>
            <strong>{data.actualOptimal.toFixed(1)} {data.unit}</strong>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Desviación:</span>
            <strong className={Math.abs(data.current - data.optimal) <= 15 ? 'text-green-500' : 'text-yellow-500'}>
              {Math.abs(data.current - data.optimal).toFixed(1)}%
            </strong>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
              <RadarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span>Análisis Dimensional</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={deviationAnalysis.status === 'excellent' ? 'default' : 'secondary'}
              className="text-xs"
            >
              Score: {Math.round(deviationAnalysis.overallScore)}%
            </Badge>
            <Badge 
              variant={deviationAnalysis.parametersInRange >= 5 ? 'default' : 'secondary'}
              className="text-xs flex items-center space-x-1"
            >
              {deviationAnalysis.parametersInRange >= 5 ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              <span>{deviationAnalysis.parametersInRange}/{deviationAnalysis.totalParameters} óptimos</span>
            </Badge>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Comparación multidimensional de parámetros • Desviación promedio: {deviationAnalysis.averageDeviation}%
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid 
                stroke={theme.charts.gridColor}
                opacity={0.3}
              />
              
              <PolarAngleAxis 
                dataKey="parameter"
                tick={{ 
                  fontSize: 11, 
                  fill: theme.charts.textColor 
                }}
                className="text-xs"
              />
              
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ 
                  fontSize: 10, 
                  fill: theme.charts.textColor 
                }}
                tickCount={5}
              />

              {/* Área óptima de referencia */}
              <Radar
                name="Rango Óptimo"
                dataKey="optimal"
                stroke={theme.colors.success}
                fill={theme.colors.success}
                fillOpacity={0.1}
                strokeWidth={1}
                strokeDasharray="5 5"
              />

              {/* Promedio histórico */}
              {historicalAverage && (
                <Radar
                  name="Promedio Histórico"
                  dataKey="historical"
                  stroke={theme.colors.secondary}
                  fill={theme.colors.secondary}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              )}

              {/* Valores actuales */}
              <Radar
                name="Valores Actuales"
                dataKey="current"
                stroke={theme.colors.primary}
                fill={theme.colors.primary}
                fillOpacity={0.3}
                strokeWidth={3}
              />

              <Legend
                wrapperStyle={{ 
                  color: theme.charts.textColor,
                  fontSize: '12px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Análisis de estado */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {Math.round(deviationAnalysis.overallScore)}%
            </div>
            <div className="text-xs text-muted-foreground">Score General</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {deviationAnalysis.parametersInRange}
            </div>
            <div className="text-xs text-muted-foreground">Parámetros Óptimos</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
            <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {deviationAnalysis.averageDeviation.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Desviación Media</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400 capitalize">
              {deviationAnalysis.status === 'excellent' ? 'Excelente' :
               deviationAnalysis.status === 'good' ? 'Bueno' :
               deviationAnalysis.status === 'fair' ? 'Regular' : 'Deficiente'}
            </div>
            <div className="text-xs text-muted-foreground">Estado General</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
