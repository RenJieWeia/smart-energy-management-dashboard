import React from "react";
import ChartWidget from "../common/ChartWidget";
import { TemperatureChart, PressureChart, EnergyHeatMeterChart } from "../hummingbird";

const LeftColumn: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-3">
      {/* 电能与热量监测 */}
      <ChartWidget title="电能与热量监测" className="flex-[1.5]">
        <div className="h-full pt-2 mb-1">
          <EnergyHeatMeterChart />
        </div>
      </ChartWidget>

      {/* 供回水温度监测 */}
      <ChartWidget title="供回水温度监测" className="flex-1">
        <div className="h-full pt-2">
          <TemperatureChart />
        </div>
      </ChartWidget>

      {/* 管网压力监测 */}
      <ChartWidget title="管网压力监测" className="flex-1">
        <div className="h-full pt-2">
          <PressureChart />
        </div>
      </ChartWidget>
    </div>
  );
};

export default LeftColumn;
