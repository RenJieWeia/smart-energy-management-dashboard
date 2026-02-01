import React from "react";
import ChartWidget from "../common/ChartWidget";
import { TemperatureChart, PressureChart, FlowMeterChart } from "../hummingbird";

const LeftColumn: React.FC = () => {
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 供回水温度监测 */}
      <ChartWidget title="供回水温度监测" className="flex-[1.2]">
        <div className="h-full pt-2">
          <TemperatureChart />
        </div>
      </ChartWidget>

      {/* 管网压力监测 */}
      <ChartWidget title="管网压力监测" className="flex-[1]">
        <div className="h-full pt-2">
          <PressureChart />
        </div>
      </ChartWidget>

      {/* 管网流量监测 */}
      <ChartWidget title="管网流量监测" className="flex-[1]">
        <div className="h-full pt-2">
          <FlowMeterChart />
        </div>
      </ChartWidget>
    </div>
  );
};

export default LeftColumn;
