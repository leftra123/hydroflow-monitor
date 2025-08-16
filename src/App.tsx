/**
 * 🌊 HydroFlow Monitor - Aplicación Principal
 *
 * Aplicación aumentada con arquitectura reactiva completa:
 * - Store global con Zustand
 * - Conexión en tiempo real con Socket.IO
 * - Gestión de estado del servidor con React Query
 * - Visualización 3D con Three.js
 * - Mapa interactivo con React-Leaflet
 * - Animaciones fluidas con Framer Motion
 */

import { QueryProvider } from '@/providers/QueryProvider';
import { SharedLayout } from '@/components/animated/PageTransitions';
import { MasterHydrologyDashboard } from './components/MasterHydrologyDashboard';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  const { resolvedTheme } = useTheme();

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-300 ${resolvedTheme}`}>
      <QueryProvider>
        <SharedLayout>
          <MasterHydrologyDashboard />
        </SharedLayout>
      </QueryProvider>
    </div>
  );
}

export default App;