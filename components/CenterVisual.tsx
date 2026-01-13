import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Sphere,
  PerspectiveCamera,
  Stars,
  Torus,
  Sparkles,
  Box,
  Cylinder,
  Edges,
  Icosahedron,
  Plane,
  Cone,
  Ring,
  QuadraticBezierLine,
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

// --- 子组件：传输数据流 (能量光缆) ---
const DataFlowCable: React.FC<{
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

// --- 子组件：巡检无人机 ---
const PatrolDrone: React.FC<{
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

// --- 子组件：复合科技建筑 ---
const ComplexBuilding: React.FC<{
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  isAlert: boolean;
  type: string;
}> = ({ position, size, color, isAlert, type }) => {
  const [w, h, d] = size;

  // 随机生成的建筑细节配置 (利用 useMemo 避免每帧重新生成)
  const details = useMemo(() => {
    // 顶部天线
    const antennas = [];
    if (Math.random() > 0.3) {
      antennas.push({
        pos: [w * 0.25, h / 2, d * 0.25],
        h: 0.3 + Math.random() * 0.5,
      });
    }
    if (Math.random() > 0.6) {
      antennas.push({
        pos: [-w * 0.25, h / 2, -d * 0.25],
        h: 0.2 + Math.random() * 0.3,
      });
    }

    // 侧面结构 (外骨架/通风管道)
    const sideStructs = [];
    if (type === "server") {
      // 服务器机柜有特殊的散热片
      for (let i = 0; i < 3; i++) {
        sideStructs.push({
          pos: [w / 2 + 0.05, -h / 4 + i * (h / 4), 0],
          size: [0.1, 0.05, d * 0.8],
        });
      }
    }

    return { antennas, sideStructs };
  }, [w, h, d, type]);

  return (
    <group position={position}>
      {/* 1. 建筑主体 */}
      <Box args={[w, h, d]}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={type === "server" ? 0.8 : 0.95}
          // 报警状态下自发光增强
          emissive={isAlert ? color : "#000000"}
          emissiveIntensity={isAlert ? 1 : type === "server" ? 0.2 : 0}
          roughness={0.2}
          metalness={0.8}
        />
        <Edges
          color={
            isAlert ? "#ef4444" : type === "server" ? "#7dd3fc" : "#475569"
          }
          threshold={15}
        />
      </Box>

      {/* 2. 内部发光核心 (仅对非报警的建筑，增加科技感) */}
      {!isAlert && type !== "server" && (
        <Box args={[w * 0.6, h * 0.9, d * 0.6]}>
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.2} />
        </Box>
      )}

      {/* 3. 顶部细节：天线与指示灯 */}
      {details.antennas.map((ant, i) => (
        <group key={`ant-${i}`} position={ant.pos as [number, number, number]}>
          <Cylinder args={[0.02, 0.02, ant.h, 4]} position={[0, ant.h / 2, 0]}>
            <meshBasicMaterial color="#94a3b8" />
          </Cylinder>
          {/* 警示红灯常亮，普通天线闪烁 */}
          <pointLight
            distance={0.5}
            intensity={2}
            color="#ef4444"
            position={[0, ant.h, 0]}
          />
          <mesh position={[0, ant.h, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      ))}

      {/* 4. 侧面结构细节 */}
      {details.sideStructs.map((s, i) => (
        <Box
          key={`side-${i}`}
          args={s.size as [number, number, number]}
          position={s.pos as [number, number, number]}
        >
          <meshStandardMaterial
            color={type === "server" ? "#22d3ee" : "#334155"}
          />
          <Edges color="#22d3ee" transparent opacity={0.5} />
        </Box>
      ))}

      {/* 5. 窗户纹理层 (使用简单的片模型模拟灯光) */}
      {!isAlert && type === "building" && (
        <group>
          {/* 正面窗户 */}
          {[...Array(Math.max(2, Math.floor(h / 0.4)))].map((_, i) => (
            <mesh
              key={`win-f-${i}`}
              position={[0, -h / 2 + 0.4 + i * 0.4, d / 2 + 0.01]}
            >
              <planeGeometry args={[w * 0.6, 0.15]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          ))}
          {/* 侧面窗户 */}
          {[...Array(Math.max(2, Math.floor(h / 0.4)))].map((_, i) => (
            <mesh
              key={`win-r-${i}`}
              position={[w / 2 + 0.01, -h / 2 + 0.4 + i * 0.4, 0]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <planeGeometry args={[d * 0.6, 0.15]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          ))}
        </group>
      )}

      {/* 6. 顶部停机坪/设备层 */}
      <group position={[0, h / 2 + 0.05, 0]}>
        <Box args={[w * 0.8, 0.1, d * 0.8]}>
          <meshStandardMaterial color="#1e293b" />
          <Edges color="#64748b" />
        </Box>
        {isAlert && (
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 8]} />
            <meshBasicMaterial color="#ef4444" toneMapped={false} />
          </mesh>
        )}
      </group>
    </group>
  );
};

// Helper component for animated buildings
const BuildingGroup: React.FC<{ item: any; index: number }> = ({
  item,
  index,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // 升降动画逻辑：基于时间与索引的波浪运动
    if (groupRef.current && item.isLifting) {
      const t = state.clock.getElapsedTime();
      // 使用缓慢的正弦波实现“呼吸式”升降，而非快速跳动
      // 将速度减慢至 0.5，幅度减小至 0.3
      const yOffset = Math.sin(t * 0.5 + index) * 0.3;
      groupRef.current.position.y = item.pos[1] + yOffset;
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

// 城市能耗全景模型 - 结合数据中心与智慧城市概念
const EnergyConsumptionModel = () => {
  const groupRef = useRef<THREE.Group>(null);

  // 缓慢自转
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05;
    }
  });

  // 生成城市建筑群布局
  const cityLayout = useMemo(() => {
    const items = [];

    // 内圈：核心服务器机组 (Data Center Racks)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 1.5;
      const z = Math.sin(angle) * 1.5;
      items.push({
        pos: [x, 0.4, z],
        size: [0.6, 2.2, 0.6],
        type: "server",
        color: "#0ea5e9",
        isLifting: false,
      });
    }

    // 中间层：普通城市建筑群 (City Buildings)
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.5; // 随机分布
      const dist = 3.0 + Math.random() * 1.8; // 如果有升降块在远方，这里的范围控制在 3~4.8
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist; // 修正变量名错误

      const height = 1.0 + Math.random() * 2.5;
      const hasPodium = Math.random() > 0.5;

      items.push({
        pos: [x, height / 2 - 0.8, z],
        size: [0.5 + Math.random() * 0.3, height, 0.5 + Math.random() * 0.3],
        type: "building",
        isLifting: false,
        color: Math.random() > 0.5 ? "#1e293b" : "#334155",
        hasPodium,
        podiumSize: [1.2, 0.3, 1.2],
      });
    }

    // 最外圈：6个守护升降块 (Lifting Blocks)
    // 围绕底座 (底座半径约 6.0)，放置在半径 6.5 处
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2; // 均匀分布
      const dist = 6.5;

      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const height = 1.6; // 块体高度

      items.push({
        pos: [x, -0.5, z], // 初始高度位置
        size: [0.8, height, 0.8], // 块体尺寸
        type: "building",
        isLifting: true,
        color: "#00f2ff",
        hasPodium: false,
      });
    }
    return items;
  }, []);

  return (
    <group ref={groupRef} scale={0.65}>
      {/* --- 中央控制塔 (The Hub) --- */}
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

      {/* --- 城市/机房建筑群 --- */}
      {cityLayout.map((item, i) => (
        <BuildingGroup key={i} item={item} index={i} />
      ))}

      {/* --- 巡检无人机 --- */}
      {/* <PatrolDrone radius={2.5} speed={0.8} yOffset={2} color="#fcd34d" />
      <PatrolDrone radius={4.2} speed={-0.6} yOffset={1.5} color="#22d3ee" /> */}

      {/* --- 底座平台 --- */}
      {/* 调整底座高度，使其与建筑底部 (-0.8左右) 接壤，不再悬空 */}
      <group position={[0, -1, 0]}>
        <Cylinder args={[5.5, 6.0, 0.5, 64]}>
          <meshStandardMaterial color="#020617" />
          <Edges color="#1e40af" transparent opacity={0.5} />
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
        <gridHelper
          args={[16, 16, 0x0ea5e9, 0x1e293b]}
          position={[0, 0.26, 0]}
        />

        {/* 底部扩散波 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
          <ringGeometry args={[0, 6, 64]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.05} />
        </mesh>
      </group>

      {/* --- 全局动态粒子 --- */}
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
  const [frameLoop, setFrameLoop] = React.useState<"always" | "demand">(
    "demand"
  );

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
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Canvas
          shadows
          frameloop={frameLoop}
          dpr={[1, 1.5]} // 降低最大 DPR，优化高分屏性能
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
        >
          <color attach="background" args={["#0f172a"]} />
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
            <EnergyConsumptionModel />
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

        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center px-10 py-5 glass-panel bg-slate-900/80 border-cyan-400/30 shadow-[0_0_50px_rgba(0,242,255,0.2)] backdrop-blur-md border rounded-lg min-w-[280px]">
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
