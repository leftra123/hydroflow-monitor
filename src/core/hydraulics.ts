/**
 * 🧮 Motor de Cálculos Hidráulicos
 * 
 * Funciones puras que implementan las leyes fundamentales de la hidráulica.
 * Cada función es determinística, sin efectos secundarios, y matemáticamente precisa.
 */

import {
  FlowRate,
  WaterVelocity,
  WaterLevel,
  Temperature,
  HydraulicCalculations,
  HYDROLOGICAL_CONSTANTS
} from '@/types/hydrology';

// 🌊 Cálculo del Número de Reynolds - Ley de la Dinámica de Fluidos
export const calculateReynoldsNumber = (
  velocity: WaterVelocity,
  hydraulicDiameter: number,
  kinematicViscosity: number = HYDROLOGICAL_CONSTANTS.KINEMATIC_VISCOSITY
): number => {
  if (velocity <= 0 || hydraulicDiameter <= 0 || kinematicViscosity <= 0) {
    return 0;
  }
  
  return (velocity * hydraulicDiameter) / kinematicViscosity;
};

// 🏔️ Cálculo del Número de Froude - Ley de la Gravedad en Flujos
export const calculateFroudeNumber = (
  velocity: WaterVelocity,
  waterDepth: WaterLevel
): number => {
  if (velocity <= 0 || waterDepth <= 0) {
    return 0;
  }
  
  return velocity / Math.sqrt(HYDROLOGICAL_CONSTANTS.GRAVITY * waterDepth);
};

// ⚡ Ecuación de Bernoulli - Conservación de la Energía
export const calculateBernoulliVelocity = (
  flowRate: FlowRate,
  crossSectionalArea: number
): number => {
  if (flowRate <= 0 || crossSectionalArea <= 0) {
    return 0;
  }
  
  return flowRate / crossSectionalArea;
};

// 🌀 Determinación del Régimen de Flujo
export const determineFlowRegime = (reynoldsNumber: number): 'laminar' | 'transitional' | 'turbulent' => {
  if (reynoldsNumber < HYDROLOGICAL_CONSTANTS.REYNOLDS_LAMINAR_THRESHOLD) {
    return 'laminar';
  } else if (reynoldsNumber < HYDROLOGICAL_CONSTANTS.REYNOLDS_TURBULENT_THRESHOLD) {
    return 'transitional';
  } else {
    return 'turbulent';
  }
};

// 🏞️ Determinación del Tipo de Flujo según Froude
export const determineFlowType = (froudeNumber: number): 'subcritical' | 'critical' | 'supercritical' => {
  if (froudeNumber < 0.9) {
    return 'subcritical';
  } else if (froudeNumber <= 1.1) {
    return 'critical';
  } else {
    return 'supercritical';
  }
};

// 🧮 Cálculo de Área Transversal Aproximada (Canal Rectangular)
export const calculateCrossSectionalArea = (
  width: number,
  depth: WaterLevel
): number => {
  if (width <= 0 || depth <= 0) {
    return 0;
  }
  
  return width * depth;
};

// 📐 Cálculo del Diámetro Hidráulico
export const calculateHydraulicDiameter = (
  area: number,
  wettedPerimeter: number
): number => {
  if (area <= 0 || wettedPerimeter <= 0) {
    return 0;
  }
  
  return (4 * area) / wettedPerimeter;
};

// 🌡️ Corrección de Viscosidad por Temperatura
export const adjustViscosityForTemperature = (
  baseViscosity: number,
  temperature: Temperature
): number => {
  // Fórmula de Andrade para la viscosidad del agua
  const referenceTemp = 20; // °C
  const tempDiff = temperature - referenceTemp;
  
  // Aproximación exponencial para cambios de viscosidad
  return baseViscosity * Math.exp(-0.025 * tempDiff);
};

// 🎯 Función Principal de Cálculos Hidráulicos - Composición Pura
export const computeHydraulicCalculations = (
  flowRate: FlowRate,
  velocity: WaterVelocity,
  waterLevel: WaterLevel,
  temperature: Temperature,
  channelWidth: number = 15 // metros, ancho promedio del Río Claro
): HydraulicCalculations => {
  // Cálculos geométricos
  const crossSectionalArea = calculateCrossSectionalArea(channelWidth, waterLevel);
  const wettedPerimeter = channelWidth + (2 * waterLevel);
  const hydraulicDiameter = calculateHydraulicDiameter(crossSectionalArea, wettedPerimeter);
  
  // Corrección de viscosidad por temperatura
  const adjustedViscosity = adjustViscosityForTemperature(
    HYDROLOGICAL_CONSTANTS.KINEMATIC_VISCOSITY,
    temperature
  );
  
  // Cálculos hidráulicos fundamentales
  const reynoldsNumber = calculateReynoldsNumber(velocity, hydraulicDiameter, adjustedViscosity);
  const froudeNumber = calculateFroudeNumber(velocity, waterLevel);
  const bernoulliVelocity = calculateBernoulliVelocity(flowRate, crossSectionalArea);
  
  // Determinación de regímenes
  const flowRegime = determineFlowRegime(reynoldsNumber);
  const flowType = determineFlowType(froudeNumber);
  
  return {
    reynoldsNumber: Math.round(reynoldsNumber * 100) / 100,
    froudeNumber: Math.round(froudeNumber * 1000) / 1000,
    bernoulliVelocity: Math.round(bernoulliVelocity * 100) / 100,
    flowRegime,
    flowType
  };
};

// 📊 Análisis de Tendencias - Función Pura para Series Temporales
export const analyzeTrend = (values: readonly number[]): 'increasing' | 'decreasing' | 'stable' => {
  if (values.length < 2) return 'stable';
  
  let increases = 0;
  let decreases = 0;
  
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (Math.abs(diff) < 0.01) continue; // Umbral de estabilidad
    
    if (diff > 0) increases++;
    else decreases++;
  }
  
  const totalChanges = increases + decreases;
  if (totalChanges === 0) return 'stable';
  
  const increaseRatio = increases / totalChanges;
  
  if (increaseRatio > 0.6) return 'increasing';
  if (increaseRatio < 0.4) return 'decreasing';
  return 'stable';
};

// 🎨 Cálculo de Color Dinámico basado en Valores
export const calculateStatusColor = (
  value: number,
  min: number,
  max: number,
  optimal: number
): string => {
  const normalizedValue = (value - min) / (max - min);
  const optimalNormalized = (optimal - min) / (max - min);
  
  const distance = Math.abs(normalizedValue - optimalNormalized);
  
  if (distance < 0.1) return '#10b981'; // Verde - Óptimo
  if (distance < 0.3) return '#3b82f6'; // Azul - Normal
  if (distance < 0.5) return '#f59e0b'; // Amarillo - Advertencia
  return '#ef4444'; // Rojo - Crítico
};

// 🌊 Simulación de Comportamiento Hidrológico Realista
export const generateRealisticHydrologicalPattern = (
  baseValue: number,
  timeIndex: number,
  seasonalAmplitude: number = 0.2,
  dailyAmplitude: number = 0.1,
  noiseLevel: number = 0.05
): number => {
  // Patrón estacional (anual)
  const seasonalPattern = Math.sin((timeIndex / 365) * 2 * Math.PI) * seasonalAmplitude;
  
  // Patrón diario
  const dailyPattern = Math.sin((timeIndex / 24) * 2 * Math.PI) * dailyAmplitude;
  
  // Ruido aleatorio
  const noise = (Math.random() - 0.5) * noiseLevel;
  
  // Tendencia a largo plazo (muy sutil)
  const longTermTrend = (timeIndex / 8760) * 0.02; // 0.02 por año
  
  return baseValue * (1 + seasonalPattern + dailyPattern + noise + longTermTrend);
};

// 🎯 Validación de Coherencia Hidráulica
export const validateHydraulicCoherence = (
  flowRate: FlowRate,
  velocity: WaterVelocity,
  waterLevel: WaterLevel,
  channelWidth: number = 15
): boolean => {
  const expectedArea = calculateCrossSectionalArea(channelWidth, waterLevel);
  const expectedVelocity = flowRate / expectedArea;
  
  // Tolerancia del 10% para variaciones naturales
  const tolerance = 0.1;
  const velocityDifference = Math.abs(velocity - expectedVelocity) / expectedVelocity;
  
  return velocityDifference <= tolerance;
};
