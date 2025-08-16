/**
 * 📚 Explicaciones Técnicas para Operadores
 * 
 * Sistema de explicaciones en español para ayudar a operadores
 * a entender qué significan los valores y anomalías detectadas
 */

export interface MetricExplanation {
  parameter: string;
  normalRange: string;
  meaning: string;
  actionRequired: string;
  criticalThreshold: string;
  unit: string;
  context: string;
}

export interface AnomalyExplanation {
  type: string;
  description: string;
  possibleCauses: string[];
  immediateActions: string[];
  escalationThreshold: string;
  relatedParameters: string[];
}

// Explicaciones de parámetros hidrológicos
export const METRIC_EXPLANATIONS: Record<string, MetricExplanation> = {
  waterLevel: {
    parameter: 'Nivel del Agua',
    normalRange: '1.5 - 2.5 metros',
    meaning: 'Altura de la superficie del agua medida desde el lecho del río. Indicador principal de crecidas y estado hidrológico del Río Claro.',
    actionRequired: 'Nivel >3.0m: Alertar Bomberos Pucón (132) y ONEMI (+56 45 2348200). Nivel >3.5m: Activar evacuación inmediata de camping y zonas ribereñas.',
    criticalThreshold: '3.0m (Crítico DGA) / 3.5m (Emergencia - Evacuación)',
    unit: 'metros (m)',
    context: 'Río Claro - Pucón: Régimen nivo-pluvial con crecidas invernales. Máximo histórico: 3.8m (2023). Zona turística crítica aguas abajo.'
  },

  flowRate: {
    parameter: 'Caudal',
    normalRange: '8 - 20 m³/s',
    meaning: 'Volumen de agua que atraviesa la sección transversal del río por unidad de tiempo. Calculado mediante curva de descarga calibrada.',
    actionRequired: 'Caudal >30 m³/s: Suspender rafting y actividades acuáticas. >40 m³/s: Cerrar accesos al río y coordinar con autoridades.',
    criticalThreshold: '30 m³/s (Crítico) / 40 m³/s (Emergencia)',
    unit: 'metros cúbicos por segundo (m³/s)',
    context: 'Caudal medio anual: 12 m³/s. Máximo histórico registrado: 48 m³/s (1960). Esencial para seguridad en turismo aventura.'
  },

  temperature: {
    parameter: 'Temperatura del Agua',
    normalRange: '8 - 18°C',
    meaning: 'Temperatura del agua que refleja condiciones ambientales y posibles aportes geotermales del volcán Villarrica. Indicador crítico de actividad volcánica.',
    actionRequired: 'Temperatura >20°C: Contactar SERNAGEOMIN (+56 2 2482 7800). Cambio >5°C en 2h: Verificar actividad volcánica y alertar autoridades.',
    criticalThreshold: '20°C (Alerta volcánica) / Cambio >8°C (Emergencia)',
    unit: 'grados Celsius (°C)',
    context: 'Origen glacial del Villarrica mantiene temperaturas bajas. Aumentos súbitos pueden indicar deshielo volcánico, lahares o actividad geotérmica.'
  },

  conductivity: {
    parameter: 'Conductividad',
    normalRange: '50 - 150 μS/cm',
    meaning: 'Cantidad de sales disueltas en el agua. Indica calidad y origen',
    actionRequired: 'Valores >200 μS/cm requieren análisis de calidad del agua',
    criticalThreshold: '>300 μS/cm - CONTAMINACIÓN POSIBLE',
    unit: 'microsiemens por centímetro (μS/cm)',
    context: 'Agua pura = baja conductividad. Alta conductividad = contaminación o minerales'
  },

  precipitation: {
    parameter: 'Precipitación',
    normalRange: '0 - 5 mm/h',
    meaning: 'Lluvia actual en la cuenca que afectará el caudal en 2-4 horas',
    actionRequired: 'Lluvia >10 mm/h requiere monitoreo intensivo del nivel',
    criticalThreshold: '>20 mm/h - LLUVIA INTENSA',
    unit: 'milímetros por hora (mm/h)',
    context: 'Tiempo de concentración: 3-4 horas desde cuenca alta hasta Pucón'
  },

  turbidity: {
    parameter: 'Turbidez',
    normalRange: '1 - 10 NTU',
    meaning: 'Cantidad de sedimentos suspendidos. Indica erosión o deslizamientos',
    actionRequired: 'Turbidez >50 NTU puede indicar deslizamientos aguas arriba',
    criticalThreshold: '>100 NTU - POSIBLE ALUVIÓN',
    unit: 'unidades nefelométricas de turbidez (NTU)',
    context: 'Agua clara = baja turbidez. Agua turbia = sedimentos o erosión'
  }
};

// Explicaciones de anomalías detectadas
export const ANOMALY_EXPLANATIONS: Record<string, AnomalyExplanation> = {
  rapidRise: {
    type: 'Aumento Rápido del Nivel',
    description: 'El nivel del agua aumentó más de 30 cm en 1 hora',
    possibleCauses: [
      'Lluvia intensa en la cuenca alta',
      'Deshielo acelerado por actividad volcánica',
      'Apertura de compuertas aguas arriba',
      'Deslizamiento que obstruye y luego libera agua'
    ],
    immediateActions: [
      'Verificar precipitación en estación Nacimiento',
      'Contactar guardaparques del Villarrica',
      'Alertar a camping y actividades turísticas',
      'Preparar equipos de emergencia'
    ],
    escalationThreshold: 'Si continúa subiendo >10 cm/h por 3 horas consecutivas',
    relatedParameters: ['flowRate', 'precipitation', 'temperature']
  },

  temperatureSpike: {
    type: 'Aumento Súbito de Temperatura',
    description: 'La temperatura del agua aumentó más de 5°C en 2 horas',
    possibleCauses: [
      'Deshielo volcánico del Villarrica',
      'Actividad geotérmica aumentada',
      'Descarga de aguas termales',
      'Error de sensor (verificar)'
    ],
    immediateActions: [
      'Contactar SERNAGEOMIN inmediatamente',
      'Verificar actividad volcánica en Villarrica',
      'Comparar con estación aguas arriba',
      'Alertar a autoridades locales'
    ],
    escalationThreshold: 'Temperatura >20°C o aumento >8°C',
    relatedParameters: ['conductivity', 'turbidity', 'waterLevel']
  },

  flowDiscrepancy: {
    type: 'Discrepancia entre Estaciones',
    description: 'Diferencia anormal en caudal entre estación Nacimiento y Puente',
    possibleCauses: [
      'Falla de sensor en una estación',
      'Obstrucción parcial del río',
      'Derivación no autorizada de agua',
      'Deslizamiento o derrumbe'
    ],
    immediateActions: [
      'Verificar funcionamiento de ambos sensores',
      'Inspección visual del tramo entre estaciones',
      'Contactar a concesionarios de agua',
      'Revisar tomas de agua industriales'
    ],
    escalationThreshold: 'Diferencia >30% entre estaciones por >2 horas',
    relatedParameters: ['waterLevel', 'turbidity']
  },

  conductivityAnomaly: {
    type: 'Anomalía en Conductividad',
    description: 'Cambio brusco en la conductividad del agua',
    possibleCauses: [
      'Descarga industrial no autorizada',
      'Contaminación aguas arriba',
      'Cambio en origen del agua (glacial vs lluvia)',
      'Actividad minera en la cuenca'
    ],
    immediateActions: [
      'Tomar muestra para análisis químico',
      'Contactar Superintendencia de Servicios Sanitarios',
      'Verificar industrias aguas arriba',
      'Alertar a empresas de agua potable'
    ],
    escalationThreshold: 'Conductividad >300 μS/cm o cambio >100% en 4 horas',
    relatedParameters: ['temperature', 'turbidity']
  },

  sensorMalfunction: {
    type: 'Posible Falla de Sensor',
    description: 'Valores fuera de rango físicamente posible o sin variación',
    possibleCauses: [
      'Sensor obstruido por sedimentos',
      'Falla eléctrica o de comunicación',
      'Daño físico por crecida anterior',
      'Interferencia electromagnética'
    ],
    immediateActions: [
      'Verificar conexiones eléctricas',
      'Comparar con estación de respaldo',
      'Programar inspección técnica',
      'Activar protocolo de sensor manual'
    ],
    escalationThreshold: 'Sin datos válidos por >30 minutos',
    relatedParameters: ['todos los parámetros de la estación']
  }
};

// Función para obtener explicación contextual
export const getContextualExplanation = (
  parameter: string, 
  value: number, 
  trend: 'rising' | 'falling' | 'stable'
): string => {
  const explanation = METRIC_EXPLANATIONS[parameter];
  if (!explanation) return '';

  const trendText = {
    rising: 'SUBIENDO',
    falling: 'BAJANDO', 
    stable: 'ESTABLE'
  };

  return `${explanation.parameter}: ${value}${explanation.unit} - ${trendText[trend]}
  
📊 Rango normal: ${explanation.normalRange}
💡 Significado: ${explanation.meaning}
⚠️ Umbral crítico: ${explanation.criticalThreshold}
🎯 Acción requerida: ${explanation.actionRequired}
📍 Contexto: ${explanation.context}`;
};

// Función para generar alerta con explicación
export const generateAlertWithExplanation = (
  anomalyType: string,
  currentValues: Record<string, number>
): string => {
  const anomaly = ANOMALY_EXPLANATIONS[anomalyType];
  if (!anomaly) return 'Anomalía detectada - Revisar sistema';

  return `🚨 ${anomaly.type.toUpperCase()}

📋 Descripción: ${anomaly.description}

🔍 Posibles causas:
${anomaly.possibleCauses.map(cause => `• ${cause}`).join('\n')}

⚡ Acciones inmediatas:
${anomaly.immediateActions.map(action => `• ${action}`).join('\n')}

🚨 Escalar si: ${anomaly.escalationThreshold}

📊 Parámetros relacionados: ${anomaly.relatedParameters.join(', ')}`;
};
