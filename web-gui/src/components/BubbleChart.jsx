import React, { useRef, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
} from "recharts";

const BubbleChart = ({ data }) => {
  const MIN = 1;
  const MAX = 9;

  const chartRef = useRef();
  const [zRange, setZRange] = useState([50, 300]);

  useEffect(() => {
    const updateRange = () => {
      if (chartRef.current) {
        const width = chartRef.current.offsetWidth || 800;
        const min = Math.max(50, width * 0.2);
        const max = Math.max(50, width * 0.8);
        setZRange([min, max]);
      }
    };

    updateRange();
    window.addEventListener("resize", updateRange);
    return () => window.removeEventListener("resize", updateRange);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, z } = payload[0].payload;
      return (
        <div className="bg-white border px-3 py-2 rounded shadow text-sm">
          <p className="font-semibold">{name}</p>
          <p>Score: {MAX + 1 - z}</p>
        </div>
      );
    }
    return null;
  };

  const chartData = data.map((item, index) => ({
    x: 10 + index * 10,
    y: -100,
    z: MAX + MIN - item["urcc"],
    name: item.county || `Item ${index + 1}`,
  }));

  return (
    <div ref={chartRef} className="w-full h-[80px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <XAxis type="number" dataKey="x" hide />
          <YAxis type="number" dataKey="y" hide />
          <ZAxis type="number" dataKey="z" range={zRange} name="urcc" />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={chartData} fill="#2ec7b2" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BubbleChart;
