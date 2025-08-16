/**
 * 🔬 Professional Sensor Data Types
 * 
 * Comprehensive TypeScript interfaces for hydrological sensor data
 * Following NCh 1333, WMO, and DGA Chile standards
 */

import { StationId, Timestamp } from './hydrology';

// 🌊 Core Sensor Reading Interface
export interface SensorReading<T = number> {
  readonly value: T;
  readonly timestamp: Timestamp;
  readonly quality: DataQuality;
  readonly calibrationOffset?: number;
  readonly uncertainty?: number; // ± measurement uncertainty
}

// 📊 Data Quality Levels (NCh 1333 Compliance)
export enum DataQuality {
  EXCELLENT = 'excellent',    // < 2% uncertainty
  GOOD = 'good',             // 2-5% uncertainty  
  FAIR = 'fair',             // 5-10% uncertainty
  POOR = 'poor',             // 10-25% uncertainty
  CRITICAL = 'critical',     // > 25% uncertainty
  INVALID = 'invalid'        // Sensor malfunction
}

// 🚨 Alert Severity Levels (Progressive System)
export enum AlertSeverity {
  NORMAL = 'normal',         // Within normal parameters
  WARNING = 'warning',       // Approaching thresholds
  CRITICAL = 'critical',     // Exceeded safe thresholds
  EMERGENCY = 'emergency'    // Immediate action required
}

// 🌡️ Water Level Sensor Data
export interface WaterLevelSensor {
  readonly level: SensorReading<number>;        // meters above datum
  readonly trend: 'rising' | 'falling' | 'stable';
  readonly rateOfChange: number;                // m/hour
  readonly floodStage: number;                  // critical level threshold
  readonly alertLevel: AlertSeverity;
}

// 🌊 Flow Rate Sensor Data  
export interface FlowRateSensor {
  readonly discharge: SensorReading<number>;    // m³/s
  readonly velocity: SensorReading<number>;     // m/s
  readonly crossSectionalArea: number;          // m²
  readonly alertLevel: AlertSeverity;
}

// 🌡️ Water Quality Sensors
export interface WaterQualitySensors {
  readonly temperature: SensorReading<number>;  // °C
  readonly pH: SensorReading<number>;           // pH units
  readonly dissolvedOxygen: SensorReading<number>; // mg/L
  readonly turbidity: SensorReading<number>;    // NTU
  readonly conductivity: SensorReading<number>; // µS/cm (volcanic monitoring)
  readonly totalDissolvedSolids: SensorReading<number>; // mg/L
}

// 🌧️ Meteorological Sensors
export interface MeteorologicalSensors {
  readonly precipitation: SensorReading<number>; // mm/hour
  readonly airTemperature: SensorReading<number>; // °C
  readonly humidity: SensorReading<number>;      // %
  readonly windSpeed: SensorReading<number>;     // km/h
  readonly windDirection: SensorReading<number>; // degrees
  readonly barometricPressure: SensorReading<number>; // hPa
}

// 🔋 Station Health Monitoring
export interface StationHealth {
  readonly battery: {
    readonly voltage: SensorReading<number>;     // V
    readonly current: SensorReading<number>;     // A
    readonly chargeLevel: SensorReading<number>; // %
    readonly temperature: SensorReading<number>; // °C
    readonly cycleCount: number;
    readonly estimatedLife: number;              // hours remaining
  };
  readonly solar: {
    readonly voltage: SensorReading<number>;     // V
    readonly current: SensorReading<number>;     // A
    readonly power: SensorReading<number>;       // W
    readonly efficiency: number;                 // %
  };
  readonly communication: {
    readonly signalStrength: SensorReading<number>; // dBm
    readonly dataRate: SensorReading<number>;    // kbps
    readonly packetLoss: SensorReading<number>;  // %
    readonly latency: SensorReading<number>;     // ms
  };
}

// 📡 Complete Station Data Package
export interface StationDataPackage {
  readonly stationId: StationId;
  readonly timestamp: Timestamp;
  readonly waterLevel: WaterLevelSensor;
  readonly flowRate: FlowRateSensor;
  readonly waterQuality: WaterQualitySensors;
  readonly meteorological: MeteorologicalSensors;
  readonly stationHealth: StationHealth;
  readonly overallStatus: AlertSeverity;
}

// 🎯 Threshold Configuration (DGA Chile Standards)
export interface ThresholdConfiguration {
  readonly parameter: string;
  readonly normal: { min: number; max: number };
  readonly warning: { min: number; max: number };
  readonly critical: { min: number; max: number };
  readonly emergency: { min: number; max: number };
  readonly unit: string;
  readonly description: string;
}

// 📈 Historical Data Point
export interface HistoricalDataPoint {
  readonly timestamp: Timestamp;
  readonly waterLevel: number;
  readonly flowRate: number;
  readonly temperature: number;
  readonly precipitation: number;
  readonly quality: DataQuality;
}

// 🔍 Data Analysis Results
export interface DataAnalysis {
  readonly trend: {
    readonly direction: 'increasing' | 'decreasing' | 'stable';
    readonly confidence: number; // 0-1
    readonly timeframe: string;
  };
  readonly statistics: {
    readonly mean: number;
    readonly median: number;
    readonly standardDeviation: number;
    readonly min: number;
    readonly max: number;
  };
  readonly predictions: {
    readonly nextHour: number;
    readonly next6Hours: number;
    readonly next24Hours: number;
    readonly confidence: number;
  };
}

// 🚨 Alert Definition
export interface Alert {
  readonly id: string;
  readonly stationId: StationId;
  readonly parameter: string;
  readonly severity: AlertSeverity;
  readonly currentValue: number;
  readonly threshold: number;
  readonly message: string;
  readonly timestamp: Timestamp;
  readonly acknowledged: boolean;
  readonly actionRequired: string;
  readonly estimatedImpact: string;
}

// 📊 Real-time Dashboard Data
export interface DashboardData {
  readonly stations: StationDataPackage[];
  readonly activeAlerts: Alert[];
  readonly systemHealth: 'operational' | 'degraded' | 'critical';
  readonly lastUpdate: Timestamp;
  readonly dataLatency: number; // seconds
}

// 🎨 Visualization Configuration
export interface VisualizationConfig {
  readonly colorScheme: {
    readonly waterLevel: string[];
    readonly precipitation: string[];
    readonly temperature: string[];
    readonly quality: string[];
  };
  readonly thresholds: ThresholdConfiguration[];
  readonly refreshInterval: number; // milliseconds
  readonly animationDuration: number; // milliseconds
}
