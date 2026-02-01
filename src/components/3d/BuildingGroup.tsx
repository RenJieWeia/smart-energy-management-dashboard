import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, Edges } from "@react-three/drei";
import * as THREE from "three";
import { DataFlowCable } from "./DataFlowCable";

export interface BuildingData {
  pos: [number, number, number];
  size: [number, number, number];
  type: string;
  color: string;
  isLifting?: boolean;
  hasPodium?: boolean;
  podiumSize?: [number, number, number];
}

interface BuildingGroupProps {
  item: BuildingData;
  index: number;
}

// Helper component for animated buildings
export const BuildingGroup: React.FC<BuildingGroupProps> = ({
  item,
  index,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // 升降动画逻辑：基于时间与索引的波浪运动
    if (groupRef.current && item.isLifting) {
       const t = state.clock.getElapsedTime();
       
       // "呼吸感"高度伸缩动画
       // 减小变化幅度：scale ±0.2
       // 减慢频率：1.5 -> 0.8
       const scale = 1 + Math.sin(t * 0.8 + index) * 0.2; 
       
       groupRef.current.scale.y = scale;
       
       // 关键：为了让底部贴紧底座不动，需要根据缩放补偿 Y 轴位置
       // 原始高度 item.size[1]，底座高度 -0.75
       // 新的中心点 Y = 底座Y + (原始高度 * 缩放比例) / 2
       const baseY = -0.75; 
       const newHeight = item.size[1] * scale;
       groupRef.current.position.y = baseY + newHeight / 2;
    }
  });

  return (
    <group ref={groupRef} position={item.pos as [number, number, number]}>
      {/* 建筑主体 */}
      <Box args={item.size as [number, number, number]}>
        <meshStandardMaterial
          color={item.color}
          transparent
          opacity={item.type === "server" ? 0.8 : 0.95}
          // 升降块自发光增强
          emissive={
            item.isLifting
              ? item.color
              : item.type === "server"
              ? item.color
              : "#000000"
          }
          emissiveIntensity={
            item.isLifting ? 0.8 : item.type === "server" ? 0.3 : 0
          }
          roughness={0.2}
          metalness={0.8}
        />
        <Edges
          color={
            item.type === "server"
              ? "#7dd3fc"
              : item.isLifting
              ? "#22d3ee"
              : "#475569"
          }
          threshold={15}
        />
      </Box>

      {/* 裙楼结构 */}
      {item.hasPodium && (
        <Box
          args={[item.size[0] * 1.5, 0.2, item.size[2] * 1.5]}
          position={[0, -item.size[1] / 2 + 0.1, 0]}
        >
          <meshStandardMaterial color={item.color} roughness={0.2} />
          <Edges color="#475569" />
        </Box>
      )}

      {/* 建筑窗户纹理模拟 */}
      {item.type === "building" && !item.isLifting && (
        <group>
          {[...Array(Math.floor(item.size[1] / 0.4))].map((_, idx) => (
            <mesh
              key={idx}
              position={[
                0,
                -item.size[1] / 2 + 0.3 + idx * 0.4,
                item.size[2] / 2 + 0.01,
              ]}
            >
              <planeGeometry args={[item.size[0] * 0.6, 0.05]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          ))}
        </group>
      )}

      {/* 顶部指示灯 */}
      {item.type === "building" && (
        <mesh
          position={[0, item.size[1] / 2 + 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[item.size[0] * 0.8, item.size[2] * 0.8]} />
          <meshBasicMaterial
            color={item.isLifting ? "#ffffff" : "#0ea5e9"}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* 服务器机柜细节 */}
      {item.type === "server" && (
        <group>
          {[...Array(6)].map((_, j) => (
            <mesh
              key={j}
              position={[
                0,
                -item.size[1] / 2 + 0.2 + j * 0.35,
                item.size[2] / 2 + 0.01,
              ]}
            >
              <planeGeometry args={[0.4, 0.1]} />
              <meshBasicMaterial color={j === 0 ? "#22d3ee" : "#7dd3fc"} />
            </mesh>
          ))}
        </group>
      )}

      {/* 能量传输光缆 (升降块不显示光缆) */}
      {!item.isLifting && item.type === "building" && (
        <group>
          <DataFlowCable
            start={[0, item.size[1] / 2, 0]}
            end={[-item.pos[0], 2 - item.pos[1], -item.pos[2]] as any}
            color="#22d3ee"
          />
        </group>
      )}
    </group>
  );
};
