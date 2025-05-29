import React from 'react';

export default function StateCard({ stateInfo }) {
  return (
    <div className="w-full">
      <div className="bg-white-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-slate-200">
        <h2 className="text-xl font-semibold">{stateInfo.state}</h2>
        <p>Median Income: ${stateInfo.med_income?.toLocaleString()}</p>
        <p>Life Expectancy: {stateInfo.life_expectancy} years</p>
        <p>Population: {stateInfo.population?.toLocaleString()}</p>
        <p>Poverty Rate: {stateInfo.pov_percent}%</p>
        <p>Total Number of Restaurants: {stateInfo.restaurant_all}</p>
        <p>Percentage of Fast Food Places: {stateInfo.fast_food_percent}</p>
      </div>
    </div>
  );
}
