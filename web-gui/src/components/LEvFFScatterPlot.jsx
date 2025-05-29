import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const getColor = (povertyPercent) => {
  if (povertyPercent < 10) return '#34D399'; 
  if (povertyPercent < 20) return '#FBBF24'; 
  return '#F87171';
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-white rounded-lg shadow-xl border border-slate-200">
        <p className="font-bold text-base text-slate-800">{data.county}</p>
        <p className="text-sm text-slate-600">Median Income: ${data.med_income.toLocaleString()}</p>
        <p className="text-sm text-slate-600">Life Expectancy: {data.life_expectancy.toFixed(1)} yrs</p>
        <p className="text-sm text-slate-600">Population: {data.population.toLocaleString()}</p>
        <p className="text-sm text-slate-600">Poverty: {data.pov_percent}%</p>
      </div>
    );
  }
  return null;
};

const renderLegend = () => (
    <div className="flex items-center justify-center mt-6 text-sm text-slate-600">
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#34D399]"></div>
            <span>&lt;10% Poverty</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#FBBF24]"></div>
            <span>10-20% Poverty</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#F87171]"></div>
            <span>&gt;20% Poverty</span>
        </div>
        <div className="text-xs text-slate-500 font-semibold ml-4">
            (Bubble size represents population)
        </div>
    </div>
);


export default function ScatterPlot({ data }) {

  const { filteredData, ignoredCounties } = useMemo(() => {
    const ignored = [];
    const filtered = data.filter(item => {
      const percent = parseFloat(item.fast_food_percent);
      const shouldInclude = percent !== 0 && percent !== 100;
  
      if (!shouldInclude) {
        ignored.push(item.county);
      }
  
      return shouldInclude;
    });
  
    return { filteredData: filtered, ignoredCounties: ignored };
  }, [data]);

  const processedData = useMemo(() => {
    return filteredData.map(d => ({
      ...d,
      med_income: Number(d.med_income),
      life_expectancy: Number(d.life_expectancy),
      population: Number(d.population),
      pov_percent: parseFloat(d.pov_percent),

      fill: getColor(parseFloat(d.pov_percent)),
    }));
  }, [data]);

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 40,
            bottom: 20,
            left: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="life_expectancy"
            name="Life Expectancy"
            unit=" yrs"
            domain={[65, 'auto']}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            label={{ value: 'Life Expectancy (years)', position: 'insideBottom', offset: -20, style: { fill: '#334155', fontWeight: 'bold' } }}
          />
          <YAxis
            type="number"
            dataKey="fast_food_percent"
            name="Fast Food Percentage"
            unit="%"
            domain={[0,100]}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            label={{ value: 'Fast Food (%)', angle: -90, position: 'insideLeft', offset: -5, style: { fill: '#334155', fontWeight: 'bold' } }}
          />
          <ZAxis type="number" dataKey="population" range={[50, 800]} />
          
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          
          <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />

          <Scatter name="Counties" data={processedData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}