
import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

// Simple 3D Box Component
function AnimatedBox({ position, color, size = [1, 1, 1] }: { position: [number, number, number]; color: string; size?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </Float>
  );
}

// Simple 3D Sphere Component
function AnimatedSphere({ position, color, radius = 0.5 }: { position: [number, number, number]; color: string; radius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </Float>
  );
}

// Main 3D Scene Component
function Scene3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={0.5} />
          
          <Environment preset="city" />
          
          {/* Main title text */}
          <Text
            position={[0, 1, 0]}
            fontSize={1.2}
            color="#0284c7"
            anchorX="center"
            anchorY="middle"
          >
            StockEase
          </Text>
          
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.3}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
          >
            Inventory Management System
          </Text>
          
          {/* Floating 3D elements */}
          <AnimatedBox position={[-3, 2, -1]} color="#0ea5e9" size={[0.8, 0.8, 0.8]} />
          <AnimatedSphere position={[3, 2, -1]} color="#8b5cf6" radius={0.5} />
          <AnimatedBox position={[-2, -1.5, -2]} color="#10b981" size={[0.6, 1.2, 0.6]} />
          <AnimatedSphere position={[2.5, -1, -1]} color="#f59e0b" radius={0.4} />
          <AnimatedBox position={[0, -2.5, -3]} color="#ef4444" size={[1, 0.4, 1]} />
          <AnimatedSphere position={[-3.5, 0, -2]} color="#06b6d4" radius={0.3} />
          
          {/* Background elements */}
          <AnimatedBox position={[4, 3, -4]} color="#0284c7" size={[0.4, 0.4, 0.4]} />
          <AnimatedSphere position={[-4, -2, -4]} color="#7c3aed" radius={0.3} />
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Scene3D;
