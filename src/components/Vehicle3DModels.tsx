// ============================================
// ULTRA-DETAILED 3D VEHICLE MODELS v4.0
// Photorealistic Three.js Vehicle Components
// ============================================

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { VehicleData } from '../store/useStore';

type ThreeClickEvent = { stopPropagation: () => void };

// ============================================
// MATERIALS LIBRARY
// ============================================

const createMaterials = () => ({
  // Car body paints
  carPaintRed: new THREE.MeshPhysicalMaterial({
    color: 0xff3355,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 1,
  }),
  carPaintBlue: new THREE.MeshPhysicalMaterial({
    color: 0x0066ff,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  }),
  carPaintWhite: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.8,
    roughness: 0.15,
    clearcoat: 0.9,
  }),
  carPaintBlack: new THREE.MeshPhysicalMaterial({
    color: 0x111111,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
  }),
  carPaintYellow: new THREE.MeshPhysicalMaterial({
    color: 0xffcc00,
    metalness: 0.85,
    roughness: 0.12,
    clearcoat: 1.0,
  }),
  carPaintGreen: new THREE.MeshPhysicalMaterial({
    color: 0x00cc66,
    metalness: 0.88,
    roughness: 0.1,
    clearcoat: 1.0,
  }),
  
  // Glass materials
  windowGlass: new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    metalness: 0,
    roughness: 0,
    transmission: 0.95,
    transparent: true,
    opacity: 0.3,
    ior: 1.5,
  }),
  tintedGlass: new THREE.MeshPhysicalMaterial({
    color: 0x222233,
    metalness: 0,
    roughness: 0,
    transmission: 0.7,
    transparent: true,
    opacity: 0.6,
  }),
  
  // Chrome and metal
  chrome: new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 1,
    roughness: 0.05,
  }),
  darkChrome: new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 1,
    roughness: 0.1,
  }),
  brushedMetal: new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.9,
    roughness: 0.3,
  }),
  
  // Rubber and plastic
  rubber: new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0,
    roughness: 0.9,
  }),
  plasticBlack: new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.1,
    roughness: 0.7,
  }),
  plasticRed: new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.1,
    roughness: 0.5,
    emissive: 0xff0000,
    emissiveIntensity: 0.3,
  }),
  
  // Lights
  headlightOn: new THREE.MeshStandardMaterial({
    color: 0xffffee,
    emissive: 0xffffee,
    emissiveIntensity: 2,
  }),
  headlightOff: new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.8,
    roughness: 0.2,
  }),
  taillightOn: new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 1.5,
  }),
  turnSignal: new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xffaa00,
    emissiveIntensity: 1.5,
  }),
  emergencyRed: new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 3,
  }),
  emergencyBlue: new THREE.MeshStandardMaterial({
    color: 0x0066ff,
    emissive: 0x0066ff,
    emissiveIntensity: 3,
  }),
  
  // Interior
  leatherBlack: new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.1,
    roughness: 0.8,
  }),
  dashboardPlastic: new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    metalness: 0.2,
    roughness: 0.6,
  }),
});

// ============================================
// WHEEL COMPONENT
// ============================================

interface WheelProps {
  position: [number, number, number];
  rotation?: number;
  size?: number;
  isSpinning?: boolean;
  speed?: number;
}

export const Wheel: React.FC<WheelProps> = ({ 
  position, 
  rotation = 0, 
  size = 0.35,
  isSpinning = false,
  speed = 0 
}) => {
  const wheelRef = useRef<THREE.Group>(null);
  const materials = useMemo(() => createMaterials(), []);
  
  useFrame((_, delta) => {
    if (wheelRef.current && isSpinning) {
      wheelRef.current.rotation.x += speed * delta * 0.5;
    }
  });
  
  return (
    <group ref={wheelRef} position={position} rotation={[0, rotation, 0]}>
      {/* Tire */}
      <mesh>
        <torusGeometry args={[size, size * 0.35, 16, 32]} />
        <primitive object={materials.rubber} />
      </mesh>
      
      {/* Tire tread pattern */}
      {[...Array(24)].map((_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 12) * size,
          Math.sin(i * Math.PI / 12) * size,
          0
        ]} rotation={[0, 0, i * Math.PI / 12]}>
          <boxGeometry args={[0.02, 0.08, size * 0.4]} />
          <primitive object={materials.rubber} />
        </mesh>
      ))}
      
      {/* Rim outer */}
      <mesh>
        <cylinderGeometry args={[size * 0.75, size * 0.75, size * 0.3, 24]} />
        <primitive object={materials.chrome} />
      </mesh>
      
      {/* Rim spokes - 5 spoke design */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, i * Math.PI * 2 / 5]}>
          <boxGeometry args={[0.06, size * 0.65, 0.08]} />
          <primitive object={materials.chrome} />
        </mesh>
      ))}
      
      {/* Center hub */}
      <mesh>
        <cylinderGeometry args={[size * 0.15, size * 0.15, size * 0.35, 16]} />
        <primitive object={materials.darkChrome} />
      </mesh>
      
      {/* Hub cap logo (center circle) */}
      <mesh position={[0, size * 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.1, 16]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {/* Brake rotor (visible through spokes) */}
      <mesh>
        <cylinderGeometry args={[size * 0.5, size * 0.5, 0.02, 32]} />
        <primitive object={materials.brushedMetal} />
      </mesh>
      
      {/* Brake caliper */}
      <mesh position={[size * 0.4, 0, 0.1]}>
        <boxGeometry args={[0.15, 0.1, 0.06]} />
        <primitive object={materials.plasticRed} />
      </mesh>
    </group>
  );
};

// ============================================
// DETAILED CAR MODEL
// ============================================

interface CarModelProps {
  vehicle: VehicleData;
  isSelected?: boolean;
  showLights?: boolean;
}

export const DetailedCar: React.FC<CarModelProps> = ({ 
  vehicle, 
  isSelected = false,
  showLights = true 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const materials = useMemo(() => createMaterials(), []);
  
  const isMoving = vehicle.status === 'moving' || vehicle.status === 'emergency';
  const isBraking = vehicle.speed < vehicle.recommendedSpeed * 0.5;
  
  // Animate emergency vehicles
  useFrame((state) => {
    if (groupRef.current && vehicle.status === 'emergency') {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.02;
    }
  });
  
  // Get paint color based on vehicle
  const getPaintMaterial = () => {
    const colorMap: Record<string, THREE.Material> = {
      '#00f0ff': materials.carPaintBlue,
      '#ff3355': materials.carPaintRed,
      '#00ff88': materials.carPaintGreen,
      '#ffaa00': materials.carPaintYellow,
      '#ffffff': materials.carPaintWhite,
      '#111111': materials.carPaintBlack,
    };
    return colorMap[vehicle.color] || materials.carPaintBlue;
  };
  
  const paintMaterial = getPaintMaterial();
  
  return (
    <group ref={groupRef} position={[vehicle.position.x * 0.1, 0.4, vehicle.position.y * 0.1]} rotation={[0, -vehicle.heading, 0]}>
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial color={0x00f0ff} transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* === MAIN BODY === */}
      {/* Lower body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 0.35, 0.85]} />
        <primitive object={paintMaterial} />
      </mesh>
      
      {/* Front bumper */}
      <mesh position={[0.95, -0.1, 0]}>
        <boxGeometry args={[0.15, 0.2, 0.9]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {/* Rear bumper */}
      <mesh position={[-0.95, -0.1, 0]}>
        <boxGeometry args={[0.15, 0.2, 0.9]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {/* Front grille */}
      <mesh position={[0.91, 0.05, 0]}>
        <boxGeometry args={[0.02, 0.2, 0.6]} />
        <primitive object={materials.chrome} />
      </mesh>
      
      {/* Grille slats */}
      {[-0.15, -0.05, 0.05, 0.15].map((z, i) => (
        <mesh key={i} position={[0.91, 0.05, z]}>
          <boxGeometry args={[0.03, 0.02, 0.08]} />
          <primitive object={materials.darkChrome} />
        </mesh>
      ))}
      
      {/* Hood */}
      <mesh position={[0.5, 0.2, 0]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[0.7, 0.05, 0.8]} />
        <primitive object={paintMaterial} />
      </mesh>
      
      {/* Hood lines */}
      <mesh position={[0.5, 0.23, 0]}>
        <boxGeometry args={[0.6, 0.01, 0.02]} />
        <primitive object={materials.darkChrome} />
      </mesh>
      
      {/* === CABIN === */}
      {/* A-pillars */}
      <mesh position={[0.2, 0.4, 0.38]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.35, 0.05, 0.05]} />
        <primitive object={paintMaterial} />
      </mesh>
      <mesh position={[0.2, 0.4, -0.38]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.35, 0.05, 0.05]} />
        <primitive object={paintMaterial} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[-0.15, 0.55, 0]}>
        <boxGeometry args={[0.9, 0.08, 0.78]} />
        <primitive object={paintMaterial} />
      </mesh>
      
      {/* Roof rails */}
      <mesh position={[-0.15, 0.6, 0.35]}>
        <boxGeometry args={[0.7, 0.02, 0.03]} />
        <primitive object={materials.chrome} />
      </mesh>
      <mesh position={[-0.15, 0.6, -0.35]}>
        <boxGeometry args={[0.7, 0.02, 0.03]} />
        <primitive object={materials.chrome} />
      </mesh>
      
      {/* C-pillars */}
      <mesh position={[-0.5, 0.4, 0.38]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.3, 0.05, 0.05]} />
        <primitive object={paintMaterial} />
      </mesh>
      <mesh position={[-0.5, 0.4, -0.38]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.3, 0.05, 0.05]} />
        <primitive object={paintMaterial} />
      </mesh>
      
      {/* === WINDOWS === */}
      {/* Windshield */}
      <mesh position={[0.25, 0.4, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.5, 0.02, 0.7]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* Rear window */}
      <mesh position={[-0.55, 0.4, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.4, 0.02, 0.65]} />
        <primitive object={materials.tintedGlass} />
      </mesh>
      
      {/* Side windows */}
      <mesh position={[0, 0.4, 0.4]}>
        <boxGeometry args={[0.6, 0.25, 0.02]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      <mesh position={[0, 0.4, -0.4]}>
        <boxGeometry args={[0.6, 0.25, 0.02]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* === LIGHTS === */}
      {/* Headlights */}
      <mesh position={[0.88, 0.05, 0.3]}>
        <boxGeometry args={[0.08, 0.1, 0.15]} />
        <primitive object={showLights ? materials.headlightOn : materials.headlightOff} />
      </mesh>
      <mesh position={[0.88, 0.05, -0.3]}>
        <boxGeometry args={[0.08, 0.1, 0.15]} />
        <primitive object={showLights ? materials.headlightOn : materials.headlightOff} />
      </mesh>
      
      {/* Headlight lenses */}
      <mesh position={[0.92, 0.05, 0.3]}>
        <boxGeometry args={[0.02, 0.08, 0.12]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      <mesh position={[0.92, 0.05, -0.3]}>
        <boxGeometry args={[0.02, 0.08, 0.12]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* DRL strip */}
      <mesh position={[0.9, 0.12, 0.3]}>
        <boxGeometry args={[0.02, 0.015, 0.1]} />
        <primitive object={materials.headlightOn} />
      </mesh>
      <mesh position={[0.9, 0.12, -0.3]}>
        <boxGeometry args={[0.02, 0.015, 0.1]} />
        <primitive object={materials.headlightOn} />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-0.88, 0.08, 0.32]}>
        <boxGeometry args={[0.06, 0.12, 0.18]} />
        <primitive object={isBraking ? materials.taillightOn : materials.plasticRed} />
      </mesh>
      <mesh position={[-0.88, 0.08, -0.32]}>
        <boxGeometry args={[0.06, 0.12, 0.18]} />
        <primitive object={isBraking ? materials.taillightOn : materials.plasticRed} />
      </mesh>
      
      {/* Tail light bar (connecting) */}
      <mesh position={[-0.88, 0.08, 0]}>
        <boxGeometry args={[0.03, 0.03, 0.4]} />
        <primitive object={materials.plasticRed} />
      </mesh>
      
      {/* Turn signals (rear) */}
      <mesh position={[-0.88, 0.15, 0.38]}>
        <boxGeometry args={[0.04, 0.04, 0.06]} />
        <primitive object={materials.turnSignal} />
      </mesh>
      <mesh position={[-0.88, 0.15, -0.38]}>
        <boxGeometry args={[0.04, 0.04, 0.06]} />
        <primitive object={materials.turnSignal} />
      </mesh>
      
      {/* === SIDE DETAILS === */}
      {/* Door handles */}
      <mesh position={[0.15, 0.25, 0.425]}>
        <boxGeometry args={[0.1, 0.025, 0.015]} />
        <primitive object={materials.chrome} />
      </mesh>
      <mesh position={[-0.25, 0.25, 0.425]}>
        <boxGeometry args={[0.1, 0.025, 0.015]} />
        <primitive object={materials.chrome} />
      </mesh>
      <mesh position={[0.15, 0.25, -0.425]}>
        <boxGeometry args={[0.1, 0.025, 0.015]} />
        <primitive object={materials.chrome} />
      </mesh>
      <mesh position={[-0.25, 0.25, -0.425]}>
        <boxGeometry args={[0.1, 0.025, 0.015]} />
        <primitive object={materials.chrome} />
      </mesh>
      
      {/* Side mirrors */}
      <mesh position={[0.3, 0.35, 0.5]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <primitive object={paintMaterial} />
      </mesh>
      <mesh position={[0.3, 0.35, -0.5]}>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <primitive object={paintMaterial} />
      </mesh>
      
      {/* Mirror glass */}
      <mesh position={[0.3, 0.35, 0.56]}>
        <planeGeometry args={[0.06, 0.04]} />
        <primitive object={materials.chrome} />
      </mesh>
      <mesh position={[0.3, 0.35, -0.56]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.06, 0.04]} />
        <primitive object={materials.chrome} />
      </mesh>
      
      {/* Door lines */}
      <mesh position={[0.05, 0.15, 0.43]}>
        <boxGeometry args={[0.01, 0.3, 0.01]} />
        <primitive object={materials.darkChrome} />
      </mesh>
      <mesh position={[-0.35, 0.15, 0.43]}>
        <boxGeometry args={[0.01, 0.3, 0.01]} />
        <primitive object={materials.darkChrome} />
      </mesh>
      
      {/* Side skirts */}
      <mesh position={[0, -0.12, 0.42]}>
        <boxGeometry args={[1.4, 0.08, 0.03]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      <mesh position={[0, -0.12, -0.42]}>
        <boxGeometry args={[1.4, 0.08, 0.03]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {/* === UNDERBODY === */}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[1.6, 0.02, 0.75]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {/* Exhaust pipes */}
      <mesh position={[-0.92, -0.1, 0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.035, 0.12, 12]} />
        <primitive object={materials.chrome} />
      </mesh>
      <mesh position={[-0.92, -0.1, -0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.035, 0.12, 12]} />
        <primitive object={materials.chrome} />
      </mesh>
      
      {/* === WHEELS === */}
      <Wheel position={[0.55, -0.15, 0.48]} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[0.55, -0.15, -0.48]} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-0.55, -0.15, 0.48]} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-0.55, -0.15, -0.48]} isSpinning={isMoving} speed={vehicle.speed} />
      
      {/* === INTERIOR (visible through windows) === */}
      {/* Dashboard */}
      <mesh position={[0.35, 0.25, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.65]} />
        <primitive object={materials.dashboardPlastic} />
      </mesh>
      
      {/* Steering wheel */}
      <mesh position={[0.25, 0.3, 0.2]} rotation={[0, 0, 0.3]}>
        <torusGeometry args={[0.08, 0.01, 8, 16]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {/* Seats */}
      <mesh position={[0.1, 0.18, 0.2]}>
        <boxGeometry args={[0.25, 0.25, 0.2]} />
        <primitive object={materials.leatherBlack} />
      </mesh>
      <mesh position={[0.1, 0.18, -0.2]}>
        <boxGeometry args={[0.25, 0.25, 0.2]} />
        <primitive object={materials.leatherBlack} />
      </mesh>
      
      {/* Headrests */}
      <mesh position={[0, 0.38, 0.2]}>
        <boxGeometry args={[0.08, 0.12, 0.12]} />
        <primitive object={materials.leatherBlack} />
      </mesh>
      <mesh position={[0, 0.38, -0.2]}>
        <boxGeometry args={[0.08, 0.12, 0.12]} />
        <primitive object={materials.leatherBlack} />
      </mesh>
      
      {/* === POINT LIGHTS === */}
      {showLights && (
        <>
          <pointLight position={[1.2, 0.1, 0.3]} intensity={0.5} distance={5} color={0xffffee} />
          <pointLight position={[1.2, 0.1, -0.3]} intensity={0.5} distance={5} color={0xffffee} />
        </>
      )}
    </group>
  );
};

// ============================================
// DETAILED AMBULANCE MODEL
// ============================================

export const DetailedAmbulance: React.FC<CarModelProps> = ({ 
  vehicle, 
  isSelected = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const lightBarRef = useRef<THREE.Group>(null);
  const materials = useMemo(() => createMaterials(), []);
  
  const isMoving = vehicle.status === 'moving' || vehicle.status === 'emergency';
  const isEmergency = vehicle.status === 'emergency';
  
  // Animate emergency lights
  useFrame((state) => {
    if (lightBarRef.current && isEmergency) {
      const time = state.clock.elapsedTime;
      lightBarRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const isRed = i % 2 === 0;
          const phase = isRed ? 0 : Math.PI;
          const intensity = (Math.sin(time * 10 + phase) + 1) / 2;
          (child.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity * 5;
        }
      });
    }
  });
  
  return (
    <group ref={groupRef} position={[vehicle.position.x * 0.1, 0.5, vehicle.position.y * 0.1]} rotation={[0, -vehicle.heading, 0]}>
      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.0, 32]} />
          <meshBasicMaterial color={0xff3355} transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* === MAIN BODY (Box van style) === */}
      {/* Front cab */}
      <mesh position={[1.1, 0, 0]}>
        <boxGeometry args={[0.8, 0.7, 1.0]} />
        <primitive object={materials.carPaintWhite} />
      </mesh>
      
      {/* Rear box body */}
      <mesh position={[-0.3, 0.15, 0]}>
        <boxGeometry args={[2.0, 1.0, 1.1]} />
        <primitive object={materials.carPaintWhite} />
      </mesh>
      
      {/* Red stripe (side) */}
      <mesh position={[-0.3, 0.15, 0.56]}>
        <boxGeometry args={[1.8, 0.2, 0.02]} />
        <primitive object={materials.plasticRed} />
      </mesh>
      <mesh position={[-0.3, 0.15, -0.56]}>
        <boxGeometry args={[1.8, 0.2, 0.02]} />
        <primitive object={materials.plasticRed} />
      </mesh>
      
      {/* AMBULANCE text area */}
      <mesh position={[-0.3, 0.5, 0.56]}>
        <boxGeometry args={[1.0, 0.15, 0.02]} />
        <meshStandardMaterial color={0x0066ff} />
      </mesh>
      <mesh position={[-0.3, 0.5, -0.56]}>
        <boxGeometry args={[1.0, 0.15, 0.02]} />
        <meshStandardMaterial color={0x0066ff} />
      </mesh>
      
      {/* Red cross symbols */}
      {/* Front cross */}
      <mesh position={[1.52, 0.1, 0]}>
        <boxGeometry args={[0.02, 0.25, 0.08]} />
        <primitive object={materials.plasticRed} />
      </mesh>
      <mesh position={[1.52, 0.1, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.25]} />
        <primitive object={materials.plasticRed} />
      </mesh>
      
      {/* Side crosses */}
      <mesh position={[-0.8, 0.15, 0.57]}>
        <boxGeometry args={[0.25, 0.08, 0.02]} />
        <primitive object={materials.plasticRed} />
      </mesh>
      <mesh position={[-0.8, 0.15, 0.57]}>
        <boxGeometry args={[0.08, 0.25, 0.02]} />
        <primitive object={materials.plasticRed} />
      </mesh>
      
      {/* === LIGHT BAR === */}
      <group ref={lightBarRef} position={[0.3, 0.72, 0]}>
        {/* Light bar base */}
        <mesh>
          <boxGeometry args={[0.8, 0.08, 0.25]} />
          <primitive object={materials.chrome} />
        </mesh>
        
        {/* Red lights */}
        <mesh position={[0.25, 0.05, 0.08]}>
          <boxGeometry args={[0.15, 0.06, 0.08]} />
          <primitive object={materials.emergencyRed} />
        </mesh>
        <mesh position={[-0.25, 0.05, 0.08]}>
          <boxGeometry args={[0.15, 0.06, 0.08]} />
          <primitive object={materials.emergencyRed} />
        </mesh>
        
        {/* Blue lights */}
        <mesh position={[0.25, 0.05, -0.08]}>
          <boxGeometry args={[0.15, 0.06, 0.08]} />
          <primitive object={materials.emergencyBlue} />
        </mesh>
        <mesh position={[-0.25, 0.05, -0.08]}>
          <boxGeometry args={[0.15, 0.06, 0.08]} />
          <primitive object={materials.emergencyBlue} />
        </mesh>
        
        {/* Center white strobe */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.1, 0.06, 0.2]} />
          <primitive object={materials.headlightOn} />
        </mesh>
      </group>
      
      {/* Corner flashers */}
      <mesh position={[1.45, 0.35, 0.45]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <primitive object={isEmergency ? materials.emergencyRed : materials.plasticRed} />
      </mesh>
      <mesh position={[1.45, 0.35, -0.45]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <primitive object={isEmergency ? materials.emergencyBlue : materials.plasticRed} />
      </mesh>
      
      {/* === WINDSHIELD === */}
      <mesh position={[1.35, 0.25, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.4, 0.02, 0.85]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* Side windows (cab) */}
      <mesh position={[1.1, 0.15, 0.51]}>
        <boxGeometry args={[0.5, 0.35, 0.02]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      <mesh position={[1.1, 0.15, -0.51]}>
        <boxGeometry args={[0.5, 0.35, 0.02]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* Rear windows (small) */}
      <mesh position={[-1.25, 0.3, 0]}>
        <boxGeometry args={[0.02, 0.3, 0.4]} />
        <primitive object={materials.tintedGlass} />
      </mesh>
      
      {/* Rear doors */}
      <mesh position={[-1.28, 0, 0.3]}>
        <boxGeometry args={[0.05, 0.8, 0.45]} />
        <primitive object={materials.carPaintWhite} />
      </mesh>
      <mesh position={[-1.28, 0, -0.3]}>
        <boxGeometry args={[0.05, 0.8, 0.45]} />
        <primitive object={materials.carPaintWhite} />
      </mesh>
      
      {/* Door handles */}
      <mesh position={[-1.32, 0, 0.1]}>
        <boxGeometry args={[0.02, 0.04, 0.06]} />
        <primitive object={materials.chrome} />
      </mesh>
      <mesh position={[-1.32, 0, -0.1]}>
        <boxGeometry args={[0.02, 0.04, 0.06]} />
        <primitive object={materials.chrome} />
      </mesh>
      
      {/* === WHEELS (6 wheels) === */}
      <Wheel position={[1.0, -0.25, 0.55]} size={0.3} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[1.0, -0.25, -0.55]} size={0.3} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-0.8, -0.25, 0.55]} size={0.3} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-0.8, -0.25, -0.55]} size={0.3} isSpinning={isMoving} speed={vehicle.speed} />
      
      {/* Headlights */}
      <mesh position={[1.5, -0.1, 0.35]}>
        <boxGeometry args={[0.04, 0.12, 0.15]} />
        <primitive object={materials.headlightOn} />
      </mesh>
      <mesh position={[1.5, -0.1, -0.35]}>
        <boxGeometry args={[0.04, 0.12, 0.15]} />
        <primitive object={materials.headlightOn} />
      </mesh>
      
      {/* Emergency point lights */}
      {isEmergency && (
        <>
          <pointLight position={[0.3, 1.0, 0]} intensity={2} distance={8} color={0xff0000} />
          <pointLight position={[0.3, 1.0, 0]} intensity={2} distance={8} color={0x0066ff} />
        </>
      )}
    </group>
  );
};

// ============================================
// DETAILED TRUCK MODEL
// ============================================

export const DetailedTruck: React.FC<CarModelProps> = ({ 
  vehicle, 
  isSelected = false,
  showLights = true 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const materials = useMemo(() => createMaterials(), []);
  
  const isMoving = vehicle.status === 'moving';
  
  return (
    <group ref={groupRef} position={[vehicle.position.x * 0.1, 0.6, vehicle.position.y * 0.1]} rotation={[0, -vehicle.heading, 0]}>
      {isSelected && (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 2.4, 32]} />
          <meshBasicMaterial color={0xffaa00} transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* === CAB === */}
      <mesh position={[1.3, 0, 0]}>
        <boxGeometry args={[1.0, 0.9, 1.1]} />
        <primitive object={materials.carPaintBlue} />
      </mesh>
      
      {/* Cab roof fairing */}
      <mesh position={[1.3, 0.55, 0]}>
        <boxGeometry args={[0.3, 0.2, 1.0]} />
        <primitive object={materials.carPaintBlue} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[1.65, 0.2, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.4, 0.02, 0.95]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* Side windows */}
      <mesh position={[1.3, 0.15, 0.56]}>
        <boxGeometry args={[0.6, 0.4, 0.02]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      <mesh position={[1.3, 0.15, -0.56]}>
        <boxGeometry args={[0.6, 0.4, 0.02]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* Grille */}
      <mesh position={[1.82, -0.1, 0]}>
        <boxGeometry args={[0.04, 0.4, 0.8]} />
        <primitive object={materials.chrome} />
      </mesh>
      
      {/* === CARGO CONTAINER === */}
      <mesh position={[-0.6, 0.1, 0]}>
        <boxGeometry args={[2.8, 1.2, 1.2]} />
        <meshStandardMaterial color={0xdddddd} metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Container ribs */}
      {[-1.5, -0.9, -0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0.61]}>
          <boxGeometry args={[0.05, 1.1, 0.02]} />
          <primitive object={materials.brushedMetal} />
        </mesh>
      ))}
      
      {/* Container branding area */}
      <mesh position={[-0.6, 0.4, 0.62]}>
        <boxGeometry args={[1.5, 0.4, 0.02]} />
        <meshStandardMaterial color={0xff6600} />
      </mesh>
      
      {/* Rear doors */}
      <mesh position={[-2.02, 0.1, 0]}>
        <boxGeometry args={[0.04, 1.15, 1.15]} />
        <primitive object={materials.brushedMetal} />
      </mesh>
      
      {/* Door hinges */}
      <mesh position={[-2.02, 0.3, 0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <primitive object={materials.darkChrome} />
      </mesh>
      <mesh position={[-2.02, 0.3, -0.5]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <primitive object={materials.darkChrome} />
      </mesh>
      
      {/* === CHASSIS === */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4.0, 0.15, 0.6]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {/* Fuel tanks (side) */}
      <mesh position={[0.5, -0.35, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <primitive object={materials.brushedMetal} />
      </mesh>
      
      {/* === WHEELS (10 wheels) === */}
      <Wheel position={[1.3, -0.4, 0.65]} size={0.35} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[1.3, -0.4, -0.65]} size={0.35} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-0.5, -0.4, 0.65]} size={0.35} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-0.5, -0.4, -0.65]} size={0.35} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-1.1, -0.4, 0.65]} size={0.35} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-1.1, -0.4, -0.65]} size={0.35} isSpinning={isMoving} speed={vehicle.speed} />
      
      {/* Mudflaps */}
      <mesh position={[-1.1, -0.55, 0.8]}>
        <boxGeometry args={[0.3, 0.25, 0.02]} />
        <primitive object={materials.rubber} />
      </mesh>
      <mesh position={[-1.1, -0.55, -0.8]}>
        <boxGeometry args={[0.3, 0.25, 0.02]} />
        <primitive object={materials.rubber} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[1.82, -0.05, 0.4]}>
        <boxGeometry args={[0.05, 0.15, 0.18]} />
        <primitive object={showLights ? materials.headlightOn : materials.headlightOff} />
      </mesh>
      <mesh position={[1.82, -0.05, -0.4]}>
        <boxGeometry args={[0.05, 0.15, 0.18]} />
        <primitive object={showLights ? materials.headlightOn : materials.headlightOff} />
      </mesh>
      
      {/* Marker lights (roof) */}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={i} position={[1.3, 0.67, z]}>
          <boxGeometry args={[0.04, 0.03, 0.06]} />
          <primitive object={materials.turnSignal} />
        </mesh>
      ))}
      
      {/* Mirrors */}
      <mesh position={[1.5, 0.3, 0.7]}>
        <boxGeometry args={[0.1, 0.2, 0.15]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      <mesh position={[1.5, 0.3, -0.7]}>
        <boxGeometry args={[0.1, 0.2, 0.15]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {showLights && (
        <>
          <pointLight position={[2.2, 0, 0.4]} intensity={0.8} distance={8} color={0xffffee} />
          <pointLight position={[2.2, 0, -0.4]} intensity={0.8} distance={8} color={0xffffee} />
        </>
      )}
    </group>
  );
};

// ============================================
// DETAILED BUS MODEL
// ============================================

export const DetailedBus: React.FC<CarModelProps> = ({ 
  vehicle, 
  isSelected = false,
  showLights = true 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const materials = useMemo(() => createMaterials(), []);
  
  const isMoving = vehicle.status === 'moving';
  
  return (
    <group ref={groupRef} position={[vehicle.position.x * 0.1, 0.6, vehicle.position.y * 0.1]} rotation={[0, -vehicle.heading, 0]}>
      {isSelected && (
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 2.7, 32]} />
          <meshBasicMaterial color={0x00ff88} transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* === MAIN BODY === */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.5, 1.2, 1.2]} />
        <primitive object={materials.carPaintYellow} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[4.3, 0.1, 1.1]} />
        <primitive object={materials.carPaintWhite} />
      </mesh>
      
      {/* Destination display */}
      <mesh position={[2.0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.25, 1.0]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      <mesh position={[2.3, 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.2]} />
        <meshStandardMaterial color={0xff6600} emissive={0xff6600} emissiveIntensity={0.5} />
      </mesh>
      
      {/* === WINDOWS (many!) === */}
      {/* Windshield */}
      <mesh position={[2.15, 0.15, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.5, 0.02, 1.05]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* Side windows - left */}
      {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((x, i) => (
        <mesh key={`left-${i}`} position={[x, 0.15, 0.61]}>
          <boxGeometry args={[0.45, 0.55, 0.02]} />
          <primitive object={materials.windowGlass} />
        </mesh>
      ))}
      
      {/* Side windows - right */}
      {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((x, i) => (
        <mesh key={`right-${i}`} position={[x, 0.15, -0.61]}>
          <boxGeometry args={[0.45, 0.55, 0.02]} />
          <primitive object={materials.windowGlass} />
        </mesh>
      ))}
      
      {/* Rear window */}
      <mesh position={[-2.2, 0.15, 0]}>
        <boxGeometry args={[0.02, 0.5, 0.8]} />
        <primitive object={materials.tintedGlass} />
      </mesh>
      
      {/* === DOORS === */}
      {/* Front door */}
      <mesh position={[1.8, -0.2, 0.61]}>
        <boxGeometry args={[0.5, 0.75, 0.02]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* Middle door */}
      <mesh position={[0, -0.2, 0.61]}>
        <boxGeometry args={[0.7, 0.75, 0.02]} />
        <primitive object={materials.windowGlass} />
      </mesh>
      
      {/* Door frames */}
      <mesh position={[1.8, -0.2, 0.62]}>
        <boxGeometry args={[0.55, 0.02, 0.02]} />
        <primitive object={materials.darkChrome} />
      </mesh>
      <mesh position={[0, -0.2, 0.62]}>
        <boxGeometry args={[0.75, 0.02, 0.02]} />
        <primitive object={materials.darkChrome} />
      </mesh>
      
      {/* === WHEEL ARCHES === */}
      <mesh position={[1.5, -0.45, 0.55]}>
        <boxGeometry args={[0.6, 0.3, 0.12]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      <mesh position={[-1.5, -0.45, 0.55]}>
        <boxGeometry args={[0.6, 0.3, 0.12]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {/* === WHEELS === */}
      <Wheel position={[1.5, -0.45, 0.7]} size={0.38} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[1.5, -0.45, -0.7]} size={0.38} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-1.5, -0.45, 0.7]} size={0.38} isSpinning={isMoving} speed={vehicle.speed} />
      <Wheel position={[-1.5, -0.45, -0.7]} size={0.38} isSpinning={isMoving} speed={vehicle.speed} />
      
      {/* === LIGHTS === */}
      <mesh position={[2.27, -0.1, 0.4]}>
        <boxGeometry args={[0.04, 0.12, 0.18]} />
        <primitive object={showLights ? materials.headlightOn : materials.headlightOff} />
      </mesh>
      <mesh position={[2.27, -0.1, -0.4]}>
        <boxGeometry args={[0.04, 0.12, 0.18]} />
        <primitive object={showLights ? materials.headlightOn : materials.headlightOff} />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-2.27, -0.1, 0.4]}>
        <boxGeometry args={[0.04, 0.15, 0.2]} />
        <primitive object={materials.taillightOn} />
      </mesh>
      <mesh position={[-2.27, -0.1, -0.4]}>
        <boxGeometry args={[0.04, 0.15, 0.2]} />
        <primitive object={materials.taillightOn} />
      </mesh>
      
      {/* Route number display (front) */}
      <mesh position={[2.27, 0.35, 0]}>
        <boxGeometry args={[0.02, 0.15, 0.3]} />
        <meshStandardMaterial color={0x00ff00} emissive={0x00ff00} emissiveIntensity={0.3} />
      </mesh>
      
      {/* === MIRRORS === */}
      <mesh position={[2.0, 0.2, 0.75]}>
        <boxGeometry args={[0.15, 0.2, 0.2]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      <mesh position={[2.0, 0.2, -0.75]}>
        <boxGeometry args={[0.15, 0.2, 0.2]} />
        <primitive object={materials.plasticBlack} />
      </mesh>
      
      {showLights && (
        <>
          <pointLight position={[2.8, 0, 0.4]} intensity={0.6} distance={6} color={0xffffee} />
          <pointLight position={[2.8, 0, -0.4]} intensity={0.6} distance={6} color={0xffffee} />
        </>
      )}
    </group>
  );
};

// ============================================
// VEHICLE MODEL FACTORY
// ============================================

interface Vehicle3DProps {
  vehicle: VehicleData;
  isSelected?: boolean;
  showLights?: boolean;
  onClick?: () => void;
}

export const Vehicle3D: React.FC<Vehicle3DProps> = ({ 
  vehicle, 
  isSelected = false,
  showLights = true,
  onClick 
}) => {
  const handleClick = (e: ThreeClickEvent) => {
    e.stopPropagation();
    onClick?.();
  };
  
  const props = { vehicle, isSelected, showLights };
  
  // Return appropriate model based on vehicle type
  switch (vehicle.type) {
    case 'ambulance':
      return (
        <group onClick={handleClick}>
          <DetailedAmbulance {...props} />
        </group>
      );
    case 'truck':
      return (
        <group onClick={handleClick}>
          <DetailedTruck {...props} />
        </group>
      );
    case 'bus':
      return (
        <group onClick={handleClick}>
          <DetailedBus {...props} />
        </group>
      );
    case 'car':
    case 'suv':
    case 'van':
    default:
      return (
        <group onClick={handleClick}>
          <DetailedCar {...props} />
        </group>
      );
  }
};

export default Vehicle3D;
