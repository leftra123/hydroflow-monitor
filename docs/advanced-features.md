# 🚀 Funcionalidades Avanzadas - Sistema Río Claro

**Implementación de características de vanguardia para el sistema de monitoreo hidrológico**

---

## 🔮 **MODELO PREDICTIVO HIDROLÓGICO**

### **Arquitectura del Modelo**
```python
# Modelo de predicción hidrológica basado en Machine Learning
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

class HydrologicalPredictionModel:
    def __init__(self):
        self.rainfall_runoff_model = RandomForestRegressor(n_estimators=100)
        self.lstm_model = self.build_lstm_model()
        self.scaler = StandardScaler()
        
    def build_lstm_model(self):
        """Modelo LSTM para predicción de series temporales"""
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(24, 6)),  # 24h lookback, 6 features
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25),
            Dense(1)  # Predicción de nivel de agua
        ])
        
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        return model
    
    def prepare_features(self, weather_forecast, current_conditions):
        """Preparar características para predicción"""
        features = {
            # Datos meteorológicos
            'precipitation_forecast': weather_forecast['precipitation'],
            'temperature_forecast': weather_forecast['temperature'],
            'humidity_forecast': weather_forecast['humidity'],
            
            # Condiciones actuales del río
            'current_water_level': current_conditions['water_level'],
            'current_discharge': current_conditions['discharge'],
            'current_temperature': current_conditions['temperature'],
            
            # Características de la cuenca
            'antecedent_precipitation': self.calculate_antecedent_precipitation(),
            'soil_moisture_index': self.estimate_soil_moisture(),
            'snow_melt_factor': self.calculate_snow_melt(),
            
            # Características temporales
            'hour_of_day': pd.Timestamp.now().hour,
            'day_of_year': pd.Timestamp.now().dayofyear,
            'season': self.get_season()
        }
        
        return pd.DataFrame([features])
    
    def predict_water_level(self, forecast_hours=6):
        """Predecir nivel del agua para las próximas horas"""
        # Obtener datos de entrada
        weather_forecast = self.get_weather_forecast(forecast_hours)
        current_conditions = self.get_current_conditions()
        
        # Preparar características
        features = self.prepare_features(weather_forecast, current_conditions)
        features_scaled = self.scaler.transform(features)
        
        # Generar predicciones
        predictions = []
        for hour in range(1, forecast_hours + 1):
            # Ajustar características para la hora específica
            hour_features = self.adjust_features_for_hour(features_scaled, hour)
            
            # Predicción con LSTM
            lstm_pred = self.lstm_model.predict(hour_features.reshape(1, 24, 6))
            
            # Predicción con Random Forest (ensemble)
            rf_pred = self.rainfall_runoff_model.predict(hour_features.reshape(1, -1))
            
            # Combinar predicciones (ensemble)
            final_pred = 0.7 * lstm_pred[0][0] + 0.3 * rf_pred[0]
            
            predictions.append({
                'timestamp': pd.Timestamp.now() + pd.Timedelta(hours=hour),
                'predicted_water_level': final_pred,
                'confidence_interval': self.calculate_confidence_interval(final_pred),
                'risk_level': self.assess_risk_level(final_pred)
            })
        
        return predictions
```

### **Integración con Dashboard**
```typescript
// Componente de predicción hidrológica
export const HydrologicalForecast: React.FC<{stationId: string}> = ({ stationId }) => {
  const [forecast, setForecast] = useState<PredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchForecast = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/stations/${stationId}/forecast`);
        const data = await response.json();
        setForecast(data.predictions);
      } catch (error) {
        console.error('Error fetching forecast:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchForecast();
    const interval = setInterval(fetchForecast, 30 * 60 * 1000); // Actualizar cada 30 min
    
    return () => clearInterval(interval);
  }, [stationId]);
  
  return (
    <Card className="forecast-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crystal className="w-5 h-5 text-blue-500" />
          Pronóstico Hidrológico (6 horas)
        </CardTitle>
        <CardDescription>
          Predicción basada en condiciones meteorológicas y modelo de cuenca
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="loading-state">
            <Spinner />
            <span>Generando pronóstico...</span>
          </div>
        ) : (
          <>
            {/* Gráfico de pronóstico */}
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecast}>
                {/* Área de confianza */}
                <Area
                  dataKey="confidence_upper"
                  stroke="none"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
                <Area
                  dataKey="confidence_lower"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                />
                
                {/* Línea de predicción */}
                <Line
                  type="monotone"
                  dataKey="predicted_water_level"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
                
                {/* Umbrales de riesgo */}
                <ReferenceLine
                  y={3.0}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label="Nivel Crítico"
                />
                
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(time) => format(new Date(time), 'HH:mm')}
                />
                <YAxis
                  label={{ value: 'Nivel (m)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  content={<ForecastTooltip />}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Alertas de pronóstico */}
            {forecast.some(p => p.risk_level === 'HIGH') && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Alerta de Pronóstico</AlertTitle>
                <AlertDescription>
                  Se prevé que el nivel del agua supere umbrales críticos en las próximas horas.
                  Tiempo estimado hasta nivel crítico: {calculateTimeToThreshold(forecast)}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Resumen del pronóstico */}
            <div className="forecast-summary mt-4">
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Nivel Máximo Previsto</span>
                  <span className="value">
                    {Math.max(...forecast.map(f => f.predicted_water_level)).toFixed(2)} m
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Hora del Pico</span>
                  <span className="value">
                    {format(new Date(getPeakTime(forecast)), 'HH:mm')}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Confianza del Modelo</span>
                  <span className="value">
                    {calculateModelConfidence(forecast)}%
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## 👥 **MÓDULO DE CIENCIA CIUDADANA**

### **Sistema de Reportes Ciudadanos**
```typescript
// Interfaz para reportes de ciencia ciudadana
export interface CitizenReport {
  id: string;
  userId: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  reportType: 'pollution' | 'erosion' | 'debris' | 'wildlife' | 'infrastructure' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  photos: string[];
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: Date;
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
}

// Componente de reporte ciudadano
export const CitizenReportForm: React.FC = () => {
  const [report, setReport] = useState<Partial<CitizenReport>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Obtener ubicación actual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Subir fotos
      const photoUrls = await Promise.all(
        photos.map(photo => uploadPhoto(photo))
      );
      
      // Crear reporte
      const newReport: Partial<CitizenReport> = {
        ...report,
        timestamp: new Date(),
        location: location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy
        } : undefined,
        photos: photoUrls,
        status: 'pending'
      };
      
      await submitReport(newReport);
      
      // Mostrar confirmación
      toast.success('Reporte enviado exitosamente. Será revisado por nuestro equipo.');
      
      // Limpiar formulario
      setReport({});
      setPhotos([]);
      
    } catch (error) {
      toast.error('Error al enviar el reporte. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="citizen-report-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          Reportar Observación
        </CardTitle>
        <CardDescription>
          Ayúdanos a monitorear el río reportando anomalías o problemas que observes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de reporte */}
          <div className="form-group">
            <label className="form-label">Tipo de Observación</label>
            <Select
              value={report.reportType}
              onValueChange={(value) => setReport({...report, reportType: value as any})}
            >
              <SelectItem value="pollution">🏭 Contaminación</SelectItem>
              <SelectItem value="erosion">🏔️ Erosión</SelectItem>
              <SelectItem value="debris">🗑️ Basura/Desechos</SelectItem>
              <SelectItem value="wildlife">🐟 Fauna Afectada</SelectItem>
              <SelectItem value="infrastructure">🔧 Infraestructura Dañada</SelectItem>
              <SelectItem value="other">❓ Otro</SelectItem>
            </Select>
          </div>
          
          {/* Severidad */}
          <div className="form-group">
            <label className="form-label">Nivel de Severidad</label>
            <RadioGroup
              value={report.severity}
              onValueChange={(value) => setReport({...report, severity: value as any})}
            >
              <div className="radio-item">
                <RadioGroupItem value="low" />
                <span className="text-green-600">🟢 Bajo - Observación menor</span>
              </div>
              <div className="radio-item">
                <RadioGroupItem value="medium" />
                <span className="text-yellow-600">🟡 Medio - Requiere atención</span>
              </div>
              <div className="radio-item">
                <RadioGroupItem value="high" />
                <span className="text-orange-600">🟠 Alto - Problema significativo</span>
              </div>
              <div className="radio-item">
                <RadioGroupItem value="critical" />
                <span className="text-red-600">🔴 Crítico - Emergencia</span>
              </div>
            </RadioGroup>
          </div>
          
          {/* Descripción */}
          <div className="form-group">
            <label className="form-label">Descripción Detallada</label>
            <Textarea
              value={report.description || ''}
              onChange={(e) => setReport({...report, description: e.target.value})}
              placeholder="Describe lo que observaste: ubicación específica, qué viste, cuándo ocurrió, etc."
              rows={4}
              required
            />
          </div>
          
          {/* Fotos */}
          <div className="form-group">
            <label className="form-label">Fotografías (Opcional)</label>
            <div className="photo-upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="upload-button">
                <Camera className="w-4 h-4" />
                Agregar Fotos
              </label>
              
              {photos.length > 0 && (
                <div className="photo-preview">
                  {photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Foto ${index + 1}`}
                        className="photo-thumbnail"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                        className="remove-photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Ubicación */}
          <div className="form-group">
            <label className="form-label">Ubicación</label>
            {location ? (
              <div className="location-info">
                <MapPin className="w-4 h-4 text-green-500" />
                <span>
                  Ubicación detectada: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </span>
                <span className="accuracy">
                  (Precisión: ±{Math.round(location.coords.accuracy)}m)
                </span>
              </div>
            ) : (
              <div className="location-loading">
                <Spinner className="w-4 h-4" />
                <span>Obteniendo ubicación...</span>
              </div>
            )}
          </div>
          
          {/* Botón de envío */}
          <Button
            type="submit"
            disabled={isSubmitting || !report.reportType || !report.description}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Enviando Reporte...
              </>
            ) : (
              'Enviar Reporte'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

### **Panel de Verificación para Autoridades**
```typescript
// Panel de administración para verificar reportes ciudadanos
export const ReportVerificationPanel: React.FC = () => {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  
  const handleVerifyReport = async (reportId: string, verified: boolean, notes?: string) => {
    try {
      await fetch(`/api/v1/citizen-reports/${reportId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified, notes })
      });
      
      // Actualizar lista
      setReports(reports.map(r => 
        r.id === reportId 
          ? { ...r, verified, status: verified ? 'verified' : 'rejected' }
          : r
      ));
      
      toast.success(`Reporte ${verified ? 'verificado' : 'rechazado'} exitosamente`);
    } catch (error) {
      toast.error('Error al procesar el reporte');
    }
  };
  
  return (
    <div className="verification-panel">
      <div className="panel-header">
        <h2>Verificación de Reportes Ciudadanos</h2>
        <div className="filter-controls">
          <Select value={filter} onValueChange={setFilter}>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </Select>
        </div>
      </div>
      
      <div className="reports-grid">
        {/* Lista de reportes */}
        <div className="reports-list">
          {reports
            .filter(r => filter === 'all' || r.status === 'pending')
            .map(report => (
              <Card
                key={report.id}
                className={`report-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="report-header">
                  <span className={`severity-badge ${report.severity}`}>
                    {getSeverityIcon(report.severity)} {report.severity.toUpperCase()}
                  </span>
                  <span className="report-type">
                    {getReportTypeIcon(report.reportType)} {report.reportType}
                  </span>
                  <span className="timestamp">
                    {formatDistanceToNow(report.timestamp)} ago
                  </span>
                </div>
                
                <div className="report-preview">
                  <p>{report.description.substring(0, 100)}...</p>
                  {report.photos.length > 0 && (
                    <div className="photo-count">
                      📷 {report.photos.length} foto{report.photos.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                <div className="report-location">
                  📍 {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                </div>
              </Card>
            ))}
        </div>
        
        {/* Detalle del reporte seleccionado */}
        {selectedReport && (
          <Card className="report-detail">
            <CardHeader>
              <CardTitle>Detalle del Reporte</CardTitle>
              <CardDescription>
                Reportado el {format(selectedReport.timestamp, 'dd/MM/yyyy HH:mm')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="detail-sections">
                {/* Información básica */}
                <div className="detail-section">
                  <h4>Información</h4>
                  <div className="info-grid">
                    <div>
                      <strong>Tipo:</strong> {selectedReport.reportType}
                    </div>
                    <div>
                      <strong>Severidad:</strong> {selectedReport.severity}
                    </div>
                    <div>
                      <strong>Estado:</strong> {selectedReport.status}
                    </div>
                  </div>
                </div>
                
                {/* Descripción */}
                <div className="detail-section">
                  <h4>Descripción</h4>
                  <p>{selectedReport.description}</p>
                </div>
                
                {/* Fotos */}
                {selectedReport.photos.length > 0 && (
                  <div className="detail-section">
                    <h4>Fotografías</h4>
                    <div className="photo-gallery">
                      {selectedReport.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="gallery-photo"
                          onClick={() => openPhotoModal(photo)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Mapa de ubicación */}
                <div className="detail-section">
                  <h4>Ubicación</h4>
                  <div className="location-map">
                    <ReportLocationMap
                      latitude={selectedReport.location.latitude}
                      longitude={selectedReport.location.longitude}
                      accuracy={selectedReport.location.accuracy}
                    />
                  </div>
                </div>
                
                {/* Acciones de verificación */}
                {selectedReport.status === 'pending' && (
                  <div className="verification-actions">
                    <Button
                      variant="default"
                      onClick={() => handleVerifyReport(selectedReport.id, true)}
                      className="verify-button"
                    >
                      ✅ Verificar Reporte
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleVerifyReport(selectedReport.id, false)}
                      className="reject-button"
                    >
                      ❌ Rechazar Reporte
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
```

---

## 📚 **CONTENIDO EDUCATIVO Y NARRATIVO**

### **Sistema de Data Storytelling**
```typescript
// Generador de historias de datos interactivas
export class DataStorytellingService {
  
  async generateWaterQualityStory(stationId: string, timeRange: string): Promise<DataStory> {
    const data = await this.getWaterQualityData(stationId, timeRange);
    const weatherEvents = await this.getWeatherEvents(timeRange);
    const landUseData = await this.getLandUseData(stationId);
    
    return {
      title: "La Historia de la Calidad del Agua en el Río Claro",
      chapters: [
        {
          title: "El Punto de Partida",
          content: `En la estación ${stationId}, comenzamos nuestro viaje siguiendo la calidad del agua...`,
          visualization: {
            type: 'timeseries',
            data: data.baseline,
            highlight: 'initial_conditions'
          },
          insights: [
            "El río mantiene condiciones prístinas en su cabecera",
            "Los valores de pH se mantienen en rango óptimo (7.2-7.8)",
            "La temperatura refleja el origen glacial del agua"
          ]
        },
        {
          title: "El Impacto de la Lluvia",
          content: `Cuando llueve en la cuenca, observamos cambios dramáticos...`,
          visualization: {
            type: 'correlation',
            data: this.correlatePrecipitationWithTurbidity(data, weatherEvents),
            highlight: 'rainfall_events'
          },
          insights: [
            "La turbidez aumenta 300% durante eventos de lluvia",
            "El efecto es más pronunciado en zonas con agricultura",
            "La recuperación toma 24-48 horas después de la lluvia"
          ]
        },
        {
          title: "La Influencia Humana",
          content: `A medida que el río atraviesa zonas habitadas...`,
          visualization: {
            type: 'spatial_analysis',
            data: this.analyzeSpatialImpact(data, landUseData),
            highlight: 'human_impact_zones'
          },
          insights: [
            "La conductividad aumenta 15% en zonas urbanas",
            "Los nutrientes se incrementan cerca de áreas agrícolas",
            "La temperatura sube 2°C en sectores sin vegetación ribereña"
          ]
        }
      ],
      interactiveElements: [
        {
          type: 'slider',
          parameter: 'time',
          description: 'Explora cómo cambian los parámetros a lo largo del tiempo'
        },
        {
          type: 'layer_toggle',
          parameter: 'land_use',
          description: 'Activa/desactiva capas de uso de suelo para ver su impacto'
        }
      ],
      callToAction: {
        title: "¿Cómo Puedes Ayudar?",
        actions: [
          "Reporta anomalías que observes en el río",
          "Participa en actividades de limpieza",
          "Adopta prácticas sostenibles en tu hogar"
        ]
      }
    };
  }
}

// Componente de historia interactiva
export const InteractiveDataStory: React.FC<{story: DataStory}> = ({ story }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [interactiveParams, setInteractiveParams] = useState({});
  
  return (
    <div className="data-story">
      <div className="story-header">
        <h1>{story.title}</h1>
        <div className="chapter-navigation">
          {story.chapters.map((chapter, index) => (
            <button
              key={index}
              className={`chapter-button ${index === currentChapter ? 'active' : ''}`}
              onClick={() => setCurrentChapter(index)}
            >
              {index + 1}. {chapter.title}
            </button>
          ))}
        </div>
      </div>
      
      <div className="story-content">
        <div className="chapter-content">
          <h2>{story.chapters[currentChapter].title}</h2>
          <p>{story.chapters[currentChapter].content}</p>
          
          {/* Visualización interactiva */}
          <div className="story-visualization">
            <StoryVisualization
              config={story.chapters[currentChapter].visualization}
              interactiveParams={interactiveParams}
            />
          </div>
          
          {/* Insights clave */}
          <div className="key-insights">
            <h3>Descubrimientos Clave</h3>
            <ul>
              {story.chapters[currentChapter].insights.map((insight, index) => (
                <li key={index} className="insight-item">
                  💡 {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Controles interactivos */}
        <div className="interactive-controls">
          <h3>Explora los Datos</h3>
          {story.interactiveElements.map((element, index) => (
            <div key={index} className="control-group">
              <label>{element.description}</label>
              {element.type === 'slider' && (
                <Slider
                  value={[interactiveParams[element.parameter] || 0]}
                  onValueChange={(value) => 
                    setInteractiveParams({...interactiveParams, [element.parameter]: value[0]})
                  }
                  max={100}
                  step={1}
                />
              )}
              {element.type === 'layer_toggle' && (
                <Switch
                  checked={interactiveParams[element.parameter] || false}
                  onCheckedChange={(checked) =>
                    setInteractiveParams({...interactiveParams, [element.parameter]: checked})
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Call to Action */}
      {currentChapter === story.chapters.length - 1 && (
        <div className="call-to-action">
          <h3>{story.callToAction.title}</h3>
          <div className="action-buttons">
            {story.callToAction.actions.map((action, index) => (
              <Button key={index} variant="outline" className="action-button">
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

**Versión**: 1.0  
**Fecha**: Diciembre 2024  
**Responsable**: Equipo de Innovación HydroFlow
