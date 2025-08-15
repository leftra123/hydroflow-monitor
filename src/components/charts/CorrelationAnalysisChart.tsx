/**
 * 🔬 Análisis Correlacional - Caudal vs Velocidad
 * 
 * Gráfico de dispersión que revela la relación hidráulica fundamental
 * entre el caudal y la velocidad del río, detectando anomalías.
 */

import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { useThemeConfiguration } from '@/core/state';

interface CorrelationAnalysisChartProps {
  data: Array<{
    time: string;
    flowRate: number;
    velocity: number;
    waterLevel: number;
    timestamp: string;
  }>;
  className?: string;
}

export const CorrelationAnalysisChart: React.FC<CorrelationAnalysisChartProps> = ({
  data,
  className = ''
}) => {
  const theme = useThemeConfiguration();

  // 🧮 Análisis Estadístico Avanzado
  const statisticalAnalysis = useMemo(() => {
    if (data.length < 3) return null;

    const flowRates = data.map(d => d.flowRate);
    const velocities = data.map(d => d.velocity);
    const n = data.length;

    // Cálculo de correlación de Pearson
    const meanFlow = flowRates.reduce((a, b) => a + b, 0) / n;
    const meanVelocity = velocities.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomFlow = 0;
    let denomVelocity = 0;

    for (let i = 0; i < n; i++) {
      const flowDiff = flowRates[i] - meanFlow;
      const velocityDiff = velocities[i] - meanVelocity;
      
      numerator += flowDiff * velocityDiff;
      denomFlow += flowDiff * flowDiff;
      denomVelocity += velocityDiff * velocityDiff;
    }

    const correlation = denomFlow === 0 || denomVelocity === 0 
      ? 0 
      : numerator / Math.sqrt(denomFlow * denomVelocity);

    // Regresión lineal simple
    const slope = denomFlow === 0 ? 0 : numerator / denomFlow;
    const intercept = meanVelocity - slope * meanFlow;

    // Coeficiente de determinación (R²)
    const rSquared = correlation * correlation;

    // Detección de anomalías (puntos fuera de 2 desviaciones estándar)
    const residuals = data.map(d => d.velocity - (slope * d.flowRate + intercept));
    const meanResidual = residuals.reduce((a, b) => a + b, 0) / n;
    const stdResidual = Math.sqrt(
      residuals.reduce((sum, r) => sum + Math.pow(r - meanResidual, 2), 0) / n
    );

    const anomalies = data.filter((d, i) => 
      Math.abs(residuals[i] - meanResidual) > 2 * stdResidual
    );

    return {
      correlation: Math.round(correlation * 1000) / 1000,
      rSquared: Math.round(rSquared * 1000) / 1000,
      slope: Math.round(slope * 10000) / 10000,
      intercept: Math.round(intercept * 100) / 100,
      anomalies: anomalies.length,
      totalPoints: n,
      equation: `v = ${slope.toFixed(4)}Q + ${intercept.toFixed(2)}`,
      residualStd: Math.round(stdResidual * 1000) / 1000
    };
  }, [data]);

  // 🎨 Preparación de datos para el scatter plot
  const scatterData = useMemo(() => {
    if (!statisticalAnalysis) return [];

    return data.map((point, index) => {
      const predicted = statisticalAnalysis.slope * point.flowRate + statisticalAnalysis.intercept;
      const residual = point.velocity - predicted;
      const isAnomaly = Math.abs(residual) > 2 * statisticalAnalysis.residualStd;

      return {
        x: point.flowRate,
        y: point.velocity,
        waterLevel: point.waterLevel,
        time: point.time,
        predicted,
        residual: Math.round(residual * 1000) / 1000,
        isAnomaly,
        index
      };
    });
  }, [data, statisticalAnalysis]);

  // 🎯 Tooltip Personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className={`
        p-4 rounded-lg border shadow-lg
        ${theme.charts.tooltipBg === '#ffffff' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'}
      `}>
        <p className="font-medium text-sm mb-2" style={{ color: theme.charts.textColor }}>
          {new Date(data.time).toLocaleString('es-CL', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span style={{ color: theme.charts.textColor }}>Caudal:</span>
            <strong style={{ color: theme.colors.primary }}>{data.x.toFixed(1)} m³/s</strong>
          </div>
          
          <div className="flex items-center justify-between">
            <span style={{ color: theme.charts.textColor }}>Velocidad:</span>
            <strong style={{ color: theme.colors.secondary }}>{data.y.toFixed(2)} m/s</strong>
          </div>
          
          <div className="flex items-center justify-between">
            <span style={{ color: theme.charts.textColor }}>Nivel:</span>
            <strong>{data.waterLevel.toFixed(2)} m</strong>
          </div>
          
          <div className="flex items-center justify-between">
            <span style={{ color: theme.charts.textColor }}>Predicción:</span>
            <strong>{data.predicted.toFixed(2)} m/s</strong>
          </div>
          
          <div className="flex items-center justify-between">
            <span style={{ color: theme.charts.textColor }}>Residual:</span>
            <strong className={data.isAnomaly ? 'text-red-500' : ''}>
              {data.residual > 0 ? '+' : ''}{data.residual.toFixed(3)}
            </strong>
          </div>
          
          {data.isAnomaly && (
            <div className="flex items-center space-x-1 text-red-500 mt-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Anomalía detectada</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!statisticalAnalysis) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-80">
          <div className="text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Datos insuficientes para análisis correlacional</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span>Análisis Correlacional</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              R² = {statisticalAnalysis.rSquared.toFixed(3)}
            </Badge>
            <Badge 
              variant={statisticalAnalysis.anomalies > 0 ? 'destructive' : 'default'}
              className="text-xs flex items-center space-x-1"
            >
              {statisticalAnalysis.anomalies > 0 ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
              <span>{statisticalAnalysis.anomalies} anomalías</span>
            </Badge>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Caudal vs Velocidad • {statisticalAnalysis.equation}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.charts.gridColor}
                opacity={0.3}
              />
              
              <XAxis
                type="number"
                dataKey="x"
                name="Caudal"
                unit=" m³/s"
                stroke={theme.charts.textColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: 'Caudal (m³/s)', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fill: theme.charts.textColor }
                }}
              />
              
              <YAxis
                type="number"
                dataKey="y"
                name="Velocidad"
                unit=" m/s"
                stroke={theme.charts.textColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                label={{ 
                  value: 'Velocidad (m/s)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: theme.charts.textColor }
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Línea de regresión */}
              <ReferenceLine
                segment={[
                  { x: Math.min(...scatterData.map(d => d.x)), y: statisticalAnalysis.slope * Math.min(...scatterData.map(d => d.x)) + statisticalAnalysis.intercept },
                  { x: Math.max(...scatterData.map(d => d.x)), y: statisticalAnalysis.slope * Math.max(...scatterData.map(d => d.x)) + statisticalAnalysis.intercept }
                ]}
                stroke={theme.colors.warning}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              
              <Scatter
                name="Mediciones"
                data={scatterData}
                fill={theme.colors.primary}
              >
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isAnomaly ? theme.colors.danger : theme.colors.primary}
                    fillOpacity={entry.isAnomaly ? 0.8 : 0.6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Estadísticas del análisis */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {statisticalAnalysis.correlation.toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">Correlación</div>
          </div>
          
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {(statisticalAnalysis.rSquared * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Varianza explicada</div>
          </div>
          
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
            <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              {statisticalAnalysis.anomalies}
            </div>
            <div className="text-xs text-muted-foreground">Anomalías</div>
          </div>
          
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {statisticalAnalysis.residualStd.toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">Desv. residual</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
