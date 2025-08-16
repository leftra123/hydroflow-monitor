# 🌊 HydroFlow Monitor - Sistema Crítico de Monitoreo Hidrológico

**Sistema profesional de monitoreo hidrológico en tiempo real para el Río Claro de Pucón, Chile.**

> ⚠️ **SISTEMA CRÍTICO DE SEGURIDAD** - Este sistema es vital para la protección de la población y el turismo en Pucón, especialmente considerando los riesgos volcánicos del Villarrica y las crecidas del río.

## 🚨 **CARACTERÍSTICAS CRÍTICAS DE SEGURIDAD**

### **🔊 Sistema de Alarmas Sonoras Diferenciadas**
- **🟡 Advertencia**: Beep suave para cambios menores
- **🔴 Crítico**: Sirena intermitente para situaciones de riesgo
- **🚨 Emergencia**: Sirena continua para evacuación inmediata
- **🟣 Anomalía**: Campana para fallas de sensor

### **🔄 Comparación Simultánea de Estaciones**
- **Vista dividida** de Estación Nacimiento y Estación Puente
- **Detección automática** de divergencias anormales (>30%)
- **Tiempo de propagación** calculado: 3.5 horas entre estaciones
- **Alertas de falla** de sensor con protocolo de respaldo

### **📚 Explicaciones Técnicas Contextuales**
- **Tooltips informativos** en español chileno
- **Rangos normales** y umbrales críticos específicos del Río Claro
- **Acciones recomendadas** para cada tipo de anomalía
- **Terminología DGA** oficial para operadores profesionales

### **🎨 Sistema de Temas Robusto**
- **Claro**: Optimizado para operación diurna
- **Oscuro**: Ideal para monitoreo nocturno 24/7
- **Sistema**: Adaptación automática al horario

## 🎯 **CASOS DE USO CRÍTICOS**

### **🌊 Crecida Súbita**
```
Escenario: Nivel sube 50cm en 30 minutos
→ Alarma crítica automática
→ Explicación contextual mostrada
→ Acciones sugeridas: "Alertar camping Las Termas"
→ Predicción: "Nivel máximo esperado: 3.2m en 2 horas"
```

### **🔧 Falla de Sensor**
```
Escenario: Divergencia >30% entre estaciones
→ Alerta de anomalía con sonido específico
→ Marcado como posible falla de sensor
→ Comparación con estación de respaldo
→ Protocolo de verificación manual activado
```

### **🌙 Operación Nocturna**
```
Escenario: Operador en turno de 3 AM
→ Tema oscuro automático
→ Contraste optimizado para visión nocturna
→ Alarmas audibles pero no estridentes
→ Indicadores sutiles sin lastimar la vista
```

## 🚀 **TECNOLOGÍAS CRÍTICAS**

- **React 18** con TypeScript para confiabilidad
- **Sistema de alarmas** con Web Audio API
- **Gestión de estado** optimizada para tiempo real
- **Persistencia local** para configuraciones críticas
- **Detección de anomalías** con algoritmos especializados

## 📦 **INSTALACIÓN Y CONFIGURACIÓN**

```bash
# Clonar repositorio
git clone [repository-url]
cd hydroflow-monitor

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar en modo desarrollo
npm run dev

# Build para producción (sistema crítico)
npm run build
```

### **⚙️ Variables de Entorno Críticas**

```env
# Configuración de alarmas
VITE_ALARM_VOLUME_DEFAULT=0.8
VITE_ALARM_AUTO_MUTE_MINUTES=30
VITE_VIBRATION_ENABLED=true

# Intervalos de actualización
VITE_DATA_UPDATE_INTERVAL=30000
VITE_ALARM_CHECK_INTERVAL=5000

# Umbrales críticos específicos del Río Claro
VITE_CRITICAL_WATER_LEVEL=3.0
VITE_CRITICAL_FLOW_RATE=30.0
VITE_TEMPERATURE_SPIKE_THRESHOLD=5.0
```

## 🏗️ **ARQUITECTURA DEL SISTEMA**

```
src/
├── components/
│   ├── alarms/           # 🚨 Sistema de alarmas críticas
│   ├── stations/         # 🔄 Comparación de estaciones
│   ├── charts/          # 📊 Visualizaciones profesionales
│   └── ui/              # 🎨 Componentes base con temas
├── hooks/
│   ├── useAlarmSystem.ts    # 🔊 Gestión de alarmas sonoras
│   ├── useTheme.ts         # 🎨 Sistema de temas robusto
│   └── useSmoothDataUpdates.ts # ⚡ Actualizaciones sin parpadeo
├── constants/
│   ├── technicalExplanations.ts # 📚 Base de conocimiento
│   ├── professionalColors.ts   # 🎨 Paleta DGA oficial
│   └── translations.ts         # 🌍 Localización chilena
└── types/
    └── sensors.ts              # 📡 Definiciones de datos críticos
```

## 📊 **FUNCIONALIDADES OPERACIONALES**

### **🎛️ Panel de Control Principal**
- **Métricas en tiempo real** con explicaciones contextuales
- **Comparación simultánea** de ambas estaciones
- **Sistema de alarmas** con control de volumen
- **Indicadores de estado** de conexión y sensores

### **📈 Análisis Profesional**
- **Detección de anomalías** automática
- **Correlación entre estaciones** para validación
- **Tiempo de propagación** calculado dinámicamente
- **Predicciones a corto plazo** basadas en tendencias

### **🚨 Gestión de Emergencias**
- **Escalamiento automático** según severidad
- **Historial de eventos** con timestamps
- **Reconocimiento manual** de alarmas
- **Protocolos de respuesta** integrados

## 🔧 **CONFIGURACIÓN OPERACIONAL**

### **🎚️ Niveles de Alarma Configurables**

```typescript
// Configuración específica para Río Claro, Pucón
const ALARM_THRESHOLDS = {
  waterLevel: {
    warning: 2.5,    // metros - Precaución
    critical: 3.0,   // metros - Alerta autoridades
    emergency: 3.5   // metros - Evacuación inmediata
  },
  flowRate: {
    warning: 20,     // m³/s - Monitoreo intensivo
    critical: 30,    // m³/s - Alertar Bomberos
    emergency: 45    // m³/s - Crecida mayor histórica
  },
  temperature: {
    spike: 5,        // °C - Posible actividad volcánica
    critical: 20     // °C - Deshielo volcánico confirmado
  }
};
```

### **🔊 Configuración de Sonidos**

```typescript
const ALARM_SOUNDS = {
  warning: {
    file: '/sounds/beep-warning.mp3',
    volume: 0.6,
    pattern: 'intermitente'
  },
  critical: {
    file: '/sounds/alarm-critical.mp3',
    volume: 0.8,
    pattern: 'sirena'
  },
  emergency: {
    file: '/sounds/evacuation.mp3',
    volume: 1.0,
    pattern: 'continuo'
  }
};
```

## 📱 **COMPATIBILIDAD Y REQUISITOS**

### **🖥️ Navegadores Soportados**
- **Chrome 90+** (Recomendado para operación crítica)
- **Firefox 88+** (Soporte completo de alarmas)
- **Safari 14+** (iOS/macOS)
- **Edge 90+** (Windows)

### **📱 Dispositivos**
- **Desktop**: Estaciones de monitoreo principales
- **Tablet**: Inspecciones de campo
- **Móvil**: Alertas de emergencia

### **🔊 Requisitos de Audio**
- **Altavoces externos** recomendados para alarmas críticas
- **Permisos de audio** del navegador requeridos
- **Volumen del sistema** >50% para emergencias

## 🚨 **PROTOCOLOS DE EMERGENCIA**

### **📋 Checklist de Operación Diaria**
- [ ] Verificar funcionamiento de alarmas (botón "Probar Sistema")
- [ ] Confirmar comunicación entre estaciones
- [ ] Revisar umbrales de alerta configurados
- [ ] Validar sincronización de tiempo
- [ ] Comprobar volumen de alarmas

### **⚡ Procedimiento de Emergencia**
1. **Alarma crítica activada** → Verificar datos en ambas estaciones
2. **Confirmar anomalía** → Contactar autoridades según protocolo
3. **Documentar evento** → Registrar en bitácora del sistema
4. **Seguimiento** → Monitorear evolución hasta normalización

## 🤝 **SOPORTE Y MANTENIMIENTO**

### **📞 Contactos de Emergencia**
- **Bomberos Pucón**: 132
- **ONEMI Araucanía**: +56 45 2348200
- **DGA Temuco**: +56 45 2297300
- **Soporte Técnico**: soporte@hidroflow.cl

### **🔧 Mantenimiento Preventivo**
- **Diario**: Verificación de alarmas y conectividad
- **Semanal**: Calibración de sensores
- **Mensual**: Backup de configuraciones
- **Trimestral**: Actualización de umbrales estacionales

## 📄 **DOCUMENTACIÓN TÉCNICA**

- **[Manual del Operador](./docs/operator-manual.md)** - Guía completa de operación
- **[Protocolos de Emergencia](./docs/emergency-protocols.md)** - Procedimientos críticos
- **[Configuración Técnica](./docs/technical-setup.md)** - Instalación y configuración
- **[API de Alarmas](./docs/alarm-api.md)** - Integración con sistemas externos

---

## 🇨🇱 **DESARROLLADO PARA CHILE**

**Sistema desarrollado específicamente para las condiciones hidrológicas y volcánicas de la Región de la Araucanía, Chile.**

> **"La seguridad de Pucón depende de la vigilancia constante de sus aguas"**

**Versión**: 2.0.0 - Sistema Crítico
**Última actualización**: Diciembre 2024
**Certificación**: DGA Chile Compatible
