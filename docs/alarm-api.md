# 🚨 API de Alarmas - HydroFlow Monitor

**Documentación técnica del sistema de alarmas para integración con sistemas externos**

---

## 📋 **OVERVIEW**

El sistema de alarmas de HydroFlow Monitor proporciona una API completa para:
- Activar alarmas programáticamente
- Monitorear estado de alarmas
- Integrar con sistemas externos de emergencia
- Configurar umbrales dinámicamente

---

## 🔧 **HOOK PRINCIPAL: useAlarmSystem**

### **Importación**
```typescript
import { useAlarmSystem } from '@/hooks/useAlarmSystem';
```

### **Inicialización**
```typescript
const {
  // Estado
  alarmState,
  isActive,
  currentAlarm,
  volume,
  isMuted,
  alarmHistory,
  
  // Acciones
  playAlarm,
  stopAlarm,
  muteAlarm,
  acknowledgeAlarm,
  setVolume,
  testAlarm,
  triggerAlarmBySeverity,
  
  // Configuración
  ALARM_CONFIG
} = useAlarmSystem({
  maxVolume: 1.0,
  autoMuteAfter: 30,
  enableVibration: true
});
```

---

## 🎵 **TIPOS DE ALARMA**

### **AlarmType**
```typescript
type AlarmType = 'warning' | 'critical' | 'emergency' | 'anomaly' | 'test';
```

### **Configuración por Tipo**
```typescript
const ALARM_CONFIG = {
  warning: {
    sound: '/sounds/beep-warning.mp3',
    description: 'Advertencia - Sonido suave',
    color: '#f59e0b',
    pattern: 'intermitente',
    volume: 0.6
  },
  critical: {
    sound: '/sounds/alarm-critical.mp3', 
    description: 'Crítico - Sirena intermitente',
    color: '#ef4444',
    pattern: 'sirena',
    volume: 0.8
  },
  emergency: {
    sound: '/sounds/evacuation.mp3',
    description: 'Emergencia - Sirena continua',
    color: '#7c2d12',
    pattern: 'continuo',
    volume: 1.0
  },
  anomaly: {
    sound: '/sounds/attention.mp3',
    description: 'Anomalía - Campana',
    color: '#9333ea',
    pattern: 'campana',
    volume: 0.5
  },
  test: {
    sound: '/sounds/test-beep.mp3',
    description: 'Prueba del sistema',
    color: '#6b7280',
    pattern: 'test',
    volume: 0.7
  }
};
```

---

## 🎯 **MÉTODOS PRINCIPALES**

### **playAlarm()**
Reproduce una alarma específica.

```typescript
const playAlarm = async (type: AlarmType, message: string) => Promise<void>

// Ejemplo
await playAlarm('critical', 'Nivel del agua crítico: 3.2m');
```

**Parámetros:**
- `type`: Tipo de alarma a reproducir
- `message`: Mensaje descriptivo del evento

**Comportamiento:**
- Reproduce el sonido correspondiente
- Activa vibración en dispositivos móviles
- Registra en historial de alarmas
- Actualiza estado global

### **stopAlarm()**
Detiene la alarma activa.

```typescript
const stopAlarm = () => void

// Ejemplo
stopAlarm();
```

### **muteAlarm()**
Silencia alarmas temporalmente.

```typescript
const muteAlarm = (duration: number = 10) => void

// Ejemplo
muteAlarm(15); // Silenciar por 15 minutos
```

### **triggerAlarmBySeverity()**
Activa alarma basada en severidad de alerta.

```typescript
const triggerAlarmBySeverity = (severity: AlertSeverity, message: string) => void

// Ejemplo
triggerAlarmBySeverity('critical', 'Caudal excede umbral crítico');
```

**Mapeo de Severidad:**
```typescript
const alarmTypeMap: Record<AlertSeverity, AlarmType> = {
  'normal': 'test',
  'warning': 'warning',
  'critical': 'critical',
  'emergency': 'emergency'
};
```

---

## 📊 **ESTADO DE ALARMAS**

### **AlarmState Interface**
```typescript
interface AlarmState {
  isActive: boolean;
  currentAlarm: AlarmType | null;
  volume: number;
  isMuted: boolean;
  lastAlarm: Date | null;
  alarmHistory: Array<{
    type: AlarmType;
    timestamp: Date;
    message: string;
    acknowledged: boolean;
  }>;
}
```

### **Acceso al Estado**
```typescript
const { alarmState } = useAlarmSystem();

console.log('Alarma activa:', alarmState.isActive);
console.log('Tipo actual:', alarmState.currentAlarm);
console.log('Volumen:', alarmState.volume);
console.log('Silenciado:', alarmState.isMuted);
console.log('Historial:', alarmState.alarmHistory);
```

---

## 🔗 **INTEGRACIÓN CON SISTEMAS EXTERNOS**

### **1. Webhook de Alarmas**
```typescript
// Enviar alarma a sistema externo
const sendAlarmWebhook = async (alarmData: AlarmData) => {
  try {
    await fetch('/api/external/alarm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        type: alarmData.type,
        message: alarmData.message,
        timestamp: alarmData.timestamp,
        station: 'RIO_CLARO_PUCON',
        severity: mapAlarmTypeToSeverity(alarmData.type)
      })
    });
  } catch (error) {
    console.error('Error enviando webhook:', error);
  }
};
```

### **2. Integración con ONEMI**
```typescript
// Enviar alerta a sistema ONEMI
const sendONEMIAlert = async (alertData: ONEMIAlert) => {
  const payload = {
    codigo_estacion: 'EST-002',
    tipo_evento: alertData.type,
    nivel_alerta: alertData.severity,
    mensaje: alertData.message,
    coordenadas: {
      lat: -39.2794,
      lng: -71.9752
    },
    timestamp: new Date().toISOString()
  };
  
  await fetch('https://api.onemi.cl/alertas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.ONEMI_API_KEY
    },
    body: JSON.stringify(payload)
  });
};
```

### **3. Integración con Bomberos**
```typescript
// Sistema de notificación a Bomberos
const notifyFireDepartment = async (emergencyData: EmergencyData) => {
  const smsPayload = {
    to: '+56945123456', // Bomberos Pucón
    message: `🚨 EMERGENCIA HIDROLÓGICA
Río Claro - Pucón
Nivel: ${emergencyData.waterLevel}m
Hora: ${new Date().toLocaleString('es-CL')}
Acción: ${emergencyData.recommendedAction}`,
    priority: 'high'
  };
  
  await fetch('/api/sms/emergency', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(smsPayload)
  });
};
```

---

## 🎛️ **CONFIGURACIÓN AVANZADA**

### **1. Umbrales Dinámicos**
```typescript
// Configurar umbrales específicos por estación
const configureThresholds = (stationId: string, thresholds: ThresholdConfig) => {
  const config = {
    waterLevel: {
      warning: thresholds.waterLevel.warning,
      critical: thresholds.waterLevel.critical,
      emergency: thresholds.waterLevel.emergency
    },
    flowRate: {
      warning: thresholds.flowRate.warning,
      critical: thresholds.flowRate.critical,
      emergency: thresholds.flowRate.emergency
    }
  };
  
  localStorage.setItem(`thresholds_${stationId}`, JSON.stringify(config));
};
```

### **2. Horarios de Silencio**
```typescript
// Configurar horarios de silencio automático
const configureSilentHours = (config: SilentHoursConfig) => {
  const silentConfig = {
    enabled: config.enabled,
    startTime: config.startTime, // "22:00"
    endTime: config.endTime,     // "06:00"
    allowCritical: config.allowCritical, // true
    allowEmergency: config.allowEmergency // true
  };
  
  localStorage.setItem('silent_hours', JSON.stringify(silentConfig));
};
```

### **3. Escalamiento Automático**
```typescript
// Configurar escalamiento automático de alarmas
const configureAutoEscalation = (config: EscalationConfig) => {
  const escalationRules = {
    warningToCritical: {
      enabled: true,
      timeThreshold: 30, // minutos
      condition: 'persistent'
    },
    criticalToEmergency: {
      enabled: true,
      timeThreshold: 15, // minutos
      condition: 'worsening'
    }
  };
  
  localStorage.setItem('escalation_rules', JSON.stringify(escalationRules));
};
```

---

## 📱 **EVENTOS Y LISTENERS**

### **1. Event Listeners**
```typescript
// Escuchar eventos de alarma
window.addEventListener('alarm-activated', (event) => {
  const { type, message, timestamp } = event.detail;
  console.log(`Alarma activada: ${type} - ${message}`);
  
  // Enviar a sistema externo
  sendAlarmWebhook({ type, message, timestamp });
});

window.addEventListener('alarm-stopped', (event) => {
  console.log('Alarma detenida');
});

window.addEventListener('alarm-acknowledged', (event) => {
  const { alarmId, operator } = event.detail;
  console.log(`Alarma ${alarmId} reconocida por ${operator}`);
});
```

### **2. Custom Events**
```typescript
// Disparar eventos personalizados
const dispatchAlarmEvent = (type: string, data: any) => {
  window.dispatchEvent(new CustomEvent(`alarm-${type}`, {
    detail: data
  }));
};

// Ejemplo de uso
dispatchAlarmEvent('custom-alert', {
  station: 'EST-002',
  parameter: 'waterLevel',
  value: 3.2,
  threshold: 3.0
});
```

---

## 🧪 **TESTING DE ALARMAS**

### **1. Test Suite**
```typescript
// tests/alarms.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAlarmSystem } from '@/hooks/useAlarmSystem';

describe('Sistema de Alarmas', () => {
  test('debe activar alarma crítica', async () => {
    const { result } = renderHook(() => useAlarmSystem());
    
    await act(async () => {
      await result.current.playAlarm('critical', 'Test alarm');
    });
    
    expect(result.current.isActive).toBe(true);
    expect(result.current.currentAlarm).toBe('critical');
  });
  
  test('debe silenciar alarma temporalmente', () => {
    const { result } = renderHook(() => useAlarmSystem());
    
    act(() => {
      result.current.muteAlarm(5);
    });
    
    expect(result.current.isMuted).toBe(true);
  });
});
```

### **2. Mock de Audio**
```typescript
// tests/mocks/audioMock.ts
class MockAudio {
  src = '';
  volume = 1;
  loop = false;
  
  play = jest.fn().mockResolvedValue(undefined);
  pause = jest.fn();
  
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
}

global.Audio = MockAudio as any;
```

---

## 📊 **MÉTRICAS Y MONITOREO**

### **1. Métricas de Alarmas**
```typescript
// Obtener estadísticas de alarmas
const getAlarmMetrics = () => {
  const history = alarmState.alarmHistory;
  
  return {
    totalAlarms: history.length,
    alarmsByType: history.reduce((acc, alarm) => {
      acc[alarm.type] = (acc[alarm.type] || 0) + 1;
      return acc;
    }, {} as Record<AlarmType, number>),
    averageResponseTime: calculateAverageResponseTime(history),
    acknowledgedPercentage: (
      history.filter(a => a.acknowledged).length / history.length * 100
    )
  };
};
```

### **2. Health Check**
```typescript
// Verificar salud del sistema de alarmas
const performAlarmHealthCheck = async () => {
  const checks = {
    audioSupport: 'Audio' in window,
    volumeControl: true,
    soundFiles: await checkSoundFiles(),
    permissions: await checkAudioPermissions()
  };
  
  return {
    healthy: Object.values(checks).every(Boolean),
    checks
  };
};
```

---

## 🔒 **SEGURIDAD**

### **1. Validación de Entrada**
```typescript
// Validar datos de alarma
const validateAlarmData = (type: AlarmType, message: string): boolean => {
  if (!Object.keys(ALARM_CONFIG).includes(type)) {
    throw new Error(`Tipo de alarma inválido: ${type}`);
  }
  
  if (!message || message.length > 500) {
    throw new Error('Mensaje de alarma inválido');
  }
  
  return true;
};
```

### **2. Rate Limiting**
```typescript
// Prevenir spam de alarmas
const rateLimiter = new Map<AlarmType, number>();

const checkRateLimit = (type: AlarmType): boolean => {
  const now = Date.now();
  const lastAlarm = rateLimiter.get(type) || 0;
  const minInterval = type === 'emergency' ? 1000 : 5000; // ms
  
  if (now - lastAlarm < minInterval) {
    console.warn(`Rate limit exceeded for alarm type: ${type}`);
    return false;
  }
  
  rateLimiter.set(type, now);
  return true;
};
```

---

**Versión API**: 2.0  
**Última actualización**: Diciembre 2024  
**Soporte**: soporte@hidroflow.cl
