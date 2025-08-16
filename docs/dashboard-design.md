# 📱 Diseño del Dashboard de Visualización - Río Claro

**Especificaciones de UX/UI para las tres audiencias objetivo del sistema**

---

## 🎯 **ARQUITECTURA DE AUDIENCIAS**

### **👥 Vista Pública (Turistas y Público General)**
- **Objetivo**: Información clara sobre seguridad y condiciones actuales
- **Complejidad**: Baja - Indicadores visuales simples
- **Dispositivos**: Móvil-first, responsive
- **Idiomas**: Español e Inglés

### **🚨 Vista Gestores (Emergencias y Autoridades)**
- **Objetivo**: Alertas tempranas y datos para toma de decisiones
- **Complejidad**: Media - Dashboards especializados
- **Dispositivos**: Desktop y móvil
- **Acceso**: Autenticado con roles

### **🔬 Vista Científica (Investigadores y Técnicos)**
- **Objetivo**: Análisis avanzado y acceso a datos históricos
- **Complejidad**: Alta - Herramientas de análisis
- **Dispositivos**: Desktop principalmente
- **Acceso**: Autenticado con permisos especiales

---

## 🗺️ **VISTA PRINCIPAL - MAPA INTERACTIVO**

### **Componentes del Mapa Base**
```typescript
// Configuración del mapa principal
export const MapConfig = {
  center: [-39.2794, -71.9752], // Pucón
  zoom: 12,
  baseLayers: [
    {
      name: 'Satelital',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri, Maxar, GeoEye'
    },
    {
      name: 'Topográfico',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri'
    },
    {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: 'OpenStreetMap contributors'
    }
  ]
};

// Estaciones de monitoreo
export const StationMarkers = [
  {
    id: 'claro_alto',
    name: 'El Claro Alto',
    position: [-39.2500, -71.8500],
    type: 'upstream',
    icon: 'water-sensor',
    description: 'Estación de cabecera - Condiciones prístinas'
  },
  {
    id: 'salto_claro',
    name: 'Salto El Claro',
    position: [-39.2794, -71.9752],
    type: 'downstream',
    icon: 'water-sensor',
    description: 'Zona turística - Monitoreo de impacto'
  }
];
```

### **Sistema de Códigos de Color**
```css
/* Estados de seguridad del río */
.river-status-safe {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: 2px solid #047857;
}

.river-status-caution {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: 2px solid #b45309;
}

.river-status-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: 2px solid #b91c1c;
  animation: pulse 2s infinite;
}

.river-status-closed {
  background: linear-gradient(135deg, #7c2d12, #451a03);
  color: white;
  border: 2px solid #292524;
  animation: blink 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}
```

### **Panel de Estado Dinámico**
```typescript
// Componente de estado de estación
export const StationStatusPanel: React.FC<{station: Station}> = ({ station }) => {
  const currentStatus = useStationStatus(station.id);
  const weatherData = useWeatherData(station.position);
  
  return (
    <div className={`station-panel ${getStatusClass(currentStatus.level)}`}>
      {/* Encabezado con estado */}
      <div className="panel-header">
        <h3>{station.name}</h3>
        <StatusBadge level={currentStatus.level} />
      </div>
      
      {/* Métricas principales */}
      <div className="metrics-grid">
        <MetricCard
          icon="📏"
          label="Nivel del Río"
          value={`${currentStatus.waterLevel.toFixed(2)} m`}
          trend={currentStatus.waterLevelTrend}
          context={getWaterLevelContext(currentStatus.waterLevel)}
        />
        
        <MetricCard
          icon="🌊"
          label="Caudal"
          value={`${currentStatus.discharge.toFixed(1)} m³/s`}
          trend={currentStatus.dischargeTrend}
          context={getDischargeContext(currentStatus.discharge)}
        />
        
        <MetricCard
          icon="🌡️"
          label="Temperatura"
          value={`${currentStatus.temperature.toFixed(1)}°C`}
          context={getTemperatureContext(currentStatus.temperature)}
        />
        
        <MetricCard
          icon="💧"
          label="Calidad"
          value={getQualityRating(currentStatus.quality)}
          context="Basado en turbidez y pH"
        />
      </div>
      
      {/* Información contextual */}
      <div className="context-info">
        <p className="status-message">
          {generateStatusMessage(currentStatus)}
        </p>
        
        {weatherData.precipitation > 0 && (
          <div className="weather-alert">
            <span className="icon">🌧️</span>
            <span>Lluvia actual: {weatherData.precipitation} mm/h</span>
          </div>
        )}
        
        <div className="last-update">
          Última actualización: {formatTime(currentStatus.timestamp)}
        </div>
      </div>
      
      {/* Acciones rápidas */}
      <div className="quick-actions">
        <button onClick={() => showDetailedView(station.id)}>
          Ver Detalles
        </button>
        <button onClick={() => showHistoricalData(station.id)}>
          Datos Históricos
        </button>
      </div>
    </div>
  );
};
```

---

## 📊 **VISTA DETALLADA DE ESTACIÓN**

### **Gráficos Interactivos de Series Temporales**
```typescript
// Componente de gráfico temporal avanzado
export const TimeSeriesChart: React.FC<{
  stationId: string;
  parameter: string;
  timeRange: TimeRange;
}> = ({ stationId, parameter, timeRange }) => {
  
  const data = useTimeSeriesData(stationId, parameter, timeRange);
  const thresholds = useParameterThresholds(stationId, parameter);
  const historicalStats = useHistoricalStats(stationId, parameter);
  
  return (
    <div className="timeseries-container">
      {/* Controles del gráfico */}
      <div className="chart-controls">
        <TimeRangeSelector
          value={timeRange}
          onChange={setTimeRange}
          options={['24h', '7d', '30d', '1y', 'all']}
        />
        
        <ParameterSelector
          value={parameter}
          onChange={setParameter}
          options={getAvailableParameters(stationId)}
        />
        
        <div className="chart-options">
          <Toggle label="Mostrar umbrales" />
          <Toggle label="Mostrar tendencia" />
          <Toggle label="Mostrar percentiles" />
        </div>
      </div>
      
      {/* Gráfico principal */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          {/* Área de percentiles históricos */}
          <Area
            dataKey="percentile_75"
            stroke="none"
            fill="#e5e7eb"
            fillOpacity={0.3}
          />
          <Area
            dataKey="percentile_25"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
          />
          
          {/* Líneas de umbral */}
          <ReferenceLine
            y={thresholds.warning}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            label="Precaución"
          />
          <ReferenceLine
            y={thresholds.critical}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label="Crítico"
          />
          
          {/* Serie de datos principal */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#2563eb" }}
          />
          
          {/* Línea de tendencia */}
          <Line
            type="linear"
            dataKey="trend"
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
          />
          
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis
            domain={['dataMin - 10%', 'dataMax + 10%']}
            tickFormatter={(value) => `${value} ${getParameterUnit(parameter)}`}
          />
          
          <Tooltip
            content={<CustomTooltip parameter={parameter} />}
          />
          
          <Legend />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Estadísticas contextuales */}
      <div className="chart-stats">
        <StatCard
          label="Valor Actual"
          value={`${data[data.length - 1]?.value} ${getParameterUnit(parameter)}`}
          change={calculateChange(data)}
        />
        <StatCard
          label="Promedio 24h"
          value={`${calculateAverage(data, '24h')} ${getParameterUnit(parameter)}`}
        />
        <StatCard
          label="Máximo Histórico"
          value={`${historicalStats.max} ${getParameterUnit(parameter)}`}
          date={historicalStats.maxDate}
        />
        <StatCard
          label="Percentil Actual"
          value={`${calculatePercentile(data[data.length - 1]?.value, historicalStats)}%`}
        />
      </div>
    </div>
  );
};
```

---

## 🚨 **MÓDULO DE ALERTAS Y NOTIFICACIONES**

### **Sistema de Suscripción**
```typescript
// Servicio de gestión de suscripciones
export class NotificationSubscriptionService {
  
  async subscribe(subscription: AlertSubscription): Promise<void> {
    // Validar datos de suscripción
    await this.validateSubscription(subscription);
    
    // Guardar en base de datos
    await this.subscriptionRepository.save({
      ...subscription,
      id: uuidv4(),
      created_at: new Date(),
      verified: false
    });
    
    // Enviar verificación
    await this.sendVerification(subscription);
  }
  
  async createAlert(alert: Alert): Promise<void> {
    // Obtener suscriptores relevantes
    const subscribers = await this.getRelevantSubscribers(alert);
    
    // Enviar notificaciones
    await Promise.all(
      subscribers.map(subscriber => this.sendNotification(subscriber, alert))
    );
    
    // Registrar envío
    await this.logNotificationSent(alert, subscribers);
  }
  
  private async sendNotification(subscriber: Subscriber, alert: Alert): Promise<void> {
    const message = this.formatAlertMessage(alert, subscriber.language);
    
    switch (subscriber.method) {
      case 'EMAIL':
        await this.emailService.send({
          to: subscriber.email,
          subject: `🚨 Alerta Río Claro: ${alert.level}`,
          html: this.generateEmailTemplate(alert, message)
        });
        break;
        
      case 'SMS':
        await this.smsService.send({
          to: subscriber.phone,
          message: this.truncateForSMS(message)
        });
        break;
        
      case 'PUSH':
        await this.pushService.send({
          token: subscriber.deviceToken,
          title: `Alerta Río Claro`,
          body: message,
          data: { alertId: alert.id, stationId: alert.stationId }
        });
        break;
    }
  }
}
```

### **Interfaz de Configuración de Alertas**
```typescript
// Componente de configuración de alertas
export const AlertConfigurationPanel: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<AlertSubscription[]>([]);
  const [newSubscription, setNewSubscription] = useState<Partial<AlertSubscription>>({});
  
  return (
    <div className="alert-config-panel">
      <h2>Configuración de Alertas</h2>
      
      {/* Formulario de nueva suscripción */}
      <Card className="subscription-form">
        <CardHeader>
          <CardTitle>Nueva Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="form-grid">
            <div className="form-group">
              <label>Estación</label>
              <Select
                value={newSubscription.stationId}
                onValueChange={(value) => setNewSubscription({...newSubscription, stationId: value})}
              >
                <SelectItem value="claro_alto">El Claro Alto</SelectItem>
                <SelectItem value="salto_claro">Salto El Claro</SelectItem>
                <SelectItem value="all">Todas las estaciones</SelectItem>
              </Select>
            </div>
            
            <div className="form-group">
              <label>Parámetro</label>
              <Select
                value={newSubscription.parameter}
                onValueChange={(value) => setNewSubscription({...newSubscription, parameter: value})}
              >
                <SelectItem value="water_level">Nivel del agua</SelectItem>
                <SelectItem value="discharge">Caudal</SelectItem>
                <SelectItem value="temperature">Temperatura</SelectItem>
                <SelectItem value="all">Todos los parámetros</SelectItem>
              </Select>
            </div>
            
            <div className="form-group">
              <label>Nivel de Alerta</label>
              <div className="checkbox-group">
                <Checkbox
                  checked={newSubscription.levels?.includes('WARNING')}
                  onCheckedChange={(checked) => toggleLevel('WARNING', checked)}
                />
                <span>Precaución</span>
                
                <Checkbox
                  checked={newSubscription.levels?.includes('CRITICAL')}
                  onCheckedChange={(checked) => toggleLevel('CRITICAL', checked)}
                />
                <span>Crítico</span>
                
                <Checkbox
                  checked={newSubscription.levels?.includes('EMERGENCY')}
                  onCheckedChange={(checked) => toggleLevel('EMERGENCY', checked)}
                />
                <span>Emergencia</span>
              </div>
            </div>
            
            <div className="form-group">
              <label>Método de Notificación</label>
              <RadioGroup
                value={newSubscription.method}
                onValueChange={(value) => setNewSubscription({...newSubscription, method: value})}
              >
                <div className="radio-item">
                  <RadioGroupItem value="EMAIL" />
                  <label>Email</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={newSubscription.email || ''}
                    onChange={(e) => setNewSubscription({...newSubscription, email: e.target.value})}
                  />
                </div>
                
                <div className="radio-item">
                  <RadioGroupItem value="SMS" />
                  <label>SMS</label>
                  <Input
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={newSubscription.phone || ''}
                    onChange={(e) => setNewSubscription({...newSubscription, phone: e.target.value})}
                  />
                </div>
                
                <div className="radio-item">
                  <RadioGroupItem value="PUSH" />
                  <label>Notificación Push</label>
                  <Button onClick={requestPushPermission}>
                    Habilitar Notificaciones
                  </Button>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <Button onClick={handleSubscribe} className="w-full">
            Suscribirse a Alertas
          </Button>
        </CardContent>
      </Card>
      
      {/* Lista de suscripciones existentes */}
      <Card className="existing-subscriptions">
        <CardHeader>
          <CardTitle>Mis Suscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.map(subscription => (
            <div key={subscription.id} className="subscription-item">
              <div className="subscription-info">
                <span className="station">{subscription.stationName}</span>
                <span className="parameter">{subscription.parameterName}</span>
                <span className="method">{subscription.method}</span>
                <span className="levels">{subscription.levels.join(', ')}</span>
              </div>
              <div className="subscription-actions">
                <Button variant="outline" size="sm" onClick={() => editSubscription(subscription.id)}>
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteSubscription(subscription.id)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## 🔬 **MÓDULO DE ANÁLISIS AVANZADO**

### **Análisis Diferencial Entre Estaciones**
```typescript
// Componente de análisis diferencial
export const DifferentialAnalysis: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [parameter, setParameter] = useState<string>('water_level');
  
  const upstreamData = useTimeSeriesData('claro_alto', parameter, timeRange);
  const downstreamData = useTimeSeriesData('salto_claro', parameter, timeRange);
  const differentialData = calculateDifferential(upstreamData, downstreamData);
  
  return (
    <div className="differential-analysis">
      <h2>Análisis Diferencial Entre Estaciones</h2>
      
      {/* Controles */}
      <div className="analysis-controls">
        <ParameterSelector value={parameter} onChange={setParameter} />
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>
      
      {/* Gráfico comparativo */}
      <Card className="comparison-chart">
        <CardHeader>
          <CardTitle>Comparación Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <Line
                dataKey="upstream"
                stroke="#2563eb"
                name="El Claro Alto"
                data={upstreamData}
              />
              <Line
                dataKey="downstream"
                stroke="#dc2626"
                name="Salto El Claro"
                data={downstreamData}
              />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Gráfico de diferencias */}
      <Card className="differential-chart">
        <CardHeader>
          <CardTitle>Diferencia (Impacto de Cuenca Intermedia)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={differentialData}>
              <Area
                dataKey="difference"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} ${getParameterUnit(parameter)}`, 'Diferencia']}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Estadísticas del impacto */}
      <div className="impact-statistics">
        <StatCard
          title="Impacto Promedio"
          value={`${calculateAverageImpact(differentialData)} ${getParameterUnit(parameter)}`}
          description="Diferencia promedio entre estaciones"
        />
        <StatCard
          title="Máximo Impacto"
          value={`${calculateMaxImpact(differentialData)} ${getParameterUnit(parameter)}`}
          description="Mayor diferencia registrada"
        />
        <StatCard
          title="Correlación"
          value={`${calculateCorrelation(upstreamData, downstreamData).toFixed(3)}`}
          description="Coeficiente de correlación entre estaciones"
        />
      </div>
      
      {/* Interpretación automática */}
      <Card className="impact-interpretation">
        <CardHeader>
          <CardTitle>Interpretación del Impacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="interpretation-text">
            {generateImpactInterpretation(differentialData, parameter)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

**Versión**: 1.0  
**Fecha**: Diciembre 2024  
**Responsable**: Equipo UX/UI HydroFlow
