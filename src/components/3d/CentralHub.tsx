import React from "react";
import { Float, Cone, Torus, Cylinder, Edges } from "@react-three/drei";

export const CentralHub: React.FC = () => {
  return (
    <group position={[0, 0.5, 0]}>
      {/* 主塔主体 - 增加内部发光柱 */}
      <Cylinder args={[0.3, 0.3, 4.5, 16]}>
        <meshBasicMaterial color="#a5f3fc" />
      </Cylinder>
      {/* 外部玻璃壳 */}
      <Cylinder args={[0.8, 0.8, 4.5, 8]}>
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.4}
          roughness={0}
        />
        <Edges color="#ccfbf1" threshold={15} transparent opacity={0.5} />
      </Cylinder>

      {/* 塔顶复杂结构 */}
      <group position={[0, 2.5, 0]}>
        <Float speed={5} rotationIntensity={0} floatIntensity={0}>
          <Torus args={[1.2, 0.05, 4, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#ffffff" />
          </Torus>
        </Float>
        {/* 旋转雷达 */}
        <group rotation={[0, 0, 0]}>
          <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0]}>
            <Cone args={[0.5, 1, 4]} rotation={[0, 0, 0]}>
              <meshStandardMaterial color="#22d3ee" wireframe />
            </Cone>
          </mesh>
        </group>
      </group>

      {/* 环绕的数据流环 */}
      <Torus
        args={[1.0, 0.02, 16, 64]}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color="#22d3ee" />
      </Torus>
      <Torus
        args={[1.1, 0.02, 16, 64]}
        position={[0, 1.0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color="#22d3ee" />
      </Torus>
      <Torus
        args={[0.9, 0.02, 16, 64]}
        position={[0, -1.0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial color="#22d3ee" />
      </Torus>
    </group>
  );
};
