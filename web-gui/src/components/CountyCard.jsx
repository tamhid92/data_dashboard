import React from 'react';

export default function CountyCard({ data }) {
  return (
    <div className="w-full">
      <div className="bg-white-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-slate-200">
        <h2 className="text-xl font-semibold">{data.county}</h2>
        <p>Median Income: ${data.med_income?.toLocaleString()}</p>
        <p>Life Expectancy: {data.life_expectancy} years</p>
        <p>Population: {data.population?.toLocaleString()}</p>
        <p>Poverty Rate: {data.pov_percent}%</p>
        <p>Total Number of Restaurants: {data.restaurant_all}</p>
        <p>Percentage of Fast Food Places: {data.fast_food_percent}</p>
        <p>Urban Influence Code: {data.uic}</p>
      </div>
    </div>
  );
}
