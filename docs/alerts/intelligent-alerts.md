# 🚨 Sistema de Alertas Inteligentes

## Descripción

El Sistema de Alertas Inteligentes analiza continuamente los parámetros hidrológicos y genera notificaciones contextuales basadas en umbrales dinámicos, análisis estadístico y conocimiento del dominio hidrológico.

## Tipos de Alertas

### Críticas (🔴)
Requieren acción inmediata, riesgo para seguridad o ecosistema.

### Advertencias (🟡)
Condiciones fuera de lo normal que requieren monitoreo intensivo.

### Informativas (🔵)
Cambios notables pero dentro de rangos aceptables.

### Éxito (🟢)
Confirmación de condiciones normales u óptimas.

## Parámetros Monitoreados

### 1. Nivel del Agua

#### Umbrales Críticos
```typescript
if (waterLevel > 3.5) {
  // Alerta: Nivel del Agua Elevado
  // Riesgo de inundación
}

if (waterLevel < 1.0) {
  // Alerta: Nivel del Agua Bajo  
  // Impacto en navegación y ecosistema
}
```

#### Contexto
- **> 3.5m**: Activación de protocolos de emergencia
- **< 1.0m**: Restricciones de navegación, estrés ecológico

### 2. Caudal

#### Umbrales Críticos
```typescript
if (flowRate > 250) {
  // Alerta Crítica: Caudal Extremo
  // Riesgo de desbordamiento
}
```

#### Análisis de Tendencia
- Incremento > 50% en 1 hora: Alerta de crecida súbita
- Disminución > 30% en 2 horas: Posible obstrucción aguas arriba

### 3. Temperatura del Agua

#### Umbrales Estacionales
```typescript
// Verano (Dic-Feb)
if (temperature > 20) {
  // Advertencia: Estrés térmico para fauna
}

// Invierno (Jun-Ago)  
if (temperature < 2) {
  // Info: Condiciones invernales extremas
}
```

#### Impacto Ecológico
- **> 20°C**: Reducción de oxígeno disuelto, estrés para truchas
- **< 2°C**: Metabolismo lento, posible formación de hielo

### 4. pH del Agua

#### Rango Crítico
```typescript
if (pH < 6.5 || pH > 8.0) {
  // Advertencia: pH Fuera de Rango
  // Impacto en vida acuática
}
```

#### Causas Comunes
- **pH < 6.5**: Lluvia ácida, descomposición orgánica
- **pH > 8.0**: Eutrofización, actividad fotosintética intensa

### 5. Oxígeno Disuelto

#### Umbral Crítico
```typescript
if (dissolvedOxygen < 6.0) {
  // Alerta Crítica: Hipoxia
  // Riesgo de muerte de peces
}
```

#### Factores Influyentes
- Temperatura alta reduce solubilidad
- Contaminación orgánica consume oxígeno
- Eutrofización causa fluctuaciones diarias

### 6. Turbidez

#### Umbrales de Calidad
```typescript
if (turbidity > 10) {
  // Advertencia: Alta Turbidez
  // Posible contaminación o erosión
}
```

#### Interpretación
- **> 10 NTU**: Impacto en fotosíntesis acuática
- **> 25 NTU**: Agua no apta para consumo sin tratamiento

## Alertas Hidráulicas

### Número de Froude
```typescript
if (froudeNumber > 1.2) {
  // Advertencia: Flujo Supercrítico
  // Riesgo de erosión y socavación
}
```

### Coherencia de Mediciones
```typescript
const velocityDeviation = Math.abs(measured - calculated) / measured;
if (velocityDeviation > 0.15) {
  // Advertencia: Incoherencia en mediciones
  // Revisar calibración de instrumentos
}
```

## Algoritmo de Priorización

### Matriz de Severidad
```typescript
const priority = {
  critical: 3,    // Riesgo inmediato
  warning: 2,     // Monitoreo intensivo
  info: 1,        // Conocimiento situacional
  success: 0      // Confirmación
};
```

### Factores de Escalamiento
- **Múltiples parámetros afectados**: +1 nivel
- **Tendencia empeorando**: +1 nivel  
- **Condiciones meteorológicas adversas**: +1 nivel

## Configuración Temporal

### Ventanas de Análisis
- **Inmediato**: Valor actual vs umbral
- **Tendencia corta**: Últimos 30 minutos
- **Tendencia media**: Últimas 2 horas
- **Tendencia larga**: Últimas 24 horas

### Supresión de Duplicados
```typescript
const suppressDuration = {
  critical: 5,    // 5 minutos
  warning: 15,    // 15 minutos
  info: 60        // 1 hora
};
```

## Contexto Estacional

### Ajustes por Época
- **Primavera**: Umbrales de crecida más sensibles
- **Verano**: Énfasis en temperatura y oxígeno
- **Otoño**: Monitoreo de turbidez por hojas
- **Invierno**: Alertas de congelamiento

### Eventos Especiales
- **Lluvias intensas**: Umbrales de nivel más estrictos
- **Sequía**: Umbrales de caudal mínimo
- **Actividad turística**: Monitoreo de calidad intensivo

## Integración con Sistemas Externos

### Protocolos de Emergencia
- **Nivel crítico**: Notificación automática a Bomberos
- **Calidad crítica**: Alerta a Autoridad Sanitaria
- **Caudal extremo**: Activación de sirenas de evacuación

### Sistemas de Información
- **SERNAGEOMIN**: Datos sísmicos para correlación
- **DMC**: Pronósticos meteorológicos
- **DGA**: Reportes de calidad regional

## Configuración de Usuario

### Personalización de Umbrales
```typescript
interface UserThresholds {
  waterLevel: { warning: number; critical: number };
  flowRate: { warning: number; critical: number };
  temperature: { min: number; max: number };
  // ... otros parámetros
}
```

### Canales de Notificación
- **Dashboard**: Alertas visuales en tiempo real
- **Email**: Resúmenes diarios y alertas críticas
- **SMS**: Solo alertas críticas
- **WhatsApp**: Grupos de gestión de emergencias

## Métricas de Rendimiento

### Indicadores de Calidad
- **Falsos Positivos**: < 5% mensual
- **Tiempo de Detección**: < 2 minutos
- **Disponibilidad**: > 99.5%
- **Precisión**: > 95% en alertas críticas

### Análisis de Efectividad
- Correlación con eventos reales
- Tiempo de respuesta de operadores
- Reducción de incidentes no detectados

## Limitaciones

### Dependencias
- Calidad de datos de sensores
- Conectividad de red estable
- Calibración regular de instrumentos

### Factores No Considerados
- Actividades humanas no reportadas
- Cambios morfológicos graduales
- Efectos de infraestructura temporal

## Mejoras Futuras

### Inteligencia Artificial
- Aprendizaje automático para umbrales adaptativos
- Predicción de eventos basada en patrones históricos
- Correlación automática con variables meteorológicas

### Integración IoT
- Sensores adicionales de calidad
- Cámaras de monitoreo visual
- Estaciones meteorológicas locales
