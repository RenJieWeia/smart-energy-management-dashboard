import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cone, Torus } from "@react-three/drei";
import * as THREE from "three";

// --- 子组件：巡检无人机 ---
export const PatrolDrone: React.FC<{
  radius: number;
  speed: number;
  yOffset: number;
  color: string;
}> = ({ radius, speed, yOffset, color }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime() * speed;
      groupRef.current.position.x = Math.sin(t) * radius;
      groupRef.current.position.z = Math.cos(t) * radius;
      groupRef.current.position.y = yOffset + Math.sin(t * 3) * 0.2;
      groupRef.current.lookAt(0, yOffset, 0); // 面向中心
    }
  });

  return (
    <group ref={groupRef}>
      <Cone args={[0.2, 0.5, 4]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
        />
      </Cone>
      {/* 尾迹 */}
      <Torus args={[0.15, 0.02, 8, 16]} rotation={[0, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </Torus>
    </group>
  );
};
