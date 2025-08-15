# 🎯 Sistema de Tipos - Arquitectura Semánticamente Pura

## Filosofía de Tipos

El sistema de tipos de HydroFlow Monitor implementa **branded types** y **tipos inmutables** para garantizar la seguridad de tipos a nivel de dominio y prevenir errores semánticos.

## Branded Types - Seguridad Semántica

### Definición de Branded Types
```typescript
export type StationId = string & { readonly __brand: 'StationId' };
export type Timestamp = string & { readonly __brand: 'Timestamp' };
export type WaterLevel = number & { readonly __brand: 'WaterLevel' };
export type FlowRate = number & { readonly __brand: 'FlowRate' };
```

**Ventajas**:
- **Prevención de errores**: No se puede pasar un `string` donde se espera un `StationId`
- **Documentación viva**: El tipo comunica la intención
- **Refactoring seguro**: Cambios de tipo se propagan automáticamente

### Constructores de Tipos
```typescript
export const createStationId = (id: string): StationId => id as StationId;
export const createTimestamp = (date: Date): Timestamp => date.toISOString() as Timestamp;
export const createWaterLevel = (level: number): WaterLevel => level as WaterLevel;
```

**Uso**:
```typescript
// ✅ Correcto
const stationId = createStationId('station-pucon-centro');
const timestamp = createTimestamp(new Date());

// ❌ Error de compilación
const badId: StationId = 'station-1'; // Type error!
```

## Validadores de Dominio

### Funciones de Validación Puras
```typescript
export const isValidWaterLevel = (level: number): level is WaterLevel => 
  level >= 0 && level <= 10 && Number.isFinite(level);

export const isValidFlowRate = (rate: number): rate is FlowRate => 
  rate >= 0 && rate <= 1000 && Number.isFinite(rate);

export const isValidPH = (ph: number): ph is pH => 
  ph >= 0 && ph <= 14 && Number.isFinite(ph);
```

**Uso con Type Guards**:
```typescript
const processWaterLevel = (value: number) => {
  if (isValidWaterLevel(value)) {
    // TypeScript sabe que value es WaterLevel aquí
    const level: WaterLevel = value;
    return calculateSomething(level);
  }
  throw new Error('Invalid water level');
};
```

## Entidades del Dominio

### Estación de Monitoreo
```typescript
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
```

**Características**:
- **Inmutable**: Todas las propiedades son `readonly`
- **Tipado fuerte**: Usa branded types para IDs y timestamps
- **Estructura clara**: Agrupa propiedades relacionadas

### Medición Hidrológica
```typescript
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
```

## Enums y Constantes

### Estados Hidrológicos
```typescript
export const HydrologicalStatus = {
  OPTIMAL: 'optimal',
  NORMAL: 'normal', 
  WARNING: 'warning',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency'
} as const;

export type HydrologicalStatusType = typeof HydrologicalStatus[keyof typeof HydrologicalStatus];
```

**Ventajas sobre enums tradicionales**:
- **Tree-shaking**: Solo se incluyen valores usados
- **Serialización**: Se serializa como string, no como número
- **Inmutabilidad**: `as const` previene modificaciones

### Rangos Temporales
```typescript
export const TimeRange = {
  REALTIME: '1h',
  DAILY: '24h',
  WEEKLY: '7d', 
  MONTHLY: '30d',
  YEARLY: '1y'
} as const;

export type TimeRangeType = typeof TimeRange[keyof typeof TimeRange];
```

## Tipos de Cálculos

### Cálculos Hidráulicos
```typescript
export interface HydraulicCalculations {
  readonly reynoldsNumber: number;
  readonly froudeNumber: number;
  readonly bernoulliVelocity: number;
  readonly flowRegime: 'laminar' | 'transitional' | 'turbulent';
  readonly flowType: 'subcritical' | 'critical' | 'supercritical';
}
```

### Series Temporales
```typescript
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
```

## Tipos de Estado

### Estado de Aplicación
```typescript
export interface ApplicationState {
  readonly theme: 'light' | 'dark';
  readonly selectedStation: StationId | null;
  readonly timeRange: TimeRangeType;
  readonly isRealTimeMode: boolean;
  readonly lastUpdate: Timestamp;
}
```

### Acciones del Reducer
```typescript
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
```

## Configuración de Visualización

### Constantes Inmutables
```typescript
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
```

## Constantes del Dominio

### Constantes Físicas
```typescript
export const HYDROLOGICAL_CONSTANTS = {
  WATER_DENSITY: 1000, // kg/m³
  GRAVITY: 9.81, // m/s²
  KINEMATIC_VISCOSITY: 1.004e-6, // m²/s at 20°C
  CRITICAL_FROUDE: 1.0,
  REYNOLDS_LAMINAR_THRESHOLD: 2300,
  REYNOLDS_TURBULENT_THRESHOLD: 4000
} as const;
```

## Utilidades de Tipos

### Tipos Condicionales
```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
```

### Tipos de Mapeo
```typescript
type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P];
};

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

## Validación en Runtime

### Esquemas de Validación
```typescript
const HydrologicalMeasurementSchema = {
  timestamp: (value: unknown): value is Timestamp => 
    typeof value === 'string' && !isNaN(Date.parse(value)),
  
  stationId: (value: unknown): value is StationId =>
    typeof value === 'string' && value.startsWith('station-'),
  
  waterLevel: (value: unknown): value is WaterLevel =>
    typeof value === 'number' && isValidWaterLevel(value),
  
  // ... otros campos
};
```

### Función de Validación
```typescript
export const validateMeasurement = (data: unknown): HydrologicalMeasurement => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid measurement data');
  }
  
  const obj = data as Record<string, unknown>;
  
  if (!HydrologicalMeasurementSchema.timestamp(obj.timestamp)) {
    throw new Error('Invalid timestamp');
  }
  
  if (!HydrologicalMeasurementSchema.waterLevel(obj.waterLevel)) {
    throw new Error('Invalid water level');
  }
  
  // ... validar otros campos
  
  return obj as HydrologicalMeasurement;
};
```

## Testing de Tipos

### Type-Only Tests
```typescript
// tests/types.test.ts
import { expectType, expectError } from 'tsd';
import { StationId, createStationId } from '../src/types/hydrology';

// ✅ Debe compilar
expectType<StationId>(createStationId('station-1'));

// ❌ Debe fallar
expectError<StationId>('plain-string');
```

### Runtime Type Tests
```typescript
describe('Type Validators', () => {
  it('should validate water level', () => {
    expect(isValidWaterLevel(2.5)).toBe(true);
    expect(isValidWaterLevel(-1)).toBe(false);
    expect(isValidWaterLevel(NaN)).toBe(false);
  });
});
```

## Beneficios del Sistema de Tipos

### Prevención de Errores
- **Compile-time**: Errores detectados antes de ejecutar
- **Semantic**: Previene confusión entre tipos similares
- **Refactoring**: Cambios seguros y automáticos

### Documentación Viva
- **Self-documenting**: Los tipos comunican intención
- **IDE Support**: Autocompletado y navegación
- **API Contracts**: Interfaces claras entre módulos

### Mantenibilidad
- **Evolución segura**: Cambios de tipo se propagan
- **Debugging**: Errores más específicos y útiles
- **Team Collaboration**: Contratos claros entre desarrolladores
