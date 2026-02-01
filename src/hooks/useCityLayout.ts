import { useMemo } from "react";
import { BuildingData } from "../components/3d/BuildingGroup";

export const useCityLayout = () => {
  // 生成城市建筑群布局
  // 如果需要从 API 获取数据，可以在这里添加 useEffect 或使用 React Query
  const cityLayout = useMemo(() => {
    const items: BuildingData[] = [];

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
      });
    }

    // 中间层：普通城市建筑群 (City Buildings)
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.5; // 随机分布
      const dist = 3.0 + Math.random() * 1.8;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const height = 1.0 + Math.random() * 2.5;
      const hasPodium = Math.random() > 0.5;

      items.push({
        pos: [x, height / 2 - 0.8, z],
        size: [0.5 + Math.random() * 0.3, height, 0.5 + Math.random() * 0.3],
        type: "building",
        isLifting: false,
        // 提亮建筑颜色：使用 Slate-600 / Slate-500，甚至带点蓝灰
        color: Math.random() > 0.5 ? "#475569" : "#64748b",
        hasPodium,
        podiumSize: [1.2, 0.3, 1.2],
      });
    }

    // 最外圈：5个守护升降块 (Lifting Blocks)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2; // 均匀分布
      const dist = 5.6; // 稍微往里靠，贴近底座边缘 (底座顶部半径5.5)

      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // 高度变化大一些：2.0 到 4.5 之间
      const height = 2.0 + Math.random() * 2.5;

      items.push({
        // 调整初始高度位置，使其大约坐落在底座之上
        // 底座上表面约在 -0.75 (y=-1, height=0.5 -> top=-0.75)
        pos: [x, -0.75 + height / 2, z],
        size: [0.8, height, 0.8], // 块体尺寸
        type: "building",
        isLifting: true,
        color: "#00f2ff",
        hasPodium: false,
      });
    }
    return items;
  }, []);

  return cityLayout;
};
