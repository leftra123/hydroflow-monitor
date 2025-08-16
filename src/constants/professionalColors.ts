/**
 * 🎨 Professional Hydrological Color System
 * 
 * Color schemes following international standards:
 * - WMO (World Meteorological Organization)
 * - DGA Chile (Dirección General de Aguas)
 * - NCh 1333 (Chilean Water Quality Standards)
 * - ISO 14688 (Geotechnical Investigation)
 */

import { AlertSeverity, DataQuality } from '@/types/sensors';

// 🌊 WATER LEVEL COLORS (WMO Standard Blues)
export const WATER_LEVEL_COLORS = {
  primary: '#1e40af',      // Deep navy blue
  secondary: '#2563eb',    // Royal blue
  light: '#3b82f6',       // Medium blue
  gradient: ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa'],
  chart: {
    stroke: '#1e40af',
    fill: 'url(#waterLevelGradient)',
    strokeWidth: 3,
    opacity: 0.8
  },
  thresholds: {
    normal: '#22c55e',     // Green
    warning: '#f59e0b',    // Amber
    critical: '#ef4444',   // Red
    emergency: '#dc2626'   // Dark red
  }
} as const;

// 🌧️ PRECIPITATION COLORS (Meteorological Standard Greens)
export const PRECIPITATION_COLORS = {
  primary: '#059669',      // Emerald green
  secondary: '#10b981',    // Green
  light: '#34d399',       // Light green
  gradient: ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'],
  chart: {
    stroke: '#10b981',
    fill: 'rgba(16, 185, 129, 0.6)',
    strokeWidth: 0,
    opacity: 0.7
  },
  intensity: {
    light: '#bbf7d0',      // 0-2 mm/h
    moderate: '#86efac',   // 2-10 mm/h
    heavy: '#4ade80',      // 10-20 mm/h
    intense: '#22c55e',    // 20-30 mm/h
    extreme: '#16a34a'     // >30 mm/h
  }
} as const;

// 🌊 FLOW RATE COLORS (Distinct Purple Scale)
export const FLOW_RATE_COLORS = {
  primary: '#7c3aed',      // Purple
  secondary: '#8b5cf6',    // Violet
  light: '#a78bfa',       // Lavender
  gradient: ['#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'],
  chart: {
    stroke: '#7c3aed',
    fill: 'rgba(124, 58, 237, 0.4)',
    strokeWidth: 2,
    opacity: 0.6
  }
} as const;

// 🌡️ TEMPERATURE COLORS (Scientific Thermal Scale)
export const TEMPERATURE_COLORS = {
  cold: '#0891b2',        // Cyan (< 5°C)
  cool: '#06b6d4',        // Light cyan (5-10°C)
  normal: '#f59e0b',      // Amber (10-15°C)
  warm: '#ea580c',        // Orange (15-20°C)
  hot: '#dc2626',         // Red (> 20°C)
  gradient: ['#0891b2', '#06b6d4', '#f59e0b', '#ea580c', '#dc2626'],
  chart: {
    stroke: '#f59e0b',
    fill: 'rgba(245, 158, 11, 0.3)',
    strokeWidth: 2,
    opacity: 0.5
  }
} as const;

// 💧 WATER QUALITY COLORS (NCh 1333 Standard)
export const WATER_QUALITY_COLORS = {
  excellent: '#10b981',   // Green (Clase Excepcional)
  good: '#3b82f6',       // Blue (Clase I)
  fair: '#f59e0b',       // Yellow (Clase II)
  poor: '#ef4444',       // Red (Clase III)
  critical: '#7c2d12',   // Brown (Clase IV)
  chart: {
    stroke: '#10b981',
    fill: 'rgba(16, 185, 129, 0.5)',
    strokeWidth: 2,
    opacity: 0.6
  }
} as const;

// 🌋 CONDUCTIVITY COLORS (Volcanic Activity Monitoring)
export const CONDUCTIVITY_COLORS = {
  primary: '#f97316',     // Orange (volcanic activity)
  secondary: '#fb923c',   // Light orange
  light: '#fed7aa',      // Very light orange
  gradient: ['#ea580c', '#f97316', '#fb923c', '#fed7aa', '#ffedd5'],
  chart: {
    stroke: '#f97316',
    fill: 'rgba(249, 115, 22, 0.4)',
    strokeWidth: 2,
    opacity: 0.5
  },
  volcanic: {
    baseline: '#22c55e',   // Normal (green)
    elevated: '#f59e0b',   // Elevated (amber)
    high: '#ef4444',       // High (red)
    critical: '#dc2626'    // Critical (dark red)
  }
} as const;

// 🚨 ALERT SEVERITY COLORS (Emergency Response Standard)
export const ALERT_COLORS: Record<AlertSeverity, string> = {
  [AlertSeverity.NORMAL]: '#22c55e',     // Green
  [AlertSeverity.WARNING]: '#f59e0b',    // Amber
  [AlertSeverity.CRITICAL]: '#ef4444',   // Red
  [AlertSeverity.EMERGENCY]: '#dc2626'   // Dark red
} as const;

// 📊 DATA QUALITY COLORS (ISO Standards)
export const DATA_QUALITY_COLORS: Record<DataQuality, string> = {
  [DataQuality.EXCELLENT]: '#22c55e',    // Green
  [DataQuality.GOOD]: '#3b82f6',        // Blue
  [DataQuality.FAIR]: '#f59e0b',        // Amber
  [DataQuality.POOR]: '#ef4444',        // Red
  [DataQuality.CRITICAL]: '#dc2626',    // Dark red
  [DataQuality.INVALID]: '#6b7280'      // Gray
} as const;

// 🎯 THRESHOLD VISUALIZATION COLORS
export const THRESHOLD_COLORS = {
  normal: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '#22c55e',
    text: '#166534'
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: '#f59e0b',
    text: '#92400e'
  },
  critical: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '#ef4444',
    text: '#991b1b'
  },
  emergency: {
    background: 'rgba(220, 38, 38, 0.1)',
    border: '#dc2626',
    text: '#7f1d1d'
  }
} as const;

// 🌈 GRADIENT DEFINITIONS FOR SVG
export const SVG_GRADIENTS = {
  waterLevel: {
    id: 'waterLevelGradient',
    stops: [
      { offset: '0%', color: '#1e40af', opacity: 0.8 },
      { offset: '50%', color: '#3b82f6', opacity: 0.6 },
      { offset: '100%', color: '#60a5fa', opacity: 0.2 }
    ]
  },
  precipitation: {
    id: 'precipitationGradient',
    stops: [
      { offset: '0%', color: '#059669', opacity: 0.7 },
      { offset: '100%', color: '#34d399', opacity: 0.3 }
    ]
  },
  flowRate: {
    id: 'flowRateGradient',
    stops: [
      { offset: '0%', color: '#7c3aed', opacity: 0.6 },
      { offset: '100%', color: '#a78bfa', opacity: 0.2 }
    ]
  },
  temperature: {
    id: 'temperatureGradient',
    stops: [
      { offset: '0%', color: '#0891b2', opacity: 0.6 },
      { offset: '25%', color: '#06b6d4', opacity: 0.5 },
      { offset: '50%', color: '#f59e0b', opacity: 0.4 },
      { offset: '75%', color: '#ea580c', opacity: 0.5 },
      { offset: '100%', color: '#dc2626', opacity: 0.6 }
    ]
  }
} as const;

// 🎨 UTILITY FUNCTIONS
export const getParameterColor = (parameter: string): string[] => {
  switch (parameter.toLowerCase()) {
    case 'waterlevel':
    case 'level':
      return [...WATER_LEVEL_COLORS.gradient];
    case 'precipitation':
    case 'rain':
      return [...PRECIPITATION_COLORS.gradient];
    case 'flowrate':
    case 'discharge':
      return [...FLOW_RATE_COLORS.gradient];
    case 'temperature':
      return [...TEMPERATURE_COLORS.gradient];
    case 'conductivity':
      return [...CONDUCTIVITY_COLORS.gradient];
    default:
      return [...WATER_LEVEL_COLORS.gradient];
  }
};

export const getAlertColor = (severity: AlertSeverity): string => {
  return ALERT_COLORS[severity];
};

export const getQualityColor = (quality: DataQuality): string => {
  return DATA_QUALITY_COLORS[quality];
};

export const getThresholdColor = (level: 'normal' | 'warning' | 'critical' | 'emergency') => {
  return THRESHOLD_COLORS[level];
};

// 🌡️ Temperature-based color selection
export const getTemperatureColor = (temperature: number): string => {
  if (temperature < 5) return TEMPERATURE_COLORS.cold;
  if (temperature < 10) return TEMPERATURE_COLORS.cool;
  if (temperature < 15) return TEMPERATURE_COLORS.normal;
  if (temperature < 20) return TEMPERATURE_COLORS.warm;
  return TEMPERATURE_COLORS.hot;
};

// 🌋 Conductivity-based volcanic activity color
export const getConductivityColor = (conductivity: number): string => {
  if (conductivity < 200) return CONDUCTIVITY_COLORS.volcanic.baseline;
  if (conductivity < 400) return CONDUCTIVITY_COLORS.volcanic.elevated;
  if (conductivity < 800) return CONDUCTIVITY_COLORS.volcanic.high;
  return CONDUCTIVITY_COLORS.volcanic.critical;
};

// 🌧️ Precipitation intensity color
export const getPrecipitationColor = (intensity: number): string => {
  if (intensity < 2) return PRECIPITATION_COLORS.intensity.light;
  if (intensity < 10) return PRECIPITATION_COLORS.intensity.moderate;
  if (intensity < 20) return PRECIPITATION_COLORS.intensity.heavy;
  if (intensity < 30) return PRECIPITATION_COLORS.intensity.intense;
  return PRECIPITATION_COLORS.intensity.extreme;
};

// 🎯 Chart configuration generator
export const getChartConfig = (parameter: string) => {
  switch (parameter.toLowerCase()) {
    case 'waterlevel':
      return WATER_LEVEL_COLORS.chart;
    case 'precipitation':
      return PRECIPITATION_COLORS.chart;
    case 'flowrate':
      return FLOW_RATE_COLORS.chart;
    case 'temperature':
      return TEMPERATURE_COLORS.chart;
    case 'conductivity':
      return CONDUCTIVITY_COLORS.chart;
    default:
      return WATER_LEVEL_COLORS.chart;
  }
};
