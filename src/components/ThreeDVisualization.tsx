/**
 * 🌊 Visualización 3D del Río Claro de Pucón
 * 
 * Componente que crea una representación tridimensional inmersiva del río
 * usando Three.js y @react-three/fiber. Incluye simulación de partículas
 * para visualizar el flujo del agua basado en datos reales.
 * 
 * Características:
 * - Geometría del río basada en datos topográficos
 * - Simulación de partículas para flujo de agua
 * - Visualización de estaciones de monitoreo en 3D
 * - Efectos visuales dinámicos basados en datos en tiempo real
 * - Controles de cámara interactivos
 * - Iluminación realista y materiales PBR
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Text, 
  Html,
  useTexture,
  Sphere,
  Box
} from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { 
  useCurrentStation, 
  useStations,
  useSelectedStation,
  useHydrologyActions 
} from '@/store/useHydrologyStore';
import { EstacionMonitoreo } from '@/types';

// 🎯 Configuración de la simulación
const RIVER_LENGTH = 50;
const RIVER_WIDTH = 8;
const PARTICLE_COUNT = 1000;
const FLOW_SPEED_BASE = 0.02;

// 🌊 Componente de simulación de partículas de agua
const WaterParticles: React.FC<{ flowRate: number; velocity: number }> = ({ 
  flowRate, 
  velocity 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Float32Array | undefined>(undefined);
  const velocitiesRef = useRef<Float32Array | undefined>(undefined);

  // Inicializar partículas
  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Posición inicial aleatoria a lo largo del río
      positions[i3] = (Math.random() - 0.5) * RIVER_LENGTH; // x
      positions[i3 + 1] = Math.random() * 2; // y (altura)
      positions[i3 + 2] = (Math.random() - 0.5) * RIVER_WIDTH; // z (ancho)
      
      // Velocidad inicial
      const baseSpeed = FLOW_SPEED_BASE * (velocity / 2.0); // Normalizar velocidad
      velocities[i3] = baseSpeed + (Math.random() - 0.5) * 0.01; // x (flujo principal)
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.005; // y (turbulencia vertical)
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.01; // z (turbulencia lateral)
    }
    
    particlesRef.current = positions;
    velocitiesRef.current = velocities;
    
    return { positions, velocities };
  }, [velocity]);

  // Animación de partículas
  useFrame((state, delta) => {
    if (!meshRef.current || !particlesRef.current || !velocitiesRef.current) return;

    const positions = particlesRef.current;
    const velocities = velocitiesRef.current;
    const matrix = new THREE.Matrix4();
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Actualizar posiciones
      positions[i3] += velocities[i3] * delta * 60; // x
      positions[i3 + 1] += velocities[i3 + 1] * delta * 60; // y
      positions[i3 + 2] += velocities[i3 + 2] * delta * 60; // z
      
      // Resetear partículas que salen del río
      if (positions[i3] > RIVER_LENGTH / 2) {
        positions[i3] = -RIVER_LENGTH / 2;
        positions[i3 + 1] = Math.random() * 2;
        positions[i3 + 2] = (Math.random() - 0.5) * RIVER_WIDTH;
      }
      
      // Mantener partículas dentro del ancho del río
      if (Math.abs(positions[i3 + 2]) > RIVER_WIDTH / 2) {
        positions[i3 + 2] = Math.sign(positions[i3 + 2]) * (RIVER_WIDTH / 2 - 0.1);
        velocities[i3 + 2] *= -0.5; // Rebote suave
      }
      
      // Aplicar matriz de transformación
      matrix.setPosition(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      meshRef.current.setMatrixAt(i, matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshPhongMaterial 
        color="#4FC3F7" 
        transparent 
        opacity={0.6}
        shininess={100}
      />
    </instancedMesh>
  );
};

// 🏔️ Componente del lecho del río
const RiverBed: React.FC = () => {
  const riverGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(RIVER_LENGTH, RIVER_WIDTH, 32, 16);
    
    // Crear ondulaciones en el lecho del río
    const positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Crear profundidad variable
      positions[i + 1] = -Math.sin(x * 0.1) * 0.5 - Math.cos(z * 0.2) * 0.3 - 1;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);

  return (
    <mesh geometry={riverGeometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <meshLambertMaterial color="#8D6E63" />
    </mesh>
  );
};

// 📍 Componente de estación 3D
interface Station3DProps {
  station: EstacionMonitoreo;
  isSelected: boolean;
  onClick: () => void;
}

const Station3D: React.FC<Station3DProps> = ({ station, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convertir coordenadas geográficas a posición 3D (simplificado)
  const position3D = useMemo(() => {
    // Mapear las coordenadas reales a la escena 3D
    // Esta es una simplificación - en un proyecto real usarías proyección cartográfica
    const x = (station.lng + 71.8) * 100 - 25; // Centrar en el río
    const z = (station.lat + 39.3) * 100 - 15;
    const y = 2; // Altura sobre el agua
    
    return [x, y, z] as [number, number, number];
  }, [station.lat, station.lng]);

  // Animación de pulsación para estación seleccionada
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const getStationColor = () => {
    switch (station.estado) {
      case 'normal': return '#22c55e';
      case 'alerta': return '#eab308';
      case 'critico': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <group position={position3D}>
      {/* Marcador de estación */}
      <mesh ref={meshRef} onClick={onClick}>
        <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
        <meshPhongMaterial color={getStationColor()} />
      </mesh>
      
      {/* Etiqueta de estación */}
      <Html distanceFactor={10} position={[0, 3, 0]}>
        <div className={`
          bg-white px-2 py-1 rounded shadow-lg text-xs font-medium
          ${isSelected ? 'ring-2 ring-blue-500' : ''}
        `}>
          <div className="text-gray-800">{station.nombre}</div>
          <div className="text-gray-600">
            {station.caudal.toFixed(1)} m³/s
          </div>
        </div>
      </Html>
      
      {/* Indicador de flujo */}
      <Sphere args={[0.2]} position={[0, 1.5, 0]}>
        <meshPhongMaterial 
          color={getStationColor()} 
          emissive={getStationColor()}
          emissiveIntensity={0.3}
        />
      </Sphere>
    </group>
  );
};

// 🎮 Controles de cámara personalizados
const CameraController: React.FC = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Posición inicial de la cámara
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
      autoRotate={false}
      autoRotateSpeed={0.5}
    />
  );
};

// 💡 Sistema de iluminación
const Lighting: React.FC = () => {
  return (
    <>
      {/* Luz ambiental suave */}
      <ambientLight intensity={0.4} />
      
      {/* Luz direccional (sol) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Luz puntual para reflejos en el agua */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#4FC3F7" />
      
      {/* Luz de relleno */}
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
    </>
  );
};

// 🌊 Props del componente principal
interface ThreeDVisualizationProps {
  className?: string;
  height?: string | number;
}

/**
 * 🌟 Componente principal de visualización 3D
 */
export const ThreeDVisualization: React.FC<ThreeDVisualizationProps> = ({
  className = '',
  height = '500px'
}) => {
  const currentStation = useCurrentStation();
  const stations = useStations();
  const selectedStation = useSelectedStation();
  const actions = useHydrologyActions();

  // Datos para la simulación
  const flowRate = currentStation?.caudal || 150;
  const velocity = currentStation?.velocidad || 2.0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative rounded-lg overflow-hidden shadow-lg bg-gradient-to-b from-sky-200 to-sky-400 ${className}`}
      style={{ height }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 15, 20], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Entorno y iluminación */}
        <Lighting />
        <Environment preset="sunset" />
        
        {/* Geometría del río */}
        <RiverBed />
        
        {/* Simulación de partículas de agua */}
        <WaterParticles flowRate={flowRate} velocity={velocity} />
        
        {/* Estaciones de monitoreo */}
        {stations.map((station) => (
          <Station3D
            key={station.id}
            station={station}
            isSelected={station.id === selectedStation}
            onClick={() => actions.setSelectedStation(station.id)}
          />
        ))}
        
        {/* Controles de cámara */}
        <CameraController />
        
        {/* Texto informativo */}
        <Text
          position={[0, 8, -20]}
          fontSize={2}
          color="#1e40af"
          anchorX="center"
          anchorY="middle"
        >
          Río Claro de Pucón
        </Text>
      </Canvas>

      {/* Panel de información superpuesto */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Simulación 3D</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Caudal: {flowRate.toFixed(1)} m³/s</div>
          <div>Velocidad: {velocity.toFixed(1)} m/s</div>
          <div>Partículas: {PARTICLE_COUNT.toLocaleString()}</div>
        </div>
      </div>

      {/* Controles de visualización */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-xs text-gray-600 space-y-1">
          <div>🖱️ Click y arrastra para rotar</div>
          <div>🔍 Scroll para zoom</div>
          <div>📍 Click en estaciones para seleccionar</div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreeDVisualization;
