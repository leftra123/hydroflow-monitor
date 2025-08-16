/**
 * 📊 Tooltip Informativo para Métricas
 * 
 * Componente que muestra explicaciones técnicas detalladas
 * para ayudar a operadores a entender los valores mostrados
 */

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { METRIC_EXPLANATIONS, getContextualExplanation } from '@/constants/technicalExplanations';

interface MetricTooltipProps {
  parameter: string;
  value: number;
  trend?: 'rising' | 'falling' | 'stable';
  children: React.ReactNode;
  showIcon?: boolean;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({
  parameter,
  value,
  trend = 'stable',
  children,
  showIcon = true
}) => {
  const explanation = METRIC_EXPLANATIONS[parameter];
  
  if (!explanation) {
    return <>{children}</>;
  }

  // Determinar estado del valor
  const getValueStatus = () => {
    const normalRange = explanation.normalRange;
    const criticalThreshold = explanation.criticalThreshold;
    
    // Extraer números del rango normal (formato: "1.5 - 2.5 metros")
    const rangeMatch = normalRange.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      
      if (value >= min && value <= max) {
        return { status: 'normal', color: 'text-green-600', icon: <CheckCircle className="w-3 h-3" /> };
      } else if (value > max) {
        return { status: 'high', color: 'text-yellow-600', icon: <AlertTriangle className="w-3 h-3" /> };
      } else {
        return { status: 'low', color: 'text-blue-600', icon: <Info className="w-3 h-3" /> };
      }
    }
    
    return { status: 'unknown', color: 'text-gray-600', icon: <Info className="w-3 h-3" /> };
  };

  const valueStatus = getValueStatus();
  const contextualExplanation = getContextualExplanation(parameter, value, trend);

  const getTrendIcon = () => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendText = () => {
    switch (trend) {
      case 'rising': return 'SUBIENDO';
      case 'falling': return 'BAJANDO';
      case 'stable': return 'ESTABLE';
      default: return 'SIN DATOS';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'rising': return 'text-red-600';
      case 'falling': return 'text-green-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="relative cursor-help">
            {children}
            {showIcon && (
              <div className="absolute -top-1 -right-1">
                <div className={`${valueStatus.color}`}>
                  {valueStatus.icon}
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-sm p-4 bg-card border border-border shadow-lg"
        >
          <div className="space-y-3">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-card-foreground">
                {explanation.parameter}
              </h4>
              <Badge 
                variant={valueStatus.status === 'normal' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {valueStatus.status === 'normal' ? 'NORMAL' : 
                 valueStatus.status === 'high' ? 'ALTO' : 
                 valueStatus.status === 'low' ? 'BAJO' : 'REVISAR'}
              </Badge>
            </div>

            {/* Valor actual y tendencia */}
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div>
                <span className="text-lg font-bold text-card-foreground">
                  {value.toFixed(2)} {explanation.unit}
                </span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
                <span>{getTrendIcon()}</span>
                <span>{getTrendText()}</span>
              </div>
            </div>

            {/* Información técnica */}
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Rango Normal:</span>
                <div className="text-card-foreground">{explanation.normalRange}</div>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">Significado:</span>
                <div className="text-card-foreground">{explanation.meaning}</div>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">Umbral Crítico:</span>
                <div className="text-red-600 font-medium">{explanation.criticalThreshold}</div>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">Acción Requerida:</span>
                <div className="text-card-foreground">{explanation.actionRequired}</div>
              </div>

              <div>
                <span className="font-medium text-muted-foreground">Contexto:</span>
                <div className="text-card-foreground text-xs">{explanation.context}</div>
              </div>
            </div>

            {/* Indicadores de estado */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Normal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Precaución</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Crítico</span>
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
