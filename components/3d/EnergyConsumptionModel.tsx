import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { CityBase } from "./CityBase";
import { CentralHub } from "./CentralHub";
import { BuildingGroup, BuildingData } from "./BuildingGroup";
import { PatrolDrone } from "./PatrolDrone";

interface EnergyConsumptionModelProps {
  layoutData: BuildingData[];
}

// 城市能耗全景模型 - 结合数据中心与智慧城市概念
export const EnergyConsumptionModel: React.FC<EnergyConsumptionModelProps> = ({
  layoutData,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // 缓慢自转
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={0.65}>
      {/* 1. 中央控制塔 */}
      <CentralHub />

      {/* 2. 城市/机房建筑群 */}
      {layoutData.map((item, i) => (
        <BuildingGroup key={i} item={item} index={i} />
      ))}

      {/* 3. 巡检无人机 (可选，或者通过 Props 控制) */}
      <PatrolDrone radius={2.5} speed={0.8} yOffset={2} color="#fcd34d" />
      <PatrolDrone radius={4.2} speed={-0.6} yOffset={1.5} color="#22d3ee" />

      {/* 4. 底座平台 */}
      <CityBase />

      {/* 5. 全局动态粒子 */}
      <Sparkles
        count={150}
        scale={10}
        size={3}
        speed={0.8}
        opacity={0.6}
        color="#bae6fd"
        position={[0, 2, 0]}
      />
    </group>
  );
};
