// import React, { useMemo } from 'react';
// import {
//   ResponsiveContainer, ScatterChart, Scatter,
//   XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend
// } from 'recharts';
// import CustomTooltip from './CustomTooltips/IvFFCustomToolKit';
// import CustomLegend from './CustomTooltips/CustomLegend';

// // Helper to map poverty % to a color
// const getColorByPoverty = (pov) => {
//   if (pov < 10) return '#7fbf7f';       // Green
//   if (pov < 20) return '#fdbf6f';       // Orange
//   return '#fc4e2a';                     // Red
// };

// export default function BubbleChart({ data, colorByPoverty = true }) {
//   const { filteredData, ignoredCounties } = useMemo(() => {
//     const ignored = [];
//     const filtered = data.filter(item => {
//       const percent = parseFloat(item.fast_food_percent);
//       const shouldInclude = percent !== 0 && percent !== 100;
  
//       if (!shouldInclude) {
//         ignored.push(item.county);
//       }
  
//       return shouldInclude;
//     });
  
//     return { filteredData: filtered, ignoredCounties: ignored };
//   }, [data]);

//   const parsedData = filteredData.map(d => {
//     const povPercent = parseFloat(d.pov_percent);
//     return {
//       ...d,
//       med_income: Number(d.med_income),
//       fast_food_percent: parseFloat(d.fast_food_percent),
//       population: Number(d.population),
//       color: colorByPoverty ? getColorByPoverty(povPercent) : '#8884d8',
//     };
//   });

//   return (
//     <div className="h-[500px] bg-white rounded-2xl p-4">
//       <ResponsiveContainer width="100%" height="100%">
//         <ScatterChart>
//           <CartesianGrid />
//           <XAxis
//             type="number"
//             dataKey="med_income"
//             name="Median Household Income"
//             unit="$"
//             tickFormatter={v => `$${v.toLocaleString()}`}
//             domain={[40000, 'auto']}
//           />
//           <YAxis
//             type="number"
//             dataKey="life_expectancy"
//             name="Life Expectancy"
//             unit="yrs"
//             domain={[65, 100]}
//           />
//           <ZAxis
//             type="number"
//             dataKey="population"
//             name="Population"
//             range={[50, 500]}
//           />
//           <Tooltip content={<CustomTooltip />} />
//           <Scatter
//             name="Counties"
//             data={parsedData}
//             shape={({ cx, cy, size, payload }) => (
//               <circle cx={cx} cy={cy} r={Math.sqrt(size) / 2} fill={payload.color} fillOpacity={0.8} />
//             )}
//           />
//         </ScatterChart>
//         <CustomLegend/>
//       </ResponsiveContainer>
//     </div>
//   );
// }



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

// --- Reusable Color Helper ---
// Maps a poverty percentage to a specific color for visual consistency.
const getColor = (povertyPercent) => {
  if (povertyPercent < 10) return '#34D399'; // Emerald 400
  if (povertyPercent < 20) return '#FBBF24'; // Amber 400
  return '#F87171'; // Red 400
};

// --- Custom Tooltip Component ---
// Renders a styled tooltip when a user hovers over a data point.
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

// --- Custom Legend Content ---
// Defines the content and style of the chart's legend.
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

// --- Main ScatterPlot Component ---
export default function ScatterPlot({ data }) {
  // Memoized data processing to prevent re-calculations on every render.
  const processedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      med_income: Number(d.med_income),
      life_expectancy: Number(d.life_expectancy),
      population: Number(d.population),
      pov_percent: parseFloat(d.pov_percent),
      // Assign color directly to each data point
      fill: getColor(parseFloat(d.pov_percent)),
    }));
  }, [data]);

  return (
    // The main container for the chart with padding
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 40,
            bottom: 30, // Increased bottom margin for labels/legend
            left: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="med_income"
            name="Median Household Income"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            domain={[dataMin => (Math.floor(dataMin / 10000) * 10000), 'auto']}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            label={{ value: 'Median Household Income', position: 'insideBottom', offset: -20, style: { fill: '#334155', fontWeight: 'bold' } }}
          />
          <YAxis
            type="number"
            dataKey="life_expectancy"
            name="Life Expectancy"
            unit=" yrs"
            domain={[65, 'auto']}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            label={{ value: 'Life Expectancy (years)', angle: -90, position: 'insideLeft', offset: -5, style: { fill: '#334155', fontWeight: 'bold' } }}
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