import React from "react";
import { Stars } from "@react-three/drei";

export const SceneLights: React.FC = () => {
  return (
    <>
      <color attach="background" args={["#111827"]} />
      <ambientLight intensity={0.8} />
      <pointLight
        position={[10, 10, 10]}
        intensity={3.0}
        color="#22d3ee"
        castShadow
      />
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
    </>
  );
};
