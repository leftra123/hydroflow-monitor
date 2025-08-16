# 🏗️ Arquitectura de Datos y Backend - Sistema Hidrológico

**Diseño técnico del backend, base de datos e integración de fuentes externas**

---

## 🗄️ **ARQUITECTURA DE BASE DE DATOS**

### **Diseño de Series Temporales**
```sql
-- Tabla principal de mediciones en tiempo real
CREATE TABLE measurements (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(20) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    parameter VARCHAR(50) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    quality_flag INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices optimizados para consultas temporales
CREATE INDEX idx_measurements_station_time 
ON measurements (station_id, timestamp DESC);

CREATE INDEX idx_measurements_parameter_time 
ON measurements (parameter, timestamp DESC);
```

### **Estructura de Estaciones**
```sql
-- Configuración de estaciones de monitoreo
CREATE TABLE stations (
    station_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    elevation DECIMAL(8,2),
    installation_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB
);

-- Parámetros monitoreados por estación
CREATE TABLE station_parameters (
    station_id VARCHAR(20) REFERENCES stations(station_id),
    parameter VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    min_value DECIMAL(10,4),
    max_value DECIMAL(10,4),
    warning_threshold DECIMAL(10,4),
    critical_threshold DECIMAL(10,4),
    PRIMARY KEY (station_id, parameter)
);
```

### **Datos de Laboratorio**
```sql
-- Resultados de análisis de laboratorio
CREATE TABLE lab_results (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(20) REFERENCES stations(station_id),
    sample_date TIMESTAMPTZ NOT NULL,
    analysis_date TIMESTAMPTZ,
    parameter VARCHAR(50) NOT NULL,
    value DECIMAL(10,4),
    unit VARCHAR(20),
    detection_limit DECIMAL(10,4),
    method VARCHAR(100),
    lab_id VARCHAR(50),
    quality_flag INTEGER DEFAULT 1
);
```

---

## 🔗 **INTEGRACIÓN DE FUENTES EXTERNAS**

### **API de Datos Meteorológicos (DMC)**
```typescript
// Servicio de integración meteorológica
export class MeteorologicalService {
  private readonly DMC_API_URL = 'https://climatologia.meteochile.gob.cl/application/productos/boletinClimatologico';
  
  async fetchWeatherData(stationCode: string): Promise<WeatherData> {
    try {
      const response = await fetch(`${this.DMC_API_URL}/estacion/${stationCode}`);
      const data = await response.json();
      
      return {
        timestamp: new Date(data.fecha),
        temperature: data.temperatura,
        humidity: data.humedad,
        precipitation: data.precipitacion,
        windSpeed: data.viento_velocidad,
        windDirection: data.viento_direccion,
        pressure: data.presion
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch meteorological data');
    }
  }
  
  async fetchForecast(latitude: number, longitude: number): Promise<ForecastData[]> {
    // Integración con pronósticos de precipitación
    const forecastUrl = `${this.DMC_API_URL}/pronostico/coordenadas/${latitude}/${longitude}`;
    // Implementación específica según API disponible
  }
}
```

### **Integración DGA (Dirección General de Aguas)**
```typescript
// Servicio de datos hidrométricos nacionales
export class DGAService {
  private readonly DGA_API_URL = 'https://snia.mop.gob.cl/BNAConsultas/reportes';
  
  async fetchHydrometricData(stationCode: string, startDate: Date, endDate: Date): Promise<HydrometricData[]> {
    const params = new URLSearchParams({
      codigo_estacion: stationCode,
      fecha_inicio: startDate.toISOString().split('T')[0],
      fecha_fin: endDate.toISOString().split('T')[0],
      formato: 'json'
    });
    
    try {
      const response = await fetch(`${this.DGA_API_URL}?${params}`);
      const data = await response.json();
      
      return data.map((record: any) => ({
        timestamp: new Date(record.fecha),
        waterLevel: record.nivel_agua,
        discharge: record.caudal,
        stationCode: record.codigo_estacion
      }));
    } catch (error) {
      console.error('Error fetching DGA data:', error);
      throw new Error('Failed to fetch DGA hydrometric data');
    }
  }
}
```

### **Integración GIS (IDE Chile)**
```typescript
// Servicio de capas geoespaciales
export class GISService {
  private readonly IDE_CHILE_URL = 'https://www.ide.cl/geoserver/wms';
  
  async fetchWMSLayer(layerName: string, bbox: BoundingBox): Promise<GISLayer> {
    const params = new URLSearchParams({
      service: 'WMS',
      version: '1.1.0',
      request: 'GetMap',
      layers: layerName,
      bbox: `${bbox.minX},${bbox.minY},${bbox.maxX},${bbox.maxY}`,
      width: '512',
      height: '512',
      srs: 'EPSG:4326',
      format: 'image/png'
    });
    
    return {
      name: layerName,
      url: `${this.IDE_CHILE_URL}?${params}`,
      type: 'WMS',
      opacity: 0.7
    };
  }
  
  // Capas prioritarias para el sistema
  async getHydrographicNetwork(): Promise<GISLayer> {
    return this.fetchWMSLayer('hidrografia:red_hidrografica', {
      minX: -72.2, minY: -39.5, maxX: -71.5, maxY: -39.0
    });
  }
  
  async getProtectedAreas(): Promise<GISLayer> {
    return this.fetchWMSLayer('areas_protegidas:parques_nacionales', {
      minX: -72.2, minY: -39.5, maxX: -71.5, maxY: -39.0
    });
  }
  
  async getFloodRiskZones(): Promise<GISLayer> {
    return this.fetchWMSLayer('riesgos:zonas_inundacion', {
      minX: -72.2, minY: -39.5, maxX: -71.5, maxY: -39.0
    });
  }
}
```

---

## 🚀 **API PÚBLICA**

### **Especificación OpenAPI**
```yaml
openapi: 3.0.0
info:
  title: Río Claro Monitoring API
  version: 1.0.0
  description: API pública para acceso a datos hidrológicos del Río Claro
  
servers:
  - url: https://api.rioclaro.cl/v1
    description: Servidor de producción

paths:
  /stations:
    get:
      summary: Lista todas las estaciones de monitoreo
      responses:
        '200':
          description: Lista de estaciones
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Station'
  
  /stations/{stationId}/measurements:
    get:
      summary: Obtiene mediciones de una estación
      parameters:
        - name: stationId
          in: path
          required: true
          schema:
            type: string
        - name: parameter
          in: query
          schema:
            type: string
            enum: [water_level, discharge, temperature, ph, turbidity]
        - name: start_date
          in: query
          schema:
            type: string
            format: date-time
        - name: end_date
          in: query
          schema:
            type: string
            format: date-time
        - name: format
          in: query
          schema:
            type: string
            enum: [json, csv]
            default: json
      responses:
        '200':
          description: Datos de mediciones
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Measurement'

components:
  schemas:
    Station:
      type: object
      properties:
        station_id:
          type: string
        name:
          type: string
        latitude:
          type: number
        longitude:
          type: number
        elevation:
          type: number
        parameters:
          type: array
          items:
            type: string
    
    Measurement:
      type: object
      properties:
        timestamp:
          type: string
          format: date-time
        parameter:
          type: string
        value:
          type: number
        unit:
          type: string
        quality_flag:
          type: integer
```

### **Implementación del API**
```typescript
// Controlador principal del API
@Controller('/api/v1')
export class MonitoringAPIController {
  
  @Get('/stations')
  async getStations(): Promise<Station[]> {
    return await this.stationService.findAll();
  }
  
  @Get('/stations/:stationId/measurements')
  async getMeasurements(
    @Param('stationId') stationId: string,
    @Query('parameter') parameter?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('format') format: 'json' | 'csv' = 'json'
  ): Promise<Measurement[] | string> {
    
    const measurements = await this.measurementService.findByStation(
      stationId,
      {
        parameter,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    );
    
    if (format === 'csv') {
      return this.csvService.convertToCSV(measurements);
    }
    
    return measurements;
  }
  
  @Get('/stations/:stationId/current')
  async getCurrentStatus(@Param('stationId') stationId: string): Promise<StationStatus> {
    return await this.stationService.getCurrentStatus(stationId);
  }
  
  @Get('/alerts/active')
  async getActiveAlerts(): Promise<Alert[]> {
    return await this.alertService.getActiveAlerts();
  }
}
```

---

## 📊 **PROCESAMIENTO DE DATOS EN TIEMPO REAL**

### **Pipeline de Validación**
```typescript
// Servicio de validación de datos
export class DataValidationService {
  
  async validateMeasurement(measurement: RawMeasurement): Promise<ValidatedMeasurement> {
    const validationResult = {
      ...measurement,
      quality_flag: 1, // Buena calidad por defecto
      validation_errors: []
    };
    
    // Validación de rango físico
    const parameter = await this.getParameterConfig(measurement.parameter);
    if (measurement.value < parameter.min_value || measurement.value > parameter.max_value) {
      validationResult.quality_flag = 3; // Dato sospechoso
      validationResult.validation_errors.push('Valor fuera de rango físico');
    }
    
    // Validación de consistencia temporal
    const previousValue = await this.getPreviousMeasurement(
      measurement.station_id, 
      measurement.parameter
    );
    
    if (previousValue && Math.abs(measurement.value - previousValue.value) > parameter.max_change_rate) {
      validationResult.quality_flag = 2; // Dato dudoso
      validationResult.validation_errors.push('Cambio temporal anómalo');
    }
    
    // Validación cruzada entre estaciones
    if (measurement.parameter === 'water_level') {
      const correlatedStation = await this.getCorrelatedStation(measurement.station_id);
      if (correlatedStation) {
        const correlatedValue = await this.getCurrentValue(correlatedStation.id, 'water_level');
        const expectedCorrelation = this.calculateExpectedCorrelation(
          measurement.station_id, 
          correlatedStation.id
        );
        
        if (Math.abs(measurement.value - correlatedValue * expectedCorrelation) > 0.5) {
          validationResult.quality_flag = 2;
          validationResult.validation_errors.push('Inconsistencia espacial');
        }
      }
    }
    
    return validationResult;
  }
}
```

### **Sistema de Alertas Automáticas**
```typescript
// Servicio de generación de alertas
export class AlertService {
  
  async evaluateAlerts(measurement: ValidatedMeasurement): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const thresholds = await this.getThresholds(measurement.station_id, measurement.parameter);
    
    // Alerta por umbral crítico
    if (measurement.value >= thresholds.critical) {
      alerts.push({
        id: uuidv4(),
        station_id: measurement.station_id,
        parameter: measurement.parameter,
        level: 'CRITICAL',
        message: `${measurement.parameter} alcanzó nivel crítico: ${measurement.value} ${measurement.unit}`,
        timestamp: measurement.timestamp,
        value: measurement.value,
        threshold: thresholds.critical,
        status: 'ACTIVE'
      });
    }
    
    // Alerta por tendencia
    const trend = await this.calculateTrend(measurement.station_id, measurement.parameter, '1h');
    if (trend.slope > thresholds.trend_critical && measurement.parameter === 'water_level') {
      alerts.push({
        id: uuidv4(),
        station_id: measurement.station_id,
        parameter: measurement.parameter,
        level: 'WARNING',
        message: `Nivel del agua aumentando rápidamente: ${trend.slope.toFixed(2)} m/h`,
        timestamp: measurement.timestamp,
        trend: trend.slope,
        status: 'ACTIVE'
      });
    }
    
    return alerts;
  }
  
  async notifySubscribers(alert: Alert): Promise<void> {
    const subscribers = await this.getSubscribers(alert.station_id, alert.level);
    
    for (const subscriber of subscribers) {
      switch (subscriber.notification_method) {
        case 'EMAIL':
          await this.emailService.sendAlert(subscriber.email, alert);
          break;
        case 'SMS':
          await this.smsService.sendAlert(subscriber.phone, alert);
          break;
        case 'PUSH':
          await this.pushService.sendAlert(subscriber.device_token, alert);
          break;
      }
    }
  }
}
```

---

## 🔄 **SINCRONIZACIÓN Y BACKUP**

### **Estrategia de Backup**
```typescript
// Servicio de backup automático
export class BackupService {
  
  @Cron('0 2 * * *') // Diario a las 2 AM
  async dailyBackup(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Backup de mediciones del día anterior
    const measurements = await this.measurementService.findByDateRange(
      yesterday,
      new Date()
    );
    
    // Exportar a múltiples formatos
    await Promise.all([
      this.exportToS3(measurements, 'json'),
      this.exportToS3(measurements, 'csv'),
      this.exportToLocalStorage(measurements)
    ]);
    
    // Verificar integridad
    await this.verifyBackupIntegrity(yesterday);
  }
  
  @Cron('0 3 * * 0') // Semanal los domingos a las 3 AM
  async weeklyArchive(): Promise<void> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Archivar datos antiguos
    await this.archiveOldData(oneWeekAgo);
    
    // Generar reportes semanales
    await this.generateWeeklyReport(oneWeekAgo);
  }
}
```

### **Monitoreo de Salud del Sistema**
```typescript
// Servicio de monitoreo de salud
export class HealthMonitoringService {
  
  @Cron('*/5 * * * *') // Cada 5 minutos
  async checkSystemHealth(): Promise<void> {
    const healthStatus = {
      timestamp: new Date(),
      database: await this.checkDatabaseHealth(),
      stations: await this.checkStationsHealth(),
      external_apis: await this.checkExternalAPIs(),
      storage: await this.checkStorageHealth()
    };
    
    // Alertar si hay problemas críticos
    if (healthStatus.database.status === 'DOWN' || 
        healthStatus.stations.active_count < 2) {
      await this.alertService.sendSystemAlert(healthStatus);
    }
    
    // Registrar métricas
    await this.metricsService.recordHealthMetrics(healthStatus);
  }
  
  private async checkStationsHealth(): Promise<StationHealthStatus> {
    const stations = await this.stationService.findAll();
    const healthChecks = await Promise.all(
      stations.map(station => this.checkStationHealth(station.station_id))
    );
    
    return {
      total_stations: stations.length,
      active_count: healthChecks.filter(h => h.status === 'ACTIVE').length,
      last_data_received: Math.max(...healthChecks.map(h => h.last_data_time)),
      stations: healthChecks
    };
  }
}
```

---

**Versión**: 1.0  
**Fecha**: Diciembre 2024  
**Responsable**: Equipo Backend HydroFlow
