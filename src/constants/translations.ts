/**
 * 🌍 Localization Constants - Spanish (Chile)
 * 
 * Complete Spanish translations for the HydroFlow Monitor
 * Following Chilean Spanish conventions and technical terminology
 */

export const TRANSLATIONS = {
  // 🏠 Navigation and Main Interface
  navigation: {
    dashboard: 'Panel Principal',
    alerts: 'Alertas',
    analysis: 'Análisis',
    correlations: 'Correlaciones',
    realtime: 'Tiempo Real',
    settings: 'Configuración',
    help: 'Ayuda',
    export: 'Exportar',
    refresh: 'Actualizar',
    auto: 'Automático',
    manual: 'Manual'
  },

  // 📊 Dashboard Elements
  dashboard: {
    title: 'Monitor Hidrológico Profesional - Río Claro',
    subtitle: 'Sistema de Monitoreo en Tiempo Real',
    lastUpdate: 'Última actualización',
    dataLatency: 'Latencia de datos',
    systemStatus: 'Estado del sistema',
    operational: 'Operacional',
    degraded: 'Degradado',
    critical: 'Crítico',
    offline: 'Desconectado'
  },

  // 🌊 Hydrological Parameters
  parameters: {
    waterLevel: 'Nivel del Agua',
    flowRate: 'Caudal',
    velocity: 'Velocidad',
    temperature: 'Temperatura',
    pH: 'pH',
    dissolvedOxygen: 'Oxígeno Disuelto',
    turbidity: 'Turbidez',
    precipitation: 'Precipitación',
    conductivity: 'Conductividad',
    totalDissolvedSolids: 'Sólidos Disueltos Totales',
    airTemperature: 'Temperatura del Aire',
    humidity: 'Humedad',
    windSpeed: 'Velocidad del Viento',
    windDirection: 'Dirección del Viento',
    barometricPressure: 'Presión Atmosférica'
  },

  // 📏 Units
  units: {
    meters: 'm',
    cubicMetersPerSecond: 'm³/s',
    metersPerSecond: 'm/s',
    celsius: '°C',
    phUnits: 'unidades pH',
    milligramsPerLiter: 'mg/L',
    ntu: 'NTU',
    millimetersPerHour: 'mm/h',
    microsiemensPerCentimeter: 'µS/cm',
    percent: '%',
    kilometersPerHour: 'km/h',
    degrees: '°',
    hectopascals: 'hPa',
    volts: 'V',
    amperes: 'A',
    watts: 'W',
    decibels: 'dBm',
    kilobitsPerSecond: 'kbps',
    milliseconds: 'ms'
  },

  // 🚨 Alert System
  alerts: {
    title: 'Sistema de Alertas Avanzado',
    severity: {
      normal: 'Normal',
      warning: 'Advertencia',
      critical: 'Crítico',
      emergency: 'Emergencia'
    },
    status: {
      active: 'Activa',
      acknowledged: 'Reconocida',
      resolved: 'Resuelta',
      pending: 'Pendiente'
    },
    actions: {
      acknowledge: 'Reconocer',
      resolve: 'Resolver',
      escalate: 'Escalar',
      contact: 'Contactar',
      details: 'Detalles',
      export: 'Exportar Reporte'
    },
    messages: {
      waterLevelHigh: 'Nivel de agua elevado',
      waterLevelCritical: 'Nivel de agua crítico',
      flowRateHigh: 'Caudal elevado',
      rapidRise: 'Subida rápida del nivel',
      volcanicActivity: 'Actividad volcánica detectada',
      sensorMalfunction: 'Mal funcionamiento del sensor',
      communicationLoss: 'Pérdida de comunicación',
      batteryLow: 'Batería baja',
      maintenanceRequired: 'Mantenimiento requerido'
    },
    statistics: {
      total: 'Total',
      emergency: 'Emergencias',
      critical: 'Críticas',
      warning: 'Advertencias',
      unacknowledged: 'Sin Reconocer',
      last24h: 'Últimas 24h',
      thisWeek: 'Esta Semana'
    }
  },

  // 📈 Charts and Analysis
  charts: {
    titles: {
      multiScale: 'Análisis Profesional Multi-Escala',
      realTime: 'Monitoreo en Tiempo Real',
      correlation: 'Análisis de Correlación',
      dimensional: 'Análisis Dimensional',
      trends: 'Análisis de Tendencias',
      statistics: 'Estadísticas Históricas'
    },
    axes: {
      time: 'Tiempo',
      level: 'Nivel (m)',
      flow: 'Caudal (m³/s)',
      temperature: 'Temperatura (°C)',
      precipitation: 'Precipitación (mm/h)',
      otherParameters: 'Otros Parámetros'
    },
    legends: {
      current: 'Actual',
      average: 'Promedio',
      maximum: 'Máximo',
      minimum: 'Mínimo',
      trend: 'Tendencia',
      threshold: 'Umbral',
      prediction: 'Predicción'
    },
    tooltips: {
      value: 'Valor',
      timestamp: 'Fecha y Hora',
      quality: 'Calidad',
      uncertainty: 'Incertidumbre',
      trend: 'Tendencia',
      confidence: 'Confianza'
    }
  },

  // 🏭 Stations
  stations: {
    title: 'Estaciones de Monitoreo',
    nacimiento: 'Río Claro - Nacimiento (Lago Villarrica)',
    puenteQuelhue: 'Río Claro - Puente Quelhue',
    status: {
      operational: 'Operacional',
      maintenance: 'Mantenimiento',
      offline: 'Desconectada',
      error: 'Error'
    },
    info: {
      elevation: 'Elevación',
      riverKm: 'Km Río',
      coordinates: 'Coordenadas',
      operationalSince: 'Operacional desde',
      lastMaintenance: 'Último mantenimiento',
      nextMaintenance: 'Próximo mantenimiento',
      emergencyContact: 'Contacto de emergencia'
    }
  },

  // ⏰ Time Ranges
  timeRanges: {
    '1h': '1 Hora',
    '24h': '24 Horas',
    '7d': '7 Días',
    '30d': '30 Días',
    '1y': '1 Año',
    realtime: 'Tiempo Real',
    historical: 'Histórico'
  },

  // 🌡️ Weather Sidebar
  weather: {
    title: 'Condiciones Meteorológicas',
    subtitle: 'Pucón, Región de La Araucanía',
    current: 'Actual',
    forecast: 'Pronóstico',
    parameters: {
      temperature: 'Temperatura',
      feelsLike: 'Sensación Térmica',
      humidity: 'Humedad',
      windSpeed: 'Viento',
      windDirection: 'Dirección',
      pressure: 'Presión',
      visibility: 'Visibilidad',
      uvIndex: 'Índice UV',
      dewPoint: 'Punto de Rocío',
      cloudCover: 'Nubosidad'
    },
    conditions: {
      sunny: 'Soleado',
      partlyCloudy: 'Parcialmente Nublado',
      cloudy: 'Nublado',
      overcast: 'Cubierto',
      lightRain: 'Lluvia Ligera',
      rain: 'Lluvia',
      heavyRain: 'Lluvia Intensa',
      thunderstorm: 'Tormenta',
      snow: 'Nieve',
      fog: 'Niebla',
      mist: 'Neblina',
      clear: 'Despejado'
    },
    windDirections: {
      N: 'Norte',
      NE: 'Noreste',
      E: 'Este',
      SE: 'Sureste',
      S: 'Sur',
      SW: 'Suroeste',
      W: 'Oeste',
      NW: 'Noroeste'
    }
  },

  // 🔧 Controls and Actions
  controls: {
    play: 'Reproducir',
    pause: 'Pausar',
    stop: 'Detener',
    reset: 'Reiniciar',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    open: 'Abrir',
    toggle: 'Alternar',
    expand: 'Expandir',
    collapse: 'Contraer',
    maximize: 'Maximizar',
    minimize: 'Minimizar',
    fullscreen: 'Pantalla Completa',
    exitFullscreen: 'Salir de Pantalla Completa'
  },

  // 🎨 Theme System
  theme: {
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    toggle: 'Cambiar Tema',
    current: 'Tema Actual',
    description: {
      light: 'Tema claro con fondo blanco',
      dark: 'Tema oscuro con fondo negro',
      system: 'Sigue la configuración del sistema'
    }
  },

  // 📞 Emergency Contacts
  emergency: {
    title: 'Contactos de Emergencia',
    dga: 'Dirección General de Aguas',
    onemi: 'ONEMI Región de La Araucanía',
    municipality: 'Municipalidad de Pucón',
    fireStation: 'Bomberos de Pucón',
    police: 'Carabineros',
    hospital: 'Hospital de Pucón',
    call: 'Llamar',
    email: 'Enviar Email',
    address: 'Dirección'
  },

  // 📊 Statistics and Trends
  statistics: {
    mean: 'Media',
    median: 'Mediana',
    mode: 'Moda',
    standardDeviation: 'Desviación Estándar',
    variance: 'Varianza',
    minimum: 'Mínimo',
    maximum: 'Máximo',
    range: 'Rango',
    correlation: 'Correlación',
    trend: 'Tendencia',
    increasing: 'Creciente',
    decreasing: 'Decreciente',
    stable: 'Estable',
    rising: 'Subiendo',
    falling: 'Bajando',
    anomalies: 'Anomalías',
    confidence: 'Confianza',
    prediction: 'Predicción'
  },

  // ⚙️ System Status
  system: {
    status: 'Estado del Sistema',
    healthy: 'Saludable',
    warning: 'Advertencia',
    error: 'Error',
    maintenance: 'Mantenimiento',
    battery: 'Batería',
    solar: 'Panel Solar',
    communication: 'Comunicación',
    sensors: 'Sensores',
    dataQuality: 'Calidad de Datos',
    excellent: 'Excelente',
    good: 'Buena',
    fair: 'Regular',
    poor: 'Pobre',
    invalid: 'Inválida'
  },

  // 🕐 Date and Time Formats
  dateTime: {
    formats: {
      short: 'dd/MM/yyyy',
      long: 'dd \'de\' MMMM \'de\' yyyy',
      time: 'HH:mm',
      dateTime: 'dd/MM/yyyy HH:mm',
      iso: 'yyyy-MM-dd\'T\'HH:mm:ss'
    },
    relative: {
      now: 'Ahora',
      minutesAgo: 'hace {minutes} minutos',
      hoursAgo: 'hace {hours} horas',
      daysAgo: 'hace {days} días',
      weeksAgo: 'hace {weeks} semanas',
      monthsAgo: 'hace {months} meses'
    }
  },

  // 💾 Data Export
  export: {
    title: 'Exportar Datos',
    formats: {
      json: 'JSON',
      csv: 'CSV',
      excel: 'Excel',
      pdf: 'PDF'
    },
    options: {
      currentView: 'Vista Actual',
      allData: 'Todos los Datos',
      dateRange: 'Rango de Fechas',
      selectedStations: 'Estaciones Seleccionadas',
      includeAlerts: 'Incluir Alertas',
      includeMetadata: 'Incluir Metadatos'
    },
    success: 'Datos exportados exitosamente',
    error: 'Error al exportar datos',
    generating: 'Generando archivo...'
  },

  // 🔍 Search and Filters
  search: {
    placeholder: 'Buscar...',
    noResults: 'No se encontraron resultados',
    filters: 'Filtros',
    sortBy: 'Ordenar por',
    ascending: 'Ascendente',
    descending: 'Descendente',
    clear: 'Limpiar',
    apply: 'Aplicar'
  },

  // ❌ Error Messages
  errors: {
    general: 'Ha ocurrido un error inesperado',
    network: 'Error de conexión de red',
    timeout: 'Tiempo de espera agotado',
    unauthorized: 'No autorizado',
    forbidden: 'Acceso denegado',
    notFound: 'Recurso no encontrado',
    serverError: 'Error interno del servidor',
    dataCorrupted: 'Datos corruptos',
    sensorOffline: 'Sensor desconectado',
    calibrationRequired: 'Calibración requerida',
    maintenanceMode: 'Modo de mantenimiento',
    retry: 'Reintentar',
    contact: 'Contactar soporte técnico'
  },

  // ✅ Success Messages
  success: {
    dataSaved: 'Datos guardados exitosamente',
    alertAcknowledged: 'Alerta reconocida',
    exportCompleted: 'Exportación completada',
    settingsUpdated: 'Configuración actualizada',
    connectionRestored: 'Conexión restaurada',
    calibrationCompleted: 'Calibración completada',
    maintenanceScheduled: 'Mantenimiento programado'
  },

  // ⚠️ Warning Messages
  warnings: {
    dataLatency: 'Latencia de datos elevada',
    batteryLow: 'Batería baja en estación',
    sensorDrift: 'Deriva del sensor detectada',
    communicationIssues: 'Problemas de comunicación',
    maintenanceDue: 'Mantenimiento vencido',
    calibrationDue: 'Calibración vencida',
    storageAlmostFull: 'Almacenamiento casi lleno'
  }
} as const;

// 🌍 Utility functions for localization
export const t = (key: string, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: any = TRANSLATIONS;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  if (params) {
    return Object.entries(params).reduce(
      (str, [param, val]) => str.replace(`{${param}}`, String(val)),
      value
    );
  }
  
  return value;
};

// 📅 Chilean date formatting
export const formatChileanDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatChileanDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatChileanTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
