/**
 * 🌊 Tipos Hidrológicos Inmutables
 * 
 * Definiciones de tipos que representan la esencia pura de los datos hidrológicos.
 * Cada tipo es inmutable por diseño, protegiendo la integridad del estado.
 */

// 🎯 Tipos Primitivos Semánticamente Puros
export type StationId = string & { readonly __brand: 'StationId' };
export type Timestamp = string & { readonly __brand: 'Timestamp' };
export type WaterLevel = number & { readonly __brand: 'WaterLevel' };
export type FlowRate = number & { readonly __brand: 'FlowRate' };
export type WaterVelocity = number & { readonly __brand: 'WaterVelocity' };
export type Temperature = number & { readonly __brand: 'Temperature' };
export type pH = number & { readonly __brand: 'pH' };
export type DissolvedOxygen = number & { readonly __brand: 'DissolvedOxygen' };
export type Turbidity = number & { readonly __brand: 'Turbidity' };
export type Precipitation = number & { readonly __brand: 'Precipitation' };

// 🌊 Estados del Sistema Hidrológico
export const HydrologicalStatus = {
  OPTIMAL: 'optimal',
  NORMAL: 'normal', 
  WARNING: 'warning',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency'
} as const;

export type HydrologicalStatusType = typeof HydrologicalStatus[keyof typeof HydrologicalStatus];

// 📊 Rangos Temporales para Análisis
export const TimeRange = {
  REALTIME: '1h',
  DAILY: '24h',
  WEEKLY: '7d', 
  MONTHLY: '30d',
  YEARLY: '1y'
} as const;

export type TimeRangeType = typeof TimeRange[keyof typeof TimeRange];

// 🏭 Estación de Monitoreo - Entidad Inmutable
export interface HydrologyStation {
  readonly id: StationId;
  readonly name: string;
  readonly location: {
    readonly latitude: number;
    readonly longitude: number;
    readonly elevation: number;
    readonly riverKilometer: number;
  };
  readonly sensors: {
    readonly waterLevel: boolean;
    readonly flowRate: boolean;
    readonly velocity: boolean;
    readonly temperature: boolean;
    readonly pH: boolean;
    readonly dissolvedOxygen: boolean;
    readonly turbidity: boolean;
    readonly precipitation: boolean;
  };
  readonly status: HydrologicalStatusType;
  readonly lastUpdate: Timestamp;
}

// 📈 Medición Hidrológica - Snapshot Inmutable
export interface HydrologicalMeasurement {
  readonly timestamp: Timestamp;
  readonly stationId: StationId;
  readonly waterLevel: WaterLevel;
  readonly flowRate: FlowRate;
  readonly velocity: WaterVelocity;
  readonly temperature: Temperature;
  readonly pH: pH;
  readonly dissolvedOxygen: DissolvedOxygen;
  readonly turbidity: Turbidity;
  readonly precipitation: Precipitation;
  readonly pressure: number;
}

// 🧮 Cálculos Hidráulicos - Funciones Puras
export interface HydraulicCalculations {
  readonly reynoldsNumber: number;
  readonly froudeNumber: number;
  readonly bernoulliVelocity: number;
  readonly flowRegime: 'laminar' | 'transitional' | 'turbulent';
  readonly flowType: 'subcritical' | 'critical' | 'supercritical';
}

// 📊 Serie Temporal - Colección Inmutable
export interface HydrologicalTimeSeries {
  readonly stationId: StationId;
  readonly timeRange: TimeRangeType;
  readonly measurements: readonly HydrologicalMeasurement[];
  readonly statistics: {
    readonly min: HydrologicalMeasurement;
    readonly max: HydrologicalMeasurement;
    readonly average: Omit<HydrologicalMeasurement, 'timestamp' | 'stationId'>;
    readonly trend: 'increasing' | 'decreasing' | 'stable';
  };
}

// 🎨 Estado de la Aplicación - Arquitectura Inmutable
export interface ApplicationState {
  readonly theme: 'light' | 'dark';
  readonly selectedStation: StationId | null;
  readonly timeRange: TimeRangeType;
  readonly isRealTimeMode: boolean;
  readonly lastUpdate: Timestamp;
}

// 🔄 Acciones del Reducer - Eventos Puros
export const ActionType = {
  TOGGLE_THEME: 'TOGGLE_THEME',
  SELECT_STATION: 'SELECT_STATION',
  SET_TIME_RANGE: 'SET_TIME_RANGE',
  TOGGLE_REALTIME: 'TOGGLE_REALTIME',
  UPDATE_TIMESTAMP: 'UPDATE_TIMESTAMP'
} as const;

export type ActionTypeKeys = typeof ActionType[keyof typeof ActionType];

export interface AppAction {
  readonly type: ActionTypeKeys;
  readonly payload?: unknown;
}

// 🎯 Funciones de Construcción de Tipos (Type Constructors)
export const createStationId = (id: string): StationId => id as StationId;
export const createTimestamp = (date: Date): Timestamp => date.toISOString() as Timestamp;
export const createWaterLevel = (level: number): WaterLevel => level as WaterLevel;
export const createFlowRate = (rate: number): FlowRate => rate as FlowRate;
export const createWaterVelocity = (velocity: number): WaterVelocity => velocity as WaterVelocity;
export const createTemperature = (temp: number): Temperature => temp as Temperature;
export const createPH = (ph: number): pH => ph as pH;
export const createDissolvedOxygen = (oxygen: number): DissolvedOxygen => oxygen as DissolvedOxygen;
export const createTurbidity = (turbidity: number): Turbidity => turbidity as Turbidity;
export const createPrecipitation = (precip: number): Precipitation => precip as Precipitation;

// 🧮 Validadores de Dominio - Funciones Puras
export const isValidWaterLevel = (level: number): level is WaterLevel => 
  level >= 0 && level <= 10 && Number.isFinite(level);

export const isValidFlowRate = (rate: number): rate is FlowRate => 
  rate >= 0 && rate <= 1000 && Number.isFinite(rate);

export const isValidPH = (ph: number): ph is pH => 
  ph >= 0 && ph <= 14 && Number.isFinite(ph);

export const isValidTemperature = (temp: number): temp is Temperature => 
  temp >= -10 && temp <= 40 && Number.isFinite(temp);

// 🎨 Configuración de Visualización - Constantes Inmutables
export const VISUALIZATION_CONFIG = {
  COLORS: {
    PRIMARY: '#0ea5e9',
    SECONDARY: '#06b6d4', 
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    GRADIENT: {
      WATER: ['#0ea5e9', '#06b6d4', '#0891b2'],
      TEMPERATURE: ['#3b82f6', '#8b5cf6', '#ec4899'],
      QUALITY: ['#10b981', '#f59e0b', '#ef4444']
    }
  },
  CHART_DIMENSIONS: {
    HEIGHT: 300,
    MARGIN: { top: 20, right: 30, left: 20, bottom: 5 }
  },
  ANIMATION: {
    DURATION: 750,
    EASING: 'ease-in-out'
  }
} as const;

// 🌊 Constantes del Dominio Hidrológico
export const HYDROLOGICAL_CONSTANTS = {
  WATER_DENSITY: 1000, // kg/m³
  GRAVITY: 9.81, // m/s²
  KINEMATIC_VISCOSITY: 1.004e-6, // m²/s at 20°C
  CRITICAL_FROUDE: 1.0,
  REYNOLDS_LAMINAR_THRESHOLD: 2300,
  REYNOLDS_TURBULENT_THRESHOLD: 4000
} as const;
