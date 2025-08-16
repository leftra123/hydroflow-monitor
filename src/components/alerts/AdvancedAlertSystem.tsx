/**
 * 🚨 Advanced Alert System with Early Warning
 * 
 * Professional flood warning and anomaly detection system
 * Following DGA Chile emergency protocols
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Siren, 
  TrendingUp, 
  Clock, 
  MapPin,
  Phone,
  Download,
  Eye,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertSeverity, StationDataPackage } from '@/types/sensors';
import { ALERT_COLORS, getAlertColor } from '@/constants/professionalColors';
import { EMERGENCY_CONTACTS } from '@/data/stations';

interface AdvancedAlertSystemProps {
  stationData: StationDataPackage[];
  onAlertAcknowledge: (alertId: string) => void;
  onEmergencyContact: (contact: string) => void;
  onExportReport: () => void;
}

// --- The following demonstrates potential real sensor data usage ---
// In production, this would connect to real-time sensor APIs
const generateRealisticAlerts = (stationData: StationDataPackage[]): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();

  stationData.forEach(station => {
    // Water level monitoring
    if (station.waterLevel.level.value > 2.5) {
      alerts.push({
        id: `alert-${station.stationId}-waterlevel-${Date.now()}`,
        stationId: station.stationId,
        parameter: 'waterLevel',
        severity: station.waterLevel.level.value > 3.0 ? AlertSeverity.EMERGENCY : AlertSeverity.CRITICAL,
        currentValue: station.waterLevel.level.value,
        threshold: 2.5,
        message: `Nivel de agua crítico: ${station.waterLevel.level.value.toFixed(2)}m`,
        timestamp: station.timestamp,
        acknowledged: false,
        actionRequired: station.waterLevel.level.value > 3.0 
          ? 'EVACUACIÓN INMEDIATA - Contactar ONEMI y Bomberos'
          : 'Monitoreo intensivo - Preparar medidas preventivas',
        estimatedImpact: station.waterLevel.level.value > 3.0
          ? 'Inundación severa en zona urbana de Pucón'
          : 'Posible desborde en sectores bajos'
      });
    }

    // Flow rate anomaly detection
    if (station.flowRate.discharge.value > 25) {
      alerts.push({
        id: `alert-${station.stationId}-flowrate-${Date.now()}`,
        stationId: station.stationId,
        parameter: 'flowRate',
        severity: station.flowRate.discharge.value > 35 ? AlertSeverity.EMERGENCY : AlertSeverity.WARNING,
        currentValue: station.flowRate.discharge.value,
        threshold: 25,
        message: `Caudal elevado: ${station.flowRate.discharge.value.toFixed(1)} m³/s`,
        timestamp: station.timestamp,
        acknowledged: false,
        actionRequired: 'Verificar condiciones meteorológicas y estado de infraestructura',
        estimatedImpact: 'Posible erosión de riberas y afectación de puentes'
      });
    }

    // Volcanic activity detection (conductivity)
    if (station.waterQuality.conductivity.value > 400) {
      alerts.push({
        id: `alert-${station.stationId}-volcanic-${Date.now()}`,
        stationId: station.stationId,
        parameter: 'conductivity',
        severity: station.waterQuality.conductivity.value > 800 ? AlertSeverity.EMERGENCY : AlertSeverity.CRITICAL,
        currentValue: station.waterQuality.conductivity.value,
        threshold: 400,
        message: `Actividad volcánica detectada: ${station.waterQuality.conductivity.value} µS/cm`,
        timestamp: station.timestamp,
        acknowledged: false,
        actionRequired: 'Contactar SERNAGEOMIN - Posible actividad volcánica en Villarrica',
        estimatedImpact: 'Riesgo de lahar o contaminación volcánica del agua'
      });
    }

    // Rapid water level rise detection
    if (station.waterLevel.rateOfChange > 0.5) {
      alerts.push({
        id: `alert-${station.stationId}-rapidrise-${Date.now()}`,
        stationId: station.stationId,
        parameter: 'waterLevel',
        severity: AlertSeverity.WARNING,
        currentValue: station.waterLevel.rateOfChange,
        threshold: 0.5,
        message: `Subida rápida del nivel: ${station.waterLevel.rateOfChange.toFixed(2)} m/h`,
        timestamp: station.timestamp,
        acknowledged: false,
        actionRequired: 'Monitoreo continuo - Evaluar precipitaciones aguas arriba',
        estimatedImpact: 'Posible crecida en las próximas 2-4 horas'
      });
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { emergency: 4, critical: 3, warning: 2, normal: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
};

export const AdvancedAlertSystem: React.FC<AdvancedAlertSystemProps> = ({
  stationData,
  onAlertAcknowledge,
  onEmergencyContact,
  onExportReport
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Generate realistic alerts from station data
  const currentAlerts = useMemo(() => 
    generateRealisticAlerts(stationData), 
    [stationData]
  );

  useEffect(() => {
    setAlerts(currentAlerts);
  }, [currentAlerts]);

  // Alert statistics
  const alertStats = useMemo(() => ({
    total: alerts.length,
    emergency: alerts.filter(a => a.severity === AlertSeverity.EMERGENCY).length,
    critical: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
    warning: alerts.filter(a => a.severity === AlertSeverity.WARNING).length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length
  }), [alerts]);

  // Audio alert for critical situations
  useEffect(() => {
    if (audioEnabled && alertStats.emergency > 0) {
      // In production, play emergency sound
      console.log('🚨 EMERGENCY ALERT SOUND TRIGGERED');
    }
  }, [alertStats.emergency, audioEnabled]);

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.EMERGENCY:
        return <Siren className="w-5 h-5 animate-pulse" />;
      case AlertSeverity.CRITICAL:
        return <AlertTriangle className="w-5 h-5" />;
      case AlertSeverity.WARNING:
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getSeverityLabel = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.EMERGENCY:
        return 'EMERGENCIA';
      case AlertSeverity.CRITICAL:
        return 'CRÍTICO';
      case AlertSeverity.WARNING:
        return 'ADVERTENCIA';
      default:
        return 'NORMAL';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Summary Dashboard */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Sistema de Alertas Avanzado
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onExportReport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button
                variant={audioEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                🔊 Audio
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{alertStats.emergency}</div>
              <div className="text-sm text-muted-foreground">Emergencias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{alertStats.critical}</div>
              <div className="text-sm text-muted-foreground">Críticas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{alertStats.warning}</div>
              <div className="text-sm text-muted-foreground">Advertencias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{alertStats.unacknowledged}</div>
              <div className="text-sm text-muted-foreground">Sin Reconocer</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts List */}
      <div className="space-y-3">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`border rounded-lg p-4 ${
                alert.severity === AlertSeverity.EMERGENCY ? 'border-red-500 bg-red-50 dark:bg-red-950' :
                alert.severity === AlertSeverity.CRITICAL ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' :
                'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 ${getAlertColor(alert.severity)}`}>
                  {getSeverityIcon(alert.severity)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant={alert.severity === AlertSeverity.EMERGENCY ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {getSeverityLabel(alert.severity)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {alert.stationId}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(alert.timestamp).toLocaleTimeString('es-CL')}
                    </span>
                  </div>

                  <h3 className="font-medium text-lg mb-2">{alert.message}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="bg-background rounded p-3">
                      <div className="text-sm font-medium mb-1">Acción Requerida:</div>
                      <div className="text-sm">{alert.actionRequired}</div>
                    </div>
                    <div className="bg-background rounded p-3">
                      <div className="text-sm font-medium mb-1">Impacto Estimado:</div>
                      <div className="text-sm">{alert.estimatedImpact}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span>
                        <strong>Actual:</strong> {alert.currentValue.toFixed(2)}
                      </span>
                      <span>
                        <strong>Umbral:</strong> {alert.threshold.toFixed(2)}
                      </span>
                      <span className={
                        alert.currentValue > alert.threshold ? 'text-red-600 font-bold' : 'text-green-600'
                      }>
                        <strong>Diferencia:</strong> +{(alert.currentValue - alert.threshold).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.severity === AlertSeverity.EMERGENCY && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onEmergencyContact('onemi')}
                          className="flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          ONEMI
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAlert(alert)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Detalles
                      </Button>

                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          onClick={() => onAlertAcknowledge(alert.id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Reconocer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardContent className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">
                Sistema Operando Normalmente
              </h3>
              <p className="text-green-600 dark:text-green-400">
                No hay alertas activas. Todos los parámetros dentro de rangos normales.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Emergency Contacts Quick Access */}
      {alertStats.emergency > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contactos de Emergencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(EMERGENCY_CONTACTS).map(([key, contact]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => onEmergencyContact(key)}
                >
                  <div className="text-left">
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-muted-foreground">{contact.phone}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
