# 🧮 Cálculos Hidráulicos Fundamentales

## Descripción

El motor de cálculos hidráulicos implementa las leyes fundamentales de la mecánica de fluidos para caracterizar el comportamiento del río y validar la coherencia de las mediciones.

## Parámetros Calculados

### 1. Número de Reynolds (Re)

#### Fórmula
```
Re = (v × Dh) / ν
```

Donde:
- `v` = Velocidad del flujo (m/s)
- `Dh` = Diámetro hidráulico (m)
- `ν` = Viscosidad cinemática (m²/s)

#### Diámetro Hidráulico
```
Dh = 4A / P
```
- `A` = Área transversal (m²)
- `P` = Perímetro mojado (m)

#### Interpretación
- **Re < 2,300**: Flujo laminar (movimiento ordenado)
- **2,300 < Re < 4,000**: Flujo transicional (régimen mixto)
- **Re > 4,000**: Flujo turbulento (mezcla intensa)

#### Corrección por Temperatura
```typescript
const adjustedViscosity = baseViscosity * Math.exp(-0.025 * (T - 20));
```

### 2. Número de Froude (Fr)

#### Fórmula
```
Fr = v / √(g × h)
```

Donde:
- `v` = Velocidad del flujo (m/s)
- `g` = Aceleración gravitacional (9.81 m/s²)
- `h` = Profundidad hidráulica (m)

#### Interpretación
- **Fr < 1**: Flujo subcrítico (tranquilo, controlado por aguas abajo)
- **Fr = 1**: Flujo crítico (transición, energía específica mínima)
- **Fr > 1**: Flujo supercrítico (rápido, controlado por aguas arriba)

#### Implicaciones Prácticas
- **Subcrítico**: Ondas pueden propagarse aguas arriba
- **Supercrítico**: Flujo rápido, posible erosión, salto hidráulico

### 3. Velocidad de Bernoulli

#### Fórmula
```
v = Q / A
```

Donde:
- `Q` = Caudal medido (m³/s)
- `A` = Área transversal calculada (m²)

#### Validación de Coherencia
```typescript
const velocityDifference = Math.abs(measuredVelocity - bernoulliVelocity);
const isCoherent = velocityDifference / measuredVelocity < 0.1; // 10% tolerancia
```

## Geometría del Canal

### Área Transversal (Canal Rectangular)
```
A = w × h
```
- `w` = Ancho del canal (15m para Río Claro)
- `h` = Profundidad del agua (m)

### Perímetro Mojado
```
P = w + 2h
```

### Radio Hidráulico
```
R = A / P
```

## Constantes Físicas

### Propiedades del Agua
- **Densidad**: 1000 kg/m³
- **Viscosidad cinemática** (20°C): 1.004×10⁻⁶ m²/s
- **Gravedad**: 9.81 m/s²

### Umbrales Críticos
- **Reynolds laminar**: 2,300
- **Reynolds turbulento**: 4,000
- **Froude crítico**: 1.0

## Implementación Técnica

### Función Principal
```typescript
export const computeHydraulicCalculations = (
  flowRate: FlowRate,
  velocity: WaterVelocity,
  waterLevel: WaterLevel,
  temperature: Temperature,
  channelWidth: number = 15
): HydraulicCalculations
```

### Validación de Entrada
```typescript
const isValidInput = (
  flowRate > 0 && 
  velocity > 0 && 
  waterLevel > 0 && 
  temperature > -10 && temperature < 40
);
```

### Precisión de Cálculos
- **Reynolds**: Entero (sin decimales)
- **Froude**: 3 decimales
- **Bernoulli**: 2 decimales

## Aplicaciones Prácticas

### Diseño Hidráulico
- Dimensionamiento de canales
- Cálculo de capacidad de transporte
- Diseño de estructuras de control

### Gestión de Riesgos
- Predicción de erosión (Fr > 1.2)
- Evaluación de estabilidad del lecho
- Análisis de transporte de sedimentos

### Validación de Datos
- Detección de errores de instrumentación
- Verificación de calibración
- Control de calidad automático

## Limitaciones

### Simplificaciones Asumidas
- Canal de sección rectangular uniforme
- Flujo permanente y uniforme
- Distribución uniforme de velocidades
- Ausencia de vegetación significativa

### Factores No Considerados
- Rugosidad variable del lecho
- Efectos de curvatura del canal
- Estratificación térmica
- Efectos de viento superficial

## Interpretación de Resultados

### Flujo Normal (Re > 4000, Fr < 1)
- Condiciones típicas del río
- Mezcla eficiente de contaminantes
- Transporte moderado de sedimentos

### Flujo Crítico (Fr ≈ 1)
- Condición de máxima eficiencia hidráulica
- Posible formación de ondas estacionarias
- Sensibilidad a cambios de pendiente

### Flujo Supercrítico (Fr > 1)
- Velocidades altas, posible erosión
- Riesgo de socavación en estructuras
- Dificultad para control hidráulico

## Alertas Automáticas

### Condiciones Anómalas
- **Fr > 1.2**: Alerta de flujo supercrítico
- **Coherencia < 90%**: Posible error instrumental
- **Re < 2000**: Flujo inusualmente laminar

### Mantenimiento Preventivo
- Desviación > 15% en cálculos de Bernoulli
- Cambios abruptos en régimen de flujo
- Inconsistencias temporales en parámetros
