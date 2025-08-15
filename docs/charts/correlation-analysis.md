# 🔬 Análisis Correlacional - Caudal vs Velocidad

## Descripción

El Análisis Correlacional utiliza un gráfico de dispersión para visualizar la relación fundamental entre el caudal y la velocidad del río. Esta relación es crítica para validar la coherencia de las mediciones y detectar anomalías en el comportamiento hidráulico.

## Tipo de Gráfico

**ScatterChart** de Recharts con:
- Puntos de dispersión coloreados por estado
- Línea de regresión lineal
- Detección automática de anomalías

## Fundamento Teórico

### Ecuación de Continuidad
```
Q = A × v
```
Donde:
- `Q` = Caudal (m³/s)
- `A` = Área transversal (m²)
- `v` = Velocidad promedio (m/s)

Para un canal con geometría relativamente constante, existe una relación lineal entre caudal y velocidad.

## Cálculos Estadísticos

### Correlación de Pearson
```typescript
const correlation = numerator / Math.sqrt(denomFlow * denomVelocity);
```

### Regresión Lineal Simple
```typescript
const slope = numerator / denomFlow;
const intercept = meanVelocity - slope * meanFlow;
```

**Ecuación resultante**: `v = slope × Q + intercept`

### Coeficiente de Determinación (R²)
```typescript
const rSquared = correlation * correlation;
```

**Interpretación**:
- `R² > 0.8`: Excelente ajuste lineal
- `0.6 < R² < 0.8`: Buen ajuste
- `R² < 0.6`: Ajuste pobre, posibles factores externos

## Detección de Anomalías

### Método de Residuales
```typescript
const residual = actualVelocity - predictedVelocity;
const isAnomaly = Math.abs(residual) > 2 * standardDeviation;
```

### Tipos de Anomalías Detectadas

1. **Velocidad Anormalmente Alta**
   - Posible obstrucción parcial del canal
   - Error en sensor de área transversal
   - Flujo canalizado por debris

2. **Velocidad Anormalmente Baja**
   - Sedimentación en el canal
   - Vegetación acuática excesiva
   - Error en sensor de velocidad

3. **Caudal Inconsistente**
   - Derivaciones no autorizadas
   - Fugas en el sistema
   - Errores de calibración

## Parámetros de Calidad

### Indicadores de Coherencia
- **Desviación Estándar Residual**: < 0.1 m/s (excelente)
- **Puntos Anómalos**: < 5% del total
- **R² Mínimo**: > 0.7 para validación

### Umbrales de Alerta
```typescript
if (anomalies > totalPoints * 0.1) {
  // Más del 10% de anomalías - revisar instrumentación
}
```

## Visualización

### Codificación por Color
- **Verde**: Puntos normales dentro de 2σ
- **Rojo**: Anomalías fuera de 2σ
- **Amarillo**: Línea de regresión (predicción)

### Información del Tooltip
- Fecha y hora de la medición
- Valores de caudal y velocidad
- Valor predicho por regresión
- Residual calculado
- Indicador de anomalía

## Aplicaciones Prácticas

### Validación de Instrumentos
Detecta automáticamente:
- Sensores descalibrados
- Obstrucciones en medidores
- Deriva temporal de instrumentos

### Gestión de Calidad de Datos
- Filtrado automático de datos erróneos
- Identificación de períodos de mantenimiento necesario
- Validación cruzada entre estaciones

### Análisis Hidráulico
- Verificación de estabilidad del canal
- Detección de cambios morfológicos
- Evaluación de efectos de infraestructura

## Interpretación de Resultados

### Correlación Fuerte (r > 0.8)
- Canal estable con geometría consistente
- Instrumentación funcionando correctamente
- Condiciones hidráulicas normales

### Correlación Débil (r < 0.6)
- Posibles cambios en la geometría del canal
- Efectos de remanso o control hidráulico
- Problemas de instrumentación
- Influencia de tributarios o derivaciones

## Configuración Técnica

### Parámetros del Gráfico
```typescript
<ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
  <XAxis type="number" dataKey="x" name="Caudal" unit=" m³/s" />
  <YAxis type="number" dataKey="y" name="Velocidad" unit=" m/s" />
</ScatterChart>
```

### Línea de Regresión
```typescript
<ReferenceLine
  segment={[
    { x: minFlow, y: slope * minFlow + intercept },
    { x: maxFlow, y: slope * maxFlow + intercept }
  ]}
  stroke={theme.colors.warning}
  strokeDasharray="5 5"
/>
```

## Limitaciones

- Asume geometría de canal constante
- No considera efectos de remanso
- Sensible a la calidad de los datos de entrada
- Requiere período de calibración inicial
