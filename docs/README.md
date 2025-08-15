# 🌊 HydroFlow Monitor - Dashboard Hidrológico Avanzado

## Descripción General

HydroFlow Monitor es un sistema de monitoreo hidrológico en tiempo real diseñado para supervisar las condiciones del Río Claro de Pucón. Combina análisis hidráulico avanzado, visualización de datos interactiva y alertas inteligentes en una interfaz de usuario excepcional.

## 🏗️ Arquitectura del Sistema

### Principios de Diseño

- **Pureza Semántica**: Cada función es pura, determinística y sin efectos secundarios
- **Inmutabilidad**: El estado es inmutable por diseño usando branded types de TypeScript
- **Componentes Atómicos**: Cada componente es autocontenido y reutilizable
- **Estado Predecible**: Gestión de estado con useReducer siguiendo patrones Redux

### Stack Tecnológico

- **Frontend**: React 18+ con TypeScript
- **Build Tool**: Vite para desarrollo ultrarrápido
- **Styling**: Tailwind CSS + Shadcn/ui
- **Visualización**: Recharts para gráficos profesionales
- **Animaciones**: Framer Motion para micro-interacciones
- **Estado**: useReducer + Context API

## 📊 Componentes del Dashboard

### 1. Vista General (Overview)
Proporciona una visión integral del estado actual del río con múltiples perspectivas de análisis.

### 2. Análisis Avanzado
Enfocado en correlaciones estadísticas y detección de anomalías.

### 3. Correlaciones
Visualización de relaciones entre diferentes parámetros hidrológicos.

### 4. Tiempo Real
Monitoreo en vivo con alertas y métricas hidráulicas instantáneas.

## 🎯 Estaciones de Monitoreo

### Estación Pucón Centro
- **Ubicación**: -39.2833°, -71.7167°
- **Elevación**: 230m
- **Kilómetro**: 0 (referencia)
- **Características**: Zona urbana, punto de referencia principal

### Estación Puente Holzapfel
- **Ubicación**: -39.2900°, -71.7200°
- **Elevación**: 245m
- **Kilómetro**: 2.5 aguas arriba
- **Características**: Zona menos urbanizada, control aguas arriba

## 📈 Parámetros Monitoreados

### Parámetros Hidráulicos
- **Nivel del Agua** (m): Altura de la superficie del agua
- **Caudal** (m³/s): Volumen de agua que pasa por segundo
- **Velocidad** (m/s): Velocidad promedio del flujo

### Parámetros de Calidad
- **Temperatura** (°C): Temperatura del agua
- **pH**: Acidez/alcalinidad del agua (6.0-8.5)
- **Oxígeno Disuelto** (mg/L): Concentración de oxígeno
- **Turbidez** (NTU): Claridad del agua

### Parámetros Meteorológicos
- **Precipitación** (mm): Lluvia acumulada

## 🔗 Enlaces a Documentación Detallada

- [📊 Análisis Multiescala](./charts/multiescale-analysis.md)
- [🔬 Análisis Correlacional](./charts/correlation-analysis.md)
- [⚡ Medición en Tiempo Real](./charts/realtime-gauges.md)
- [🕸️ Análisis Dimensional](./charts/dimensional-analysis.md)
- [🧮 Cálculos Hidráulicos](./hydraulics/calculations.md)
- [🚨 Sistema de Alertas](./alerts/intelligent-alerts.md)
- [🎨 Gestión de Estado](./architecture/state-management.md)
- [🎯 Tipos de Datos](./architecture/data-types.md)

## 🚀 Inicio Rápido

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

### Testing
```bash
npm run test
```

## 🎨 Características de UX

### Modo Oscuro/Claro
Toggle automático que adapta todos los componentes y gráficos al tema seleccionado.

### Tiempo Real
Actualización automática cada 5 segundos cuando está habilitado el modo tiempo real.

### Responsive Design
Adaptación completa a dispositivos móviles, tablets y desktop.

### Animaciones Fluidas
Micro-interacciones que mejoran la experiencia sin comprometer el rendimiento.

## 📊 Métricas de Rendimiento

- **Bundle Size**: ~816 KB (243 KB gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 95+

## 🔧 Configuración

### Variables de Entorno
```env
VITE_API_URL=http://localhost:3000
VITE_WEBSOCKET_URL=ws://localhost:3000
VITE_UPDATE_INTERVAL=5000
```

### Umbrales de Alertas
Los umbrales están configurados en `src/components/alerts/AlertsPanel.tsx` y pueden ser ajustados según las necesidades específicas del monitoreo.

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el sistema, consultar la documentación detallada en las carpetas correspondientes o crear un issue en el repositorio.
