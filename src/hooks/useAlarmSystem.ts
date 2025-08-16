/**
 * 🚨 Sistema de Alarmas Sonoras para Monitoreo Hidrológico
 * 
 * Sistema crítico de seguridad para alertas de crecidas del Río Claro
 * Implementa diferentes niveles de alarma con sonidos diferenciados
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AlertSeverity } from '@/types/sensors';

// Tipos de alarma con sonidos específicos
export type AlarmType = 'warning' | 'critical' | 'emergency' | 'anomaly' | 'test';

// Configuración de sonidos de alarma
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
} as const;

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

interface AlarmSystemOptions {
  maxVolume?: number;
  autoMuteAfter?: number; // minutos
  enableVibration?: boolean;
}

export const useAlarmSystem = (options: AlarmSystemOptions = {}) => {
  const {
    maxVolume = 1.0,
    autoMuteAfter = 30,
    enableVibration = true
  } = options;

  const [alarmState, setAlarmState] = useState<AlarmState>({
    isActive: false,
    currentAlarm: null,
    volume: 0.8,
    isMuted: false,
    lastAlarm: null,
    alarmHistory: []
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Función para reproducir alarma
  const playAlarm = useCallback(async (type: AlarmType, message: string) => {
    if (!audioRef.current || alarmState.isMuted) return;

    console.log(`🚨 ALARMA ACTIVADA: ${type.toUpperCase()} - ${message}`);

    const config = ALARM_CONFIG[type];
    
    try {
      // Configurar audio
      audioRef.current.src = config.sound;
      audioRef.current.volume = Math.min(config.volume * alarmState.volume, maxVolume);
      audioRef.current.loop = type === 'emergency' || type === 'critical';

      // Reproducir sonido
      await audioRef.current.play();

      // Vibración en dispositivos móviles
      if (enableVibration && navigator.vibrate) {
        const vibrationPattern = {
          warning: [200, 100, 200],
          critical: [500, 200, 500, 200, 500],
          emergency: [1000],
          anomaly: [100, 50, 100, 50, 100],
          test: [200]
        };
        navigator.vibrate(vibrationPattern[type]);
      }

      // Actualizar estado
      setAlarmState(prev => ({
        ...prev,
        isActive: true,
        currentAlarm: type,
        lastAlarm: new Date(),
        alarmHistory: [
          {
            type,
            timestamp: new Date(),
            message,
            acknowledged: false
          },
          ...prev.alarmHistory.slice(0, 49) // Mantener últimas 50 alarmas
        ]
      }));

      // Auto-silenciar después del tiempo configurado
      if (autoMuteAfter > 0) {
        timeoutRef.current = setTimeout(() => {
          stopAlarm();
        }, autoMuteAfter * 60 * 1000);
      }

    } catch (error) {
      console.error('Error reproduciendo alarma:', error);
    }
  }, [alarmState.volume, alarmState.isMuted, maxVolume, autoMuteAfter, enableVibration]);

  // Detener alarma
  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setAlarmState(prev => ({
      ...prev,
      isActive: false,
      currentAlarm: null
    }));

    console.log('🔇 Alarma detenida');
  }, []);

  // Silenciar temporalmente
  const muteAlarm = useCallback((duration: number = 10) => {
    stopAlarm();
    setAlarmState(prev => ({ ...prev, isMuted: true }));

    setTimeout(() => {
      setAlarmState(prev => ({ ...prev, isMuted: false }));
      console.log('🔊 Alarmas reactivadas');
    }, duration * 60 * 1000);

    console.log(`🔇 Alarmas silenciadas por ${duration} minutos`);
  }, [stopAlarm]);

  // Reconocer alarma
  const acknowledgeAlarm = useCallback((index: number) => {
    setAlarmState(prev => ({
      ...prev,
      alarmHistory: prev.alarmHistory.map((alarm, i) => 
        i === index ? { ...alarm, acknowledged: true } : alarm
      )
    }));
  }, []);

  // Cambiar volumen
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setAlarmState(prev => ({ ...prev, volume: clampedVolume }));
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  // Probar sistema de alarmas
  const testAlarm = useCallback((type: AlarmType = 'test') => {
    playAlarm(type, `Prueba del sistema de alarmas - ${ALARM_CONFIG[type].description}`);
  }, [playAlarm]);

  // Función para activar alarma basada en severidad
  const triggerAlarmBySeverity = useCallback((severity: AlertSeverity, message: string) => {
    const alarmTypeMap: Record<AlertSeverity, AlarmType> = {
      'normal': 'test',
      'warning': 'warning',
      'critical': 'critical',
      'emergency': 'emergency'
    };

    const alarmType = alarmTypeMap[severity] || 'warning';
    playAlarm(alarmType, message);
  }, [playAlarm]);

  return {
    // Estado
    alarmState,
    isActive: alarmState.isActive,
    currentAlarm: alarmState.currentAlarm,
    volume: alarmState.volume,
    isMuted: alarmState.isMuted,
    alarmHistory: alarmState.alarmHistory,
    
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
  };
};
