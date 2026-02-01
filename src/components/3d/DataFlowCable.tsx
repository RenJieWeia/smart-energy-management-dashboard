import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";

// --- 子组件：传输数据流 (能量光缆) ---
export const DataFlowCable: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}> = ({ start, end, color }) => {
  const lineRef = useRef<any>(null);
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const midVec = new THREE.Vector3()
    .addVectors(startVec, endVec)
    .multiplyScalar(0.5);
  midVec.y += 1.2; // 拱起高度

  useFrame((state) => {
    if (lineRef.current) {
      // 让虚线流动起来
      lineRef.current.material.dashOffset -= 0.05;
    }
  });

  return (
    <group>
      {/* 底层光晕线 (更宽，更透明) */}
      <QuadraticBezierLine
        start={startVec}
        end={endVec}
        mid={midVec}
        color={color}
        lineWidth={3}
        transparent
        opacity={0.1}
      />
      {/* 上层流动的高亮数据线 */}
      <QuadraticBezierLine
        ref={lineRef}
        start={startVec}
        end={endVec}
        mid={midVec}
        color={color} // 根据状态变色
        lineWidth={2}
        dashed
        dashScale={4}
        dashSize={0.4}
        gapSize={0.2}
        transparent
        opacity={0.8}
      />
    </group>
  );
};
