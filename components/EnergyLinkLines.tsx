import React from "react";
import { useDashboard } from "../DashboardContext";

export const EnergyLinkLines: React.FC = () => {
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
