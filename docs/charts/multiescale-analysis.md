# 📊 Análisis Multiescala - Nivel del Agua vs Precipitación

## Descripción

El gráfico de Análisis Multiescala combina dos variables con escalas diferentes en un solo panel: el nivel del agua (línea) y la precipitación acumulada (barras). Esta visualización revela la correlación directa entre eventos de precipitación y cambios en el nivel del río.

## Tipo de Gráfico

**ComposedChart** de Recharts que combina:
- **LineChart**: Para el nivel del agua (eje Y izquierdo)
- **BarChart**: Para la precipitación (eje Y derecho)

## Cálculos Implementados

### Correlación de Pearson

```typescript
const correlation = numerator / Math.sqrt(denomPrecip * denomLevel);
```

Donde:
- `numerator = Σ(xi - x̄)(yi - ȳ)`
- `denomPrecip = Σ(xi - x̄)²`
- `denomLevel = Σ(yi - ȳ)²`

**Interpretación**:
- `r > 0.7`: Correlación fuerte positiva
- `0.3 < r < 0.7`: Correlación moderada
- `r < 0.3`: Correlación débil

### Análisis de Tendencia

```typescript
const levelTrend = recentLevels[recentLevels.length - 1] > recentLevels[0] 
  ? 'increasing' : 'decreasing'
```

Compara los últimos 10 puntos de datos para determinar la tendencia actual.

## Parámetros Visualizados

### Nivel del Agua
- **Rango**: 0-5 metros
- **Óptimo**: 1.5-3.5 metros
- **Color**: Azul primario (#0ea5e9)
- **Representación**: Línea continua con puntos

### Precipitación
- **Rango**: 0-50 mm
- **Umbral de evento**: > 5 mm
- **Color**: Cian secundario (#06b6d4)
- **Representación**: Barras con transparencia

## Interpretación de Resultados

### Correlación Alta (r > 0.6)
Indica que los eventos de precipitación tienen un impacto directo y predecible en el nivel del río. Útil para:
- Predicción de crecidas
- Planificación de evacuaciones
- Gestión de recursos hídricos

### Correlación Baja (r < 0.3)
Sugiere que otros factores influyen en el nivel del agua:
- Liberación de represas aguas arriba
- Infiltración del suelo
- Evapotranspiración
- Actividades humanas

## Alertas Generadas

### Nivel Alto + Precipitación
Si el nivel > 3.5m y hay precipitación activa, se genera alerta de riesgo de inundación.

### Desfase Temporal
Si hay precipitación significativa pero el nivel no responde en 2-4 horas, se alerta sobre posibles obstrucciones.

## Configuración Técnica

### Ejes Independientes
```typescript
// Eje Y izquierdo - Nivel del agua
<YAxis yAxisId="waterLevel" orientation="left" />

// Eje Y derecho - Precipitación  
<YAxis yAxisId="precipitation" orientation="right" />
```

### Tooltip Personalizado
Muestra:
- Fecha y hora formateada
- Nivel del agua con 2 decimales
- Precipitación (solo si > 0)
- Indicador de evento significativo

## Casos de Uso

1. **Gestión de Emergencias**: Predicción de crecidas basada en precipitación
2. **Planificación Urbana**: Evaluación de impacto de desarrollo en cuencas
3. **Investigación Hidrológica**: Análisis de respuesta de cuenca
4. **Operación de Infraestructura**: Gestión de compuertas y represas

## Limitaciones

- No considera el tiempo de concentración de la cuenca
- No incluye precipitación en toda la cuenca, solo local
- No considera el estado de saturación del suelo
- La correlación puede ser engañosa en períodos secos prolongados
