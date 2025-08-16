/**
 * 🚨 Controles de Sistema de Alarmas
 * 
 * Panel de control para gestionar alarmas sonoras del sistema de monitoreo
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  TestTube, 
  AlertTriangle,
  Siren,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAlarmSystem, AlarmType } from '@/hooks/useAlarmSystem';
import { formatChileanTime } from '@/constants/translations';

interface AlarmControlsProps {
  className?: string;
  compact?: boolean;
}

export const AlarmControls: React.FC<AlarmControlsProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const {
    alarmState,
    isActive,
    currentAlarm,
    volume,
    isMuted,
    alarmHistory,
    stopAlarm,
    muteAlarm,
    setVolume,
    testAlarm,
    acknowledgeAlarm,
    ALARM_CONFIG
  } = useAlarmSystem();

  const [showHistory, setShowHistory] = useState(false);

  const getAlarmIcon = (type: AlarmType) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <Siren className="w-4 h-4" />;
      case 'emergency': return <Siren className="w-4 h-4" />;
      case 'anomaly': return <Bell className="w-4 h-4" />;
      case 'test': return <TestTube className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getAlarmBadgeVariant = (type: AlarmType) => {
    switch (type) {
      case 'warning': return 'default';
      case 'critical': return 'destructive';
      case 'emergency': return 'destructive';
      case 'anomaly': return 'secondary';
      case 'test': return 'outline';
      default: return 'outline';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Estado actual */}
        {isActive && currentAlarm && (
          <Badge 
            variant={getAlarmBadgeVariant(currentAlarm)}
            className="animate-pulse"
          >
            {getAlarmIcon(currentAlarm)}
            <span className="ml-1">ALARMA ACTIVA</span>
          </Badge>
        )}

        {/* Control de volumen rápido */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setVolume(isMuted ? 0.8 : 0)}
          className="p-2"
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>

        {/* Botón de emergencia */}
        {isActive && (
          <Button
            variant="destructive"
            size="sm"
            onClick={stopAlarm}
            className="animate-pulse"
          >
            DETENER
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Siren className="w-5 h-5 text-red-500" />
          Sistema de Alarmas
          {isActive && (
            <Badge variant="destructive" className="animate-pulse">
              ACTIVA
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estado actual */}
        {isActive && currentAlarm && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getAlarmIcon(currentAlarm)}
                <span className="font-medium text-red-800 dark:text-red-200">
                  {ALARM_CONFIG[currentAlarm].description}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={stopAlarm}
                className="animate-pulse"
              >
                DETENER ALARMA
              </Button>
            </div>
          </div>
        )}

        {/* Controles principales */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            onClick={() => muteAlarm(10)}
            className="flex items-center gap-2"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            {isMuted ? 'Silenciado' : 'Silenciar 10min'}
          </Button>

          <Button
            variant="outline"
            onClick={() => testAlarm('test')}
            className="flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            Probar Sistema
          </Button>
        </div>

        {/* Control de volumen */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Volumen</label>
            <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={1}
              min={0}
              step={0.1}
              className="flex-1"
            />
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Pruebas de alarma */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Probar Tipos de Alarma</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => testAlarm('warning')}
              className="text-yellow-600"
            >
              Advertencia
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testAlarm('critical')}
              className="text-red-600"
            >
              Crítica
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testAlarm('emergency')}
              className="text-red-800"
            >
              Emergencia
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => testAlarm('anomaly')}
              className="text-purple-600"
            >
              Anomalía
            </Button>
          </div>
        </div>

        {/* Historial de alarmas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Historial Reciente</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Ocultar' : 'Ver Todo'}
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {alarmHistory.slice(0, showHistory ? 10 : 3).map((alarm, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  {getAlarmIcon(alarm.type)}
                  <span className="font-medium">
                    {ALARM_CONFIG[alarm.type].description}
                  </span>
                  <span className="text-muted-foreground">
                    {formatChileanTime(alarm.timestamp)}
                  </span>
                </div>
                
                {!alarm.acknowledged && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => acknowledgeAlarm(index)}
                    className="h-6 px-2"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Estado: {isMuted ? '🔇 Silenciado' : '🔊 Activo'}</div>
          <div>Última alarma: {alarmState.lastAlarm ? formatChileanTime(alarmState.lastAlarm) : 'Ninguna'}</div>
          <div>Total alarmas: {alarmHistory.length}</div>
        </div>
      </CardContent>
    </Card>
  );
};
