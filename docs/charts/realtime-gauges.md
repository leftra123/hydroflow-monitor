# ⚡ Medición en Tiempo Real - Gauges Radiales

## Descripción

Los Gauges Radiales proporcionan una visualización instantánea y intuitiva de los parámetros críticos de calidad del agua, simulando instrumentos analógicos profesionales. Cada gauge muestra el valor actual, rango óptimo y estado del parámetro.

## Tipo de Visualización

**RadialBarChart** de Recharts con:
- Gauge principal de calidad general
- Gauges individuales por parámetro
- Indicadores de estado óptimo/crítico
- Animaciones suaves de transición

## Parámetros Monitoreados

### 1. Nivel del Agua
- **Rango**: 0-5 metros
- **Óptimo**: 1.5-3.5 metros
- **Crítico**: < 1.0m o > 4.0m
- **Unidad**: metros (m)

### 2. pH del Agua
- **Rango**: 6.0-8.5
- **Óptimo**: 6.8-7.8
- **Crítico**: < 6.5 o > 8.0
- **Unidad**: adimensional

### 3. Oxígeno Disuelto
- **Rango**: 5-12 mg/L
- **Óptimo**: 8-11 mg/L
- **Crítico**: < 6.0 mg/L
- **Unidad**: miligramos por litro

### 4. Temperatura del Agua
- **Rango**: 0-25°C
- **Óptimo**: 5-15°C
- **Crítico**: > 20°C
- **Unidad**: grados Celsius

## Cálculo de Score de Calidad

### Algoritmo de Evaluación
```typescript
const isOptimal = value >= optimal.min && value <= optimal.max;
const optimalCount = parameters.filter(p => p.isOptimal).length;
const qualityScore = (optimalCount / totalParameters) * 100;
```

### Clasificación de Calidad
- **Excelente** (80-100%): 4 parámetros óptimos
- **Buena** (60-79%): 3 parámetros óptimos
- **Regular** (40-59%): 2 parámetros óptimos
- **Deficiente** (0-39%): 0-1 parámetros óptimos

## Normalización de Valores

### Fórmula de Normalización
```typescript
const percentage = ((value - min) / (max - min)) * 100;
```

### Parámetros Invertidos
Para la turbidez (menor es mejor):
```typescript
const normalized = inverted ? 100 - percentage : percentage;
```

## Interpretación por Parámetro

### Nivel del Agua
- **< 1.0m**: Riesgo de navegación, ecosistema estresado
- **1.0-1.5m**: Bajo, pero aceptable
- **1.5-3.5m**: Óptimo para ecosistema y actividades
- **3.5-4.0m**: Elevado, monitoreo intensivo
- **> 4.0m**: Riesgo de inundación

### pH
- **< 6.5**: Acidez peligrosa para vida acuática
- **6.5-6.8**: Ligeramente ácido
- **6.8-7.8**: Rango óptimo para ecosistema
- **7.8-8.0**: Ligeramente alcalino
- **> 8.0**: Alcalinidad problemática

### Oxígeno Disuelto
- **< 6.0 mg/L**: Hipoxia, muerte de peces
- **6.0-8.0 mg/L**: Bajo, estrés para fauna
- **8.0-11.0 mg/L**: Óptimo para vida acuática
- **> 11.0 mg/L**: Sobresaturación (posible eutrofización)

### Temperatura
- **< 2°C**: Condiciones invernales extremas
- **2-5°C**: Frío, metabolismo lento
- **5-15°C**: Óptimo para especies nativas
- **15-20°C**: Cálido, acelera procesos biológicos
- **> 20°C**: Estrés térmico, pérdida de oxígeno

## Configuración Visual

### Colores por Estado
```typescript
const colors = {
  optimal: '#10b981',    // Verde
  warning: '#f59e0b',    // Amarillo
  critical: '#ef4444',   // Rojo
  normal: '#3b82f6'      // Azul
};
```

### Animaciones
- **Entrada**: Fade-in escalonado
- **Actualización**: Transición suave de valores
- **Hover**: Escala ligera (1.02x)

## Alertas Generadas

### Críticas
- Oxígeno disuelto < 6.0 mg/L
- pH < 6.5 o > 8.0
- Nivel > 4.0m

### Advertencias
- Temperatura > 20°C
- Nivel < 1.0m o > 3.5m
- pH fuera de rango óptimo

## Configuración Técnica

### Estructura del Gauge
```typescript
<RadialBarChart
  cx="50%" cy="50%"
  innerRadius="60%" outerRadius="90%"
  startAngle={90} endAngle={-270}
>
  <RadialBar dataKey="value" cornerRadius={4} />
</RadialBarChart>
```

### Gauge Principal
- **Tamaño**: 200x200 px
- **Radio Interior**: 70%
- **Radio Exterior**: 90%
- **Ángulo**: 270° (3/4 de círculo)

### Gauges Individuales
- **Tamaño**: 100x100 px
- **Radio Interior**: 60%
- **Radio Exterior**: 90%
- **Ángulo**: 270° (3/4 de círculo)

## Casos de Uso

### Operadores de Planta
- Monitoreo rápido del estado general
- Identificación inmediata de problemas
- Toma de decisiones operativas

### Gestión Ambiental
- Evaluación de salud del ecosistema
- Cumplimiento de normativas
- Reportes de calidad ambiental

### Investigación
- Análisis de tendencias en tiempo real
- Correlación entre parámetros
- Validación de modelos predictivos

## Limitaciones

- Representa valores instantáneos, no tendencias
- No considera interacciones entre parámetros
- Los rangos óptimos son generales, no específicos del sitio
- Requiere calibración regular de sensores
