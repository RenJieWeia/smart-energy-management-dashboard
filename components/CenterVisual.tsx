import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Sphere,
  PerspectiveCamera,
  Stars,
  MeshWobbleMaterial,
  Torus,
  Box,
  Cylinder,
  Icosahedron,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Leaf,
  Sun,
  BatteryCharging,
  Coins,
  Zap,
  BarChart3,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";
import AnimatedNumber from "./AnimatedNumber";

const IconMap = { Leaf, Sun, BatteryCharging, Coins, Zap, BarChart3 };

// 动态负载柱 - 代表不同分区的能耗高度
// Fix: Use React.FC to allow standard React props like 'key'
const EnergyLoadPillar: React.FC<{
  position: [number, number, number];
  height: number;
  color: string;
}> = ({ position, height, color }) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (mesh.current) {
      // 模拟负载波动
      const pulse = Math.sin(clock.getElapsedTime() * 2 + position[0]) * 0.2;
      mesh.current.scale.y = height + pulse;
      mesh.current.position.y = (height + pulse) / 2;
    }
  });

  return (
    <group position={position}>
      {/* 底部基座 */}
      <Box args={[0.4, 0.05, 0.4]}>
        <meshBasicMaterial color="#1e293b" />
      </Box>
      {/* 能量柱体 */}
      <mesh ref={mesh}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.6}
          emissive={color}
          emissiveIntensity={2}
        />
      </mesh>
      {/* 顶部光晕 */}
      <pointLight
        position={[0, height, 0]}
        intensity={1}
        color={color}
        distance={2}
      />
    </group>
  );
};

// 核心能源反应堆 -> 智慧园区数字孪生
const SmartEnergyReactor = () => {
  const groupRef = useRef<THREE.Group>(null);

  // 生成城市建筑群布局
  const buildings = useMemo(() => {
    const items = [];
    // 中央控制塔
    items.push({
      pos: [0, 1.2, 0],
      size: [0.8, 2.4, 0.8],
      color: "#00f2ff",
      isMain: true,
    });

    // 周边建筑群
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (x === 0 && z === 0) continue; // 跳过中心
        // 随机生成建筑
        if (Math.random() > 0.4) {
          const height = 0.3 + Math.random() * 1.0;
          const isHighLoad = Math.random() > 0.9; // 红色高负载节点
          items.push({
            pos: [x * 0.6, height / 2, z * 0.6],
            size: [0.4, height, 0.4],
            color: isHighLoad ? "#ef4444" : "#3b82f6",
            isHighLoad,
            isMain: false,
          });
        }
      }
    }
    return items;
  }, []);

  // 模拟道路交通流
  const traffic = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      x: (Math.random() - 0.5) * 4,
      z: (Math.random() - 0.5) * 4,
      speed: 0.5 + Math.random() * 0.5,
      dir: Math.random() > 0.5 ? 1 : -1,
      axis: Math.random() > 0.5 ? "x" : "z",
    }));
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1; // 整体缓慢旋转
    }
  });

  // 外部供电塔位置
  const pillars = useMemo(
    () => [
      { pos: [3.0, -0.5, 0] as [number, number, number], h: 2.0, c: "#00f2ff" },
      {
        pos: [-3.0, -0.5, 0] as [number, number, number],
        h: 1.5,
        c: "#3b82f6",
      },
      {
        pos: [1.5, -0.5, 2.6] as [number, number, number],
        h: 2.5,
        c: "#10b981",
      },
      {
        pos: [-1.5, -0.5, -2.6] as [number, number, number],
        h: 1.8,
        c: "#f59e0b",
      },
      {
        pos: [1.5, -0.5, -2.6] as [number, number, number],
        h: 1.2,
        c: "#00f2ff",
      },
      {
        pos: [-1.5, -0.5, 2.6] as [number, number, number],
        h: 2.2,
        c: "#3b82f6",
      },
    ],
    []
  );

  return (
    <group ref={groupRef}>
      {/* 园区基座 */}
      <Cylinder args={[3.2, 3.2, 0.2, 6]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.9} />
      </Cylinder>
      <Cylinder args={[3.3, 3.3, 0.05, 6]} position={[0, -0.1, 0]}>
        <meshBasicMaterial
          color="#00f2ff"
          wireframe
          transparent
          opacity={0.3}
        />
      </Cylinder>

      {/* 地面网格装饰 */}
      <gridHelper args={[6, 20, 0x1e293b, 0x1e293b]} position={[0, 0.01, 0]} />

      {/* 建筑群 */}
      {buildings.map((b, i) => (
        <group key={i} position={b.pos as [number, number, number]}>
          {/* 建筑主体 */}
          <Box args={b.size as [number, number, number]}>
            <meshStandardMaterial
              color={b.color}
              transparent
              opacity={0.9}
              emissive={b.color}
              emissiveIntensity={b.isHighLoad ? 2 : b.isMain ? 0.8 : 0.2}
              roughness={0.2}
              metalness={0.8}
            />
          </Box>
          {/* 建筑线框 */}
          <Box args={[b.size[0], b.size[1], b.size[2]]}>
            <meshBasicMaterial
              color={b.isHighLoad ? "#fca5a5" : "#bae6fd"}
              wireframe
              transparent
              opacity={0.15}
            />
          </Box>
          {/* 顶部状态灯 */}
          {b.isHighLoad && (
            <pointLight
              position={[0, b.size[1] / 2 + 0.2, 0]}
              color="#ef4444"
              intensity={2}
              distance={1}
            />
          )}
        </group>
      ))}

      {/* 交通流粒子 */}
      <Sparkles
        count={50}
        scale={4}
        size={2}
        speed={0.4}
        opacity={0.5}
        color="#00f2ff"
        position={[0, 0.5, 0]}
      />

      {/* 扫描光环 */}
      <Torus args={[2.8, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.3} />
      </Torus>

      {/* 动态能量环 - 模拟园区微网 */}
      <Torus args={[1.8, 0.01, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#10b981" transparent opacity={0.4} />
      </Torus>

      {/* 外部负载柱阵 - 变电站节点 */}
      {pillars.map((p, i) => (
        <EnergyLoadPillar key={i} position={p.pos} height={p.h} color={p.c} />
      ))}
    </group>
  );
};

const EnergyLinkLines = () => {
  const { centerStats } = useDashboard();
  const [view, setView] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  React.useEffect(() => {
    const handleResize = () =>
      setView({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow-energy">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {centerStats.map((stat, i) => (
        <g key={i}>
          <path
            d={`M ${view.w / 2} ${view.h / 2} Q ${view.w / 2} ${
              view.h * (stat.anchor.y / 100)
            }, ${view.w * (stat.anchor.x / 100)} ${
              view.h * (stat.anchor.y / 100)
            }`}
            fill="none"
            stroke="url(#link-grad)"
            strokeWidth="0.8"
            strokeDasharray="4 10"
            className="energy-line opacity-30"
          />
          <circle r="2" fill="#00f2ff" filter="url(#glow-energy)">
            <animateMotion
              dur={`${2 + Math.random() * 2}s`}
              repeatCount="indefinite"
              path={`M ${view.w / 2} ${view.h / 2} Q ${view.w / 2} ${
                view.h * (stat.anchor.y / 100)
              }, ${view.w * (stat.anchor.x / 100)} ${
                view.h * (stat.anchor.y / 100)
              }`}
            />
          </circle>
        </g>
      ))}
    </svg>
  );
};

const CenterVisual: React.FC = () => {
  const { dashboardMeta, centerStats } = useDashboard();
  const [isVisible, setIsVisible] = React.useState(false);
  const [frameLoop, setFrameLoop] = React.useState<"always" | "demand">("demand");

  React.useEffect(() => {
    // 策略：
    // 1. 初始 frameloop="demand"，Canvas 会初始化并渲染第一帧，然后暂停。
    //    这把 WebGL 初始化的开销放在了页面加载初期，避免了后续突然挂载造成的卡顿。
    // 2. 等待 CSS 入场动画（约 1s）完全结束。
    // 3. 切换为 "always" 开启渲染循环，并淡入显示。
    const timer = setTimeout(() => {
      setFrameLoop("always");
      setIsVisible(true);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center [perspective:2000px]">
      {/* 3D 核心层 */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Canvas
          shadows
          frameloop={frameLoop}
          dpr={[1, 1.5]} // 降低最大 DPR，优化高分屏性能
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }}
        >
          <PerspectiveCamera
            makeDefault
            position={[0, 5, 12]}
            fov={35}
            rotation={[-0.3, 0, 0]}
          />
          <ambientLight intensity={0.3} />
          <pointLight
            position={[5, 5, 5]}
            intensity={1.5}
            color="#00f2ff"
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
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
            <SmartEnergyReactor />
          </Float>
        </Canvas>
      </div>

      {/* 背景氛围装饰 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="absolute w-[1200px] h-[1200px] bg-cyan-900/5 rounded-full blur-[250px] animate-pulse"></div>
        {/* 科技网格地面 */}
        <div className="absolute bottom-[-10%] w-[200%] h-[60%] bg-[linear-gradient(rgba(0,242,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [transform:rotateX(70deg)] opacity-20"></div>
      </div>

      <EnergyLinkLines />

      {/* 中心监控 HUD 数据 */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center">
        {/* 顶部扫描环 */}
        <div className="absolute -top-32 w-48 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm animate-pulse"></div>

        <div className="flex flex-col items-center justify-center px-10 py-5 glass-panel bg-slate-900/80 border-cyan-400/30 shadow-[0_0_50px_rgba(0,242,255,0.2)] relative backdrop-blur-md border -translate-y-64 rounded-lg min-w-[280px]">
          {/* 装饰角标 */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

          {/* 顶部标签 */}
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-white/50 font-black text-[10px] tracking-[0.3em] uppercase">
              Energy Core Status
            </span>
          </div>

          {/* 核心数值 */}
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-cyber font-black value-highlight leading-none drop-shadow-[0_0_10px_rgba(0,242,255,0.8)]">
              <AnimatedNumber value={dashboardMeta.mainValue} />
            </span>
            <span className="text-cyan-400 font-tech text-sm font-bold">
              {dashboardMeta.mainUnit}
            </span>
          </div>

          {/* 底部状态条 */}
          <div className="absolute -bottom-3 bg-slate-900 border border-emerald-500/50 px-3 py-0.5 rounded text-[9px] text-emerald-400 font-bold tracking-wider uppercase shadow-lg">
            System Optimized
          </div>
        </div>

        {/* 环绕卡片 - 采用更加立体的分布 */}
        {centerStats.map((stat, i) => {
          const Icon = IconMap[stat.iconName];
          const isLeft = stat.pos.includes("left");
          const rotation = isLeft ? "rotateY(15deg)" : "rotateY(-15deg)";

          return (
            <div
              key={i}
              className={`absolute ${stat.pos} transition-all duration-1000 pointer-events-auto z-40`}
              style={{
                transform: `${rotation} translateZ(50px)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="relative group/stat animate-float"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {/* 数字角落装饰 */}
                <div
                  className={`absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-400 opacity-50`}
                ></div>
                <div
                  className={`absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan-400 opacity-50`}
                ></div>

                <div className="glass-panel px-5 py-4 bg-slate-900/95 backdrop-blur-3xl min-w-[150px] border-cyan-500/20 group-hover/stat:border-cyan-400/60 transition-all shadow-2xl overflow-hidden">
                  {/* 动态背景斜纹 */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,242,255,0.03)_25%,transparent_25%,transparent_50%,rgba(0,242,255,0.03)_50%,rgba(0,242,255,0.03)_75%,transparent_75%,transparent)] bg-[size:10px_10px] opacity-20"></div>

                  <div className="flex items-center space-x-3 mb-2 relative z-10">
                    <div className="p-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 group-hover/stat:bg-cyan-400/20 transition-colors">
                      <Icon size={14} className="text-cyan-300 shrink-0" />
                    </div>
                    <span className="text-white/90 text-xs font-bold tracking-wider uppercase truncate">
                      {stat.label}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between relative z-10">
                    <span className="text-cyan-300 font-tech font-bold text-xl drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">
                      <AnimatedNumber value={stat.value.split(" ")[0]} />
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold ml-2 uppercase">
                      {stat.value.split(" ")[1] || ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CenterVisual;
