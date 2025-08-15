/**
 * 📊 Análisis Multiescala - Nivel del Agua vs Precipitación
 * 
 * Gráfico combinado que revela la correlación entre precipitación y nivel del agua.
 * Utiliza dos ejes Y independientes para manejar diferentes escalas de medición.
 */

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, CloudRain, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useThemeConfiguration } from '@/core/state';

interface MultiScaleAnalysisChartProps {
  data: Array<{
    time: string;
    waterLevel: number;
    precipitation: number;
    timestamp: string;
  }>;
  className?: string;
}

export const MultiScaleAnalysisChart: React.FC<MultiScaleAnalysisChartProps> = ({
  data,
  className = ''
}) => {
  const theme = useThemeConfiguration();

  // 🧮 Análisis de Correlación entre Precipitación y Nivel
  const correlationAnalysis = useMemo(() => {
    if (data.length < 2) return { correlation: 0, trend: 'stable' as const };

    // Calcular correlación de Pearson
    const n = data.length;
    const precipValues = data.map(d => d.precipitation);
    const levelValues = data.map(d => d.waterLevel);

    const meanPrecip = precipValues.reduce((a, b) => a + b, 0) / n;
    const meanLevel = levelValues.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomPrecip = 0;
    let denomLevel = 0;

    for (let i = 0; i < n; i++) {
      const precipDiff = precipValues[i] - meanPrecip;
      const levelDiff = levelValues[i] - meanLevel;
      
      numerator += precipDiff * levelDiff;
      denomPrecip += precipDiff * precipDiff;
      denomLevel += levelDiff * levelDiff;
    }

    const correlation = denomPrecip === 0 || denomLevel === 0 
      ? 0 
      : numerator / Math.sqrt(denomPrecip * denomLevel);

    // Análisis de tendencia del nivel del agua
    const recentLevels = levelValues.slice(-10); // Últimos 10 puntos
    const levelTrend = recentLevels.length > 1
      ? recentLevels[recentLevels.length - 1] > recentLevels[0] ? 'increasing' : 'decreasing'
      : 'stable';

    return {
      correlation: Math.round(correlation * 1000) / 1000,
      trend: levelTrend,
      maxPrecipitation: Math.max(...precipValues),
      maxWaterLevel: Math.max(...levelValues),
      avgWaterLevel: Math.round(meanLevel * 100) / 100
    };
  }, [data]);

  // 🎨 Tooltip Personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const waterLevelData = payload.find((p: any) => p.dataKey === 'waterLevel');
    const precipitationData = payload.find((p: any) => p.dataKey === 'precipitation');

    return (
      <div className={`
        p-4 rounded-lg border shadow-lg
        ${theme.charts.tooltipBg === '#ffffff' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'}
      `}>
        <p className="font-medium text-sm mb-2" style={{ color: theme.charts.textColor }}>
          {new Date(label).toLocaleString('es-CL', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        
        {waterLevelData && (
          <div className="flex items-center space-x-2 mb-1">
            <Droplets className="h-3 w-3 text-blue-500" />
            <span className="text-xs" style={{ color: theme.charts.textColor }}>
              Nivel: <strong>{waterLevelData.value.toFixed(2)} m</strong>
            </span>
          </div>
        )}
        
        {precipitationData && precipitationData.value > 0 && (
          <div className="flex items-center space-x-2">
            <CloudRain className="h-3 w-3 text-cyan-500" />
            <span className="text-xs" style={{ color: theme.charts.textColor }}>
              Precipitación: <strong>{precipitationData.value.toFixed(1)} mm</strong>
            </span>
          </div>
        )}
      </div>
    );
  };

  // 🎯 Formateo del Eje X
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Análisis Multiescala</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Correlación: {correlationAnalysis.correlation.toFixed(3)}
            </Badge>
            <Badge 
              variant={correlationAnalysis.trend === 'increasing' ? 'default' : 'secondary'}
              className="text-xs flex items-center space-x-1"
            >
              {correlationAnalysis.trend === 'increasing' ? (
                <TrendingUp className="h-3 w-3" />
              ) : correlationAnalysis.trend === 'decreasing' ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              <span className="capitalize">{correlationAnalysis.trend}</span>
            </Badge>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Nivel del agua vs precipitación acumulada • Promedio: {correlationAnalysis.avgWaterLevel} m
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.charts.gridColor}
                opacity={0.3}
              />
              
              <XAxis
                dataKey="time"
                tickFormatter={formatXAxis}
                stroke={theme.charts.textColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              
              {/* Eje Y izquierdo - Nivel del agua */}
              <YAxis
                yAxisId="waterLevel"
                orientation="left"
                stroke={theme.colors.primary}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: 'Nivel (m)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: theme.colors.primary }
                }}
              />
              
              {/* Eje Y derecho - Precipitación */}
              <YAxis
                yAxisId="precipitation"
                orientation="right"
                stroke={theme.colors.secondary}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: 'Precipitación (mm)', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { textAnchor: 'middle', fill: theme.colors.secondary }
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend
                wrapperStyle={{ color: theme.charts.textColor }}
                iconType="line"
              />
              
              {/* Barras de precipitación */}
              <Bar
                yAxisId="precipitation"
                dataKey="precipitation"
                fill={theme.colors.secondary}
                fillOpacity={0.6}
                name="Precipitación (mm)"
                radius={[2, 2, 0, 0]}
              />
              
              {/* Línea de nivel del agua */}
              <Line
                yAxisId="waterLevel"
                type="monotone"
                dataKey="waterLevel"
                stroke={theme.colors.primary}
                strokeWidth={2}
                dot={{ fill: theme.colors.primary, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, stroke: theme.colors.primary, strokeWidth: 2 }}
                name="Nivel del agua (m)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Estadísticas adicionales */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {correlationAnalysis.maxWaterLevel.toFixed(2)}m
            </div>
            <div className="text-xs text-muted-foreground">Nivel máximo</div>
          </div>
          
          <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950">
            <div className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
              {correlationAnalysis.maxPrecipitation.toFixed(1)}mm
            </div>
            <div className="text-xs text-muted-foreground">Precipitación máxima</div>
          </div>
          
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {Math.abs(correlationAnalysis.correlation) > 0.5 ? 'Fuerte' : 
               Math.abs(correlationAnalysis.correlation) > 0.3 ? 'Moderada' : 'Débil'}
            </div>
            <div className="text-xs text-muted-foreground">Correlación</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
