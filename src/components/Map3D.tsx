// ============================================
// 3D MAP COMPONENT
// Three.js powered visualization
// ============================================

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { VehicleData, RoadSegmentData, FuelStationData, HazardData } from '../store/useStore';

interface Map3DProps {
  vehicles: VehicleData[];
  roadSegments: RoadSegmentData[];
  fuelStations: FuelStationData[];
  hazards: HazardData[];
  selectedVehicleId: string | null;
  onVehicleClick: (id: string) => void;
  showTraffic: boolean;
  showWeather: boolean;
  showHazards: boolean;
  showHeatMap: boolean;
  heatMapType: 'congestion' | 'speed' | 'incidents' | 'fuel';
}

const Map3D: React.FC<Map3DProps> = ({
  vehicles,
  roadSegments,
  fuelStations,
  hazards,
  selectedVehicleId,
  onVehicleClick,
  showTraffic,
  showWeather,
  showHazards,
  showHeatMap
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const animationFrameRef = useRef<number>(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 500, 1500);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(400, 400, 500);
    camera.lookAt(400, 0, 300);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(500, 500, 500);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add accent lights for futuristic feel
    const pointLight1 = new THREE.PointLight(0x00f0ff, 1, 500);
    pointLight1.position.set(200, 100, 200);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff3355, 0.8, 500);
    pointLight2.position.set(600, 100, 400);
    scene.add(pointLight2);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(1000, 800);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d1117,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(400, -1, 300);
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(1000, 50, 0x1a1a2e, 0x1a1a2e);
    gridHelper.position.set(400, 0, 300);
    scene.add(gridHelper);

    // Mouse movement for camera
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraAngle = 0;
    let cameraDistance = 600;
    let cameraHeight = 400;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        cameraAngle += deltaX * 0.01;
        cameraHeight = Math.max(100, Math.min(800, cameraHeight - deltaY * 2));
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistance = Math.max(200, Math.min(1200, cameraDistance + e.deltaY));
    };

    const handleClick = (e: MouseEvent) => {
      if (!cameraRef.current) return;
      
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      
      const vehicleObjects = Array.from(vehicleMeshesRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(vehicleObjects, true);
      
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.vehicleId) {
          obj = obj.parent as THREE.Object3D;
        }
        if (obj.userData.vehicleId) {
          onVehicleClick(obj.userData.vehicleId);
        }
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Update camera position
      if (cameraRef.current) {
        const targetX = 400 + Math.sin(cameraAngle) * cameraDistance;
        const targetZ = 300 + Math.cos(cameraAngle) * cameraDistance;
        
        cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.05;
        cameraRef.current.position.y += (cameraHeight - cameraRef.current.position.y) * 0.05;
        cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.05;
        cameraRef.current.lookAt(400, 0, 300);
      }

      // Animate accent lights
      const time = Date.now() * 0.001;
      pointLight1.intensity = 0.8 + Math.sin(time * 2) * 0.2;
      pointLight2.intensity = 0.6 + Math.cos(time * 1.5) * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [onVehicleClick]);

  // Create road segments
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing roads
    scene.children
      .filter(c => c.userData.type === 'road')
      .forEach(c => scene.remove(c));

    roadSegments.forEach(segment => {
      // Road surface
      const start = new THREE.Vector3(segment.startPoint.x, 1, segment.startPoint.y);
      const end = new THREE.Vector3(segment.endPoint.x, 1, segment.endPoint.y);
      
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      
      const roadWidth = segment.lanes * 15;
      const roadGeometry = new THREE.BoxGeometry(length, 2, roadWidth);
      
      // Color based on congestion if traffic is shown
      let roadColor = 0x2d2d2d;
      if (showTraffic) {
        if (segment.congestionLevel > 70) roadColor = 0x661111;
        else if (segment.congestionLevel > 40) roadColor = 0x665511;
        else roadColor = 0x116611;
      }
      
      const roadMaterial = new THREE.MeshStandardMaterial({
        color: roadColor,
        roughness: 0.9,
        metalness: 0.1
      });
      
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.position.copy(center);
      road.rotation.y = Math.atan2(direction.x, direction.z);
      road.receiveShadow = true;
      road.userData = { type: 'road', segmentId: segment.id };
      scene.add(road);

      // Road markings
      const lineGeometry = new THREE.BoxGeometry(length - 10, 0.5, 0.5);
      const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      
      for (let i = 0; i <= segment.lanes; i++) {
        const lineOffset = (i - segment.lanes / 2) * 15;
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.copy(center);
        line.position.y = 2.1;
        line.rotation.y = Math.atan2(direction.x, direction.z);
        
        // Offset perpendicular to road direction
        const perpX = -Math.sin(line.rotation.y + Math.PI / 2) * lineOffset;
        const perpZ = -Math.cos(line.rotation.y + Math.PI / 2) * lineOffset;
        line.position.x += perpX;
        line.position.z += perpZ;
        
        line.userData = { type: 'road' };
        scene.add(line);
      }

      // Weather effects
      if (showWeather && segment.weather !== 'clear') {
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = center.x + (Math.random() - 0.5) * length;
          positions[i * 3 + 1] = Math.random() * 50 + 10;
          positions[i * 3 + 2] = center.z + (Math.random() - 0.5) * roadWidth;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
          color: segment.weather === 'rain' ? 0x4488ff : 0xffffff,
          size: segment.weather === 'snow' ? 3 : 1,
          transparent: true,
          opacity: 0.6
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        particleSystem.userData = { type: 'road', weather: true };
        scene.add(particleSystem);
      }
    });
  }, [roadSegments, showTraffic, showWeather]);

  // Create/update vehicles
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    vehicles.forEach(vehicle => {
      let vehicleGroup = vehicleMeshesRef.current.get(vehicle.id);
      
      if (!vehicleGroup) {
        // Create new vehicle
        vehicleGroup = new THREE.Group();
        vehicleGroup.userData = { vehicleId: vehicle.id };
        
        // Vehicle body
        const bodyGeometry = new THREE.BoxGeometry(
          vehicle.type === 'truck' ? 30 : vehicle.type === 'bus' ? 35 : 20,
          vehicle.type === 'truck' ? 15 : vehicle.type === 'bus' ? 20 : 10,
          vehicle.type === 'truck' ? 15 : vehicle.type === 'bus' ? 12 : 10
        );
        
        const color = new THREE.Color(vehicle.color);
        const bodyMaterial = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.3,
          metalness: 0.7,
          emissive: color,
          emissiveIntensity: 0.2
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = vehicle.type === 'truck' ? 10 : vehicle.type === 'bus' ? 12 : 7;
        body.castShadow = true;
        body.receiveShadow = true;
        vehicleGroup.add(body);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(3, 3, 2, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
        
        const wheelPositions = [
          [-8, 3, 6], [-8, 3, -6], [8, 3, 6], [8, 3, -6]
        ];
        
        wheelPositions.forEach(pos => {
          const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
          wheel.position.set(pos[0], pos[1], pos[2]);
          wheel.rotation.x = Math.PI / 2;
          wheel.castShadow = true;
          vehicleGroup!.add(wheel);
        });

        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const headlightMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffaa,
          transparent: true,
          opacity: 0.9
        });
        
        [[-9, 5, 3], [-9, 5, -3]].forEach(pos => {
          const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
          headlight.position.set(pos[0], pos[1], pos[2]);
          vehicleGroup!.add(headlight);
        });

        // Emergency lights for ambulance
        if (vehicle.type === 'ambulance') {
          const sirenGeometry = new THREE.BoxGeometry(15, 3, 8);
          const sirenMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
          });
          const siren = new THREE.Mesh(sirenGeometry, sirenMaterial);
          siren.position.y = 18;
          siren.userData = { siren: true };
          vehicleGroup.add(siren);
        }

        scene.add(vehicleGroup);
        vehicleMeshesRef.current.set(vehicle.id, vehicleGroup);
      }

      // Update position
      vehicleGroup.position.x = vehicle.position.x;
      vehicleGroup.position.z = vehicle.position.y;
      vehicleGroup.rotation.y = -vehicle.heading * Math.PI / 180;

      // Update selection highlight
      const isSelected = vehicle.id === selectedVehicleId;
      vehicleGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissiveIntensity = isSelected ? 0.5 : 0.2;
        }
      });

      // Animate emergency lights
      if (vehicle.type === 'ambulance' || vehicle.status === 'emergency') {
        const siren = vehicleGroup.children.find(c => c.userData.siren);
        if (siren && siren instanceof THREE.Mesh) {
          const time = Date.now() * 0.01;
          (siren.material as THREE.MeshBasicMaterial).color.setHex(
            Math.sin(time) > 0 ? 0xff0000 : 0x0000ff
          );
        }
      }
    });

    // Remove deleted vehicles
    vehicleMeshesRef.current.forEach((group, id) => {
      if (!vehicles.find(v => v.id === id)) {
        scene.remove(group);
        vehicleMeshesRef.current.delete(id);
      }
    });
  }, [vehicles, selectedVehicleId]);

  // Create fuel stations
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing stations
    scene.children
      .filter(c => c.userData.type === 'station')
      .forEach(c => scene.remove(c));

    fuelStations.forEach(station => {
      const stationGroup = new THREE.Group();
      stationGroup.userData = { type: 'station', stationId: station.id };

      // Station building
      const buildingGeometry = new THREE.BoxGeometry(40, 25, 30);
      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a4a6a,
        roughness: 0.6,
        metalness: 0.3
      });
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.y = 12.5;
      building.castShadow = true;
      building.receiveShadow = true;
      stationGroup.add(building);

      // Canopy
      const canopyGeometry = new THREE.BoxGeometry(60, 3, 50);
      const canopyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a3a5a,
        roughness: 0.5,
        metalness: 0.4
      });
      const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
      canopy.position.set(0, 35, 15);
      canopy.castShadow = true;
      stationGroup.add(canopy);

      // Pumps
      const pumpGeometry = new THREE.BoxGeometry(5, 15, 5);
      const pumpMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.3
      });

      for (let i = 0; i < Math.min(station.totalPumps, 4); i++) {
        const pump = new THREE.Mesh(pumpGeometry, pumpMaterial);
        pump.position.set(-15 + i * 12, 7.5, 25);
        pump.castShadow = true;
        stationGroup.add(pump);
      }

      // Sign
      const signGeometry = new THREE.BoxGeometry(30, 15, 2);
      const signMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.9
      });
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(0, 50, 0);
      stationGroup.add(sign);

      stationGroup.position.set(station.position.x, 0, station.position.y);
      scene.add(stationGroup);
    });
  }, [fuelStations]);

  // Create hazards
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !showHazards) return;

    // Remove existing hazards
    scene.children
      .filter(c => c.userData.type === 'hazard')
      .forEach(c => scene.remove(c));

    hazards.filter(h => h.isActive).forEach(hazard => {
      const hazardGroup = new THREE.Group();
      hazardGroup.userData = { type: 'hazard', hazardId: hazard.id };

      // Warning cone/marker
      const coneGeometry = new THREE.ConeGeometry(8, 20, 8);
      const coneColor = hazard.severity === 'critical' ? 0xff0000 :
                        hazard.severity === 'high' ? 0xff6600 :
                        hazard.severity === 'medium' ? 0xffaa00 : 0xffff00;
      const coneMaterial = new THREE.MeshStandardMaterial({
        color: coneColor,
        emissive: coneColor,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      });
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.position.y = 10;
      hazardGroup.add(cone);

      // Warning ring
      const ringGeometry = new THREE.RingGeometry(15, 20, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: coneColor,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 1;
      hazardGroup.add(ring);

      hazardGroup.position.set(hazard.position.x, 0, hazard.position.y);
      scene.add(hazardGroup);
    });
  }, [hazards, showHazards]);

  // Heat map overlay
  const heatMapMesh = useMemo(() => {
    if (!showHeatMap) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Create gradient based on segment data
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.PlaneGeometry(1000, 800);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(400, 5, 300);
    
    return mesh;
  }, [showHeatMap]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old heat map
    scene.children
      .filter(c => c.userData.type === 'heatmap')
      .forEach(c => scene.remove(c));

    if (heatMapMesh) {
      heatMapMesh.userData = { type: 'heatmap' };
      scene.add(heatMapMesh);
    }
  }, [heatMapMesh]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    >
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
        <div className="text-cyan-400 text-sm font-medium">3D View</div>
        <div className="text-gray-400 text-xs">Drag to rotate • Scroll to zoom</div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <div className="text-xs text-gray-300 space-y-1">
          {showTraffic && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span>Low Traffic</span>
              <span className="w-3 h-3 rounded-full bg-yellow-500 ml-2" />
              <span>Medium</span>
              <span className="w-3 h-3 rounded-full bg-red-500 ml-2" />
              <span>High</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-cyan-500" />
            <span>Fuel Station</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map3D;
