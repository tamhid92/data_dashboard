import React from 'react';

export default function NationalCard({ nationalData }) {
  return (
    <div className="w-full">
      <div className="bg-white-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-slate-200">
        <h2 className="text-xl font-semibold">USA</h2>
        <p>Median Income: ${nationalData.med_income?.toLocaleString()}</p>
        <p>Life Expectancy: {nationalData.life_expectancy} years</p>
        <p>Population: {nationalData.population?.toLocaleString()}</p>
        <p>Poverty Rate: {nationalData.pov_percent}%</p>
      </div>
    </div>
  );
}
