/**
 * 🗺️ Mapa Interactivo con React-Leaflet
 * 
 * Componente de mapa completamente interactivo que proporciona conciencia geoespacial
 * al sistema de monitoreo hidrológico. Integra marcadores dinámicos, popups informativos,
 * y sincronización bidireccional con el store de Zustand.
 * 
 * Características:
 * - Marcadores dinámicos con estados visuales (normal, alerta, crítico)
 * - Popups informativos con datos en tiempo real
 * - Sincronización bidireccional con selección de estaciones
 * - Múltiples capas de mapa (satélite, terreno, calles)
 * - Controles de zoom y navegación optimizados
 * - Responsive design para diferentes tamaños de pantalla
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import { Icon, LatLngBounds, Map as LeafletMap } from 'leaflet';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Thermometer, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { 
  useStations, 
  useSelectedStation, 
  useHydrologyActions,
  useUIState,
  useStationAlerts 
} from '@/store/useHydrologyStore';
import { EstacionMonitoreo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 🎯 Configuración de iconos personalizados para marcadores
const createStationIcon = (estado: EstacionMonitoreo['estado'], isSelected: boolean = false) => {
  const colors = {
    normal: isSelected ? '#10b981' : '#22c55e',
    alerta: isSelected ? '#f59e0b' : '#eab308', 
    critico: isSelected ? '#ef4444' : '#dc2626',
  };

  const size = isSelected ? 40 : 30;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${colors[estado]}" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="white"/>
        ${isSelected ? '<circle cx="12" cy="12" r="2" fill="' + colors[estado] + '"/>' : ''}
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// 🎭 Componente para el popup de información de estación
interface StationPopupProps {
  station: EstacionMonitoreo;
  onSelect: () => void;
}

const StationPopup: React.FC<StationPopupProps> = ({ station, onSelect }) => {
  const alerts = useStationAlerts(station.id);
  const activeAlerts = alerts.filter(alert => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return alert.timestamp > twentyFourHoursAgo;
  });

  const getStatusIcon = () => {
    switch (station.estado) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'alerta': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critico': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (station.estado) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'alerta': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critico': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <Card className="w-80 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{station.nombre}</CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Badge className={`${getStatusColor()} capitalize`}>
              {station.estado}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {station.lat.toFixed(4)}°, {station.lng.toFixed(4)}°
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Caudal</p>
              <p className="font-semibold">{station.caudal.toFixed(1)} m³/s</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500">Nivel</p>
              <p className="font-semibold">{station.nivel.toFixed(2)} m</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Temperatura</p>
              <p className="font-semibold">{station.temperatura.toFixed(1)}°C</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Velocidad</p>
              <p className="font-semibold">{station.velocidad.toFixed(1)} m/s</p>
            </div>
          </div>
        </div>

        {/* Alertas activas */}
        {activeAlerts.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Alertas Activas ({activeAlerts.length})
            </p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {activeAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="text-xs p-2 rounded bg-gray-50">
                  <Badge 
                    variant="outline" 
                    className={`mr-2 ${
                      alert.nivel === 'rojo' ? 'border-red-500 text-red-700' :
                      alert.nivel === 'naranja' ? 'border-orange-500 text-orange-700' :
                      'border-yellow-500 text-yellow-700'
                    }`}
                  >
                    {alert.tipo}
                  </Badge>
                  {alert.mensaje}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón para seleccionar */}
        <button
          onClick={onSelect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 text-sm font-medium"
        >
          Ver Detalles Completos
        </button>
      </CardContent>
    </Card>
  );
};

// 🎯 Componente para manejar eventos del mapa
const MapEventHandler: React.FC = () => {
  const map = useMapEvents({
    click: () => {
      // Cerrar popups al hacer click en el mapa
      map.closePopup();
    },
  });

  return null;
};

// 🔄 Componente para sincronizar la vista del mapa con la estación seleccionada
const MapViewController: React.FC = () => {
  const map = useMap();
  const selectedStation = useSelectedStation();
  const stations = useStations();
  
  useEffect(() => {
    if (selectedStation && stations.length > 0) {
      const station = stations.find(s => s.id === selectedStation);
      if (station) {
        // Centrar el mapa en la estación seleccionada con animación suave
        map.flyTo([station.lat, station.lng], 12, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    }
  }, [selectedStation, stations, map]);

  return null;
};

// 🗺️ Props del componente principal
interface InteractiveMapProps {
  className?: string;
  height?: string | number;
}

/**
 * 🌟 Componente principal del mapa interactivo
 */
export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  className = '', 
  height = '400px' 
}) => {
  const stations = useStations();
  const selectedStation = useSelectedStation();
  const { mapView } = useUIState();
  const actions = useHydrologyActions();
  const mapRef = useRef<LeafletMap>(null);

  // 🎯 Configuración de capas de mapa
  const tileLayerConfig = useMemo(() => {
    const configs = {
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      },
      terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      },
      street: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
    };
    return configs[mapView] || configs.satellite;
  }, [mapView]);

  // 🎯 Calcular bounds para mostrar todas las estaciones
  const mapBounds = useMemo(() => {
    if (stations.length === 0) return undefined;
    
    const bounds = new LatLngBounds(
      stations.map(station => [station.lat, station.lng])
    );
    
    return bounds.pad(0.1); // Añadir 10% de padding
  }, [stations]);

  // 🎯 Centro por defecto (Pucón, Chile)
  const defaultCenter: [number, number] = [-39.2833, -71.7167];
  const defaultZoom = 11;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-lg overflow-hidden shadow-lg ${className}`}
      style={{ height }}
    >
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={defaultZoom}
        bounds={mapBounds}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        {/* Capa de tiles */}
        <TileLayer
          url={tileLayerConfig.url}
          attribution={tileLayerConfig.attribution}
          maxZoom={18}
        />

        {/* Marcadores de estaciones */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={createStationIcon(station.estado, station.id === selectedStation)}
            eventHandlers={{
              click: () => {
                actions.setSelectedStation(station.id);
              },
            }}
          >
            <Popup
              closeButton={true}
              autoClose={false}
              closeOnEscapeKey={true}
              className="custom-popup"
            >
              <StationPopup
                station={station}
                onSelect={() => {
                  actions.setSelectedStation(station.id);
                  // Cerrar el popup después de seleccionar
                  if (mapRef.current) {
                    mapRef.current.closePopup();
                  }
                }}
              />
            </Popup>
          </Marker>
        ))}

        {/* Componentes de control */}
        <MapEventHandler />
        <MapViewController />
      </MapContainer>

      {/* Controles de capa superpuestos */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-md p-2 space-y-1">
          {(['satellite', 'terrain', 'street'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => actions.setMapView(layer)}
              className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                mapView === layer
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {layer === 'satellite' && '🛰️ Satélite'}
              {layer === 'terrain' && '🏔️ Terreno'}
              {layer === 'street' && '🗺️ Calles'}
            </button>
          ))}
        </div>
      </div>

      {/* Indicador de estaciones */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-md p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Estaciones ({stations.length})
          </p>
          <div className="flex space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Alerta</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Crítico</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveMap;
