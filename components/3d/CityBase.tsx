import React from "react";
import { Cylinder, Edges, Ring } from "@react-three/drei";

export const CityBase: React.FC = () => {
  return (
    <group position={[0, -1, 0]}>
      <Cylinder args={[5.5, 6.0, 0.5, 64]}>
        <meshStandardMaterial color="#0f172a" />
        <Edges color="#3b82f6" transparent opacity={0.5} />
      </Cylinder>
      {/* 全息底盘 UI */}
      <Ring
        args={[2.5, 2.6, 64]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.27, 0]}
      >
        <meshBasicMaterial color="#0ea5e9" opacity={0.5} transparent />
      </Ring>
      <Ring
        args={[4.5, 4.6, 64]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.27, 0]}
      >
        <meshBasicMaterial color="#0ea5e9" opacity={0.3} transparent />
      </Ring>

      {/* 科技网格 */}
      <gridHelper args={[16, 16, 0x0ea5e9, 0x1e293b]} position={[0, 0.26, 0]} />

      {/* 底部扩散波 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <ringGeometry args={[0, 6, 64]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.05} />
      </mesh>
    </group>
  );
};
