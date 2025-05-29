import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import StateCard from './components/StateCard';
import NationalCard from './components/NationalCard';
import CountyCard from './components/CountyCard';
import ScatterPlot from './components/ScatterPlot';
import IvFFScatterPlot from './components/IvFFScatterPlot';
import LEvFFScatterPlot from './components/LEvFFScatterPlot';
import BubbleChart from './components/BubbleChart';

function App() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [stateInfo, setStateInfo] = useState(null);
  const [countyData, setCountyData] = useState([]);
  const [nationalData, setNationalData] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState('All Counties');

  const sortedCountyData = useMemo(() => {
    return [...countyData].sort((a, b) => a.county.localeCompare(b.county));
  }, [countyData]);

  const filteredCountyData = useMemo(() => {
    if (selectedCounty === 'All Counties') return sortedCountyData;
    return sortedCountyData.filter(d => d.county === selectedCounty);
  }, [sortedCountyData, selectedCounty]);

  const ignoredCounties = useMemo(() => {
    return filteredCountyData.filter(
      (item) => item.fast_food_percent === '0.00' || item.fast_food_percent === '100.00'
    ).map((item) => item.county);
  }, [filteredCountyData]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios.get('http://192.168.68.76:50000/api/us/states/')
      .then(res => setStates(res.data))
      .catch(err => console.error('Error fetching states:', err));
  }, []);

  useEffect(() => {
    if (selectedState) {
      axios.get(`http://192.168.68.76:50000/api/us/states/${selectedState}/county`)
        .then(res => {
          setCountyData(res.data);
        })
        .catch(err => console.error('Error fetching state data:', err));
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedState) {
      axios.get(`http://192.168.68.76:50000/api/us/states/${selectedState}/`)
        .then(res => {
          setStateInfo(res.data[0]);
        })
        .catch(err => console.error('Error fetching state data:', err));
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedState) {
      axios.get(`http://192.168.68.76:50000/api/us`)
        .then(res => {
          setNationalData(res.data[0]);
        })
        .catch(err => console.error('Error fetching state data:', err));
    }
  }, [selectedState]);

  return (
    <div className="bg-slate-50 font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-4xl font-extrabold text-slate-800 text-center">Data Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="p-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200 ease-in-out bg-white shadow-sm w-full md:w-1/3"
          >
            <option value="">Select a State</option>
            {states.map(state => (
              <option key={state.state_abbr} value={state.state_abbr}>
                {state.state}
              </option>
            ))}
          </select>

          {sortedCountyData.length > 0 && (
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="p-3 rounded-lg border-2 border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-200 ease-in-out bg-white shadow-sm w-full md:w-1/3"
            >
              <option value="All Counties">All Counties</option>
              {sortedCountyData.map((county, idx) => (
                <option key={idx} value={county.county}>
                  {county.county}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {stateInfo && <StateCard stateInfo={stateInfo} />}
          {selectedCounty !== "All Counties" && <CountyCard data={ filteredCountyData[0] } />}
          {nationalData && <NationalCard nationalData={nationalData} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {Array.isArray(filteredCountyData) && filteredCountyData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-bold text-slate-700 mb-3">Income vs Life Expectancy</h2>
              <ScatterPlot data={filteredCountyData} />
            </div>
          )}

          {Array.isArray(filteredCountyData) && filteredCountyData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-bold text-slate-700 mb-3">Income vs Fast Food %</h2>
              <IvFFScatterPlot data={filteredCountyData} />
            </div>
          )}

          {Array.isArray(filteredCountyData) && filteredCountyData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-bold text-slate-700 mb-3">Life Expectancy vs Fast Food %</h2>
              <LEvFFScatterPlot data={filteredCountyData} />
            </div>
          )}
        </div>

        {ignoredCounties.length > 0 && (
          <div className="mt-4 text-center col-span-full">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 hover:underline text-sm"
            >
              Click here to view ignored counties
            </button>
          </div>
        )}

        {isModalOpen && (
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded-xl shadow-2xl max-h-[80vh] w-[90vw] max-w-md overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-2 text-slate-700">Ignored Counties</h3>
              <p className="text-sm text-slate-600 mb-2">
              These counties were excluded from the chart because of incomplete/ inaccurate restaurant data.
              </p>
              <div className="max-h-64 overflow-y-auto border-t pt-2 text-sm text-slate-700">
              <ul className="list-disc list-inside space-y-1">
                  {ignoredCounties.map((county, idx) => (
                    <li key={idx}>{county}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 text-right">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-blue-300 text-white rounded hover:bg-blue-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {Array.isArray(filteredCountyData) && filteredCountyData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-bold text-slate-700">Rural Urban Continuum Code</h2>
            <p className="text-slate-600 mt-2 mb-4">A code from 1 (most urban) to 9 (most rural) that distinguishes metropolitan counties by size and nonmetropolitan counties by degree of urbanization and adjacency to a metro area.</p>
            <BubbleChart data={filteredCountyData} />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <p className="text-slate-700 leading-relaxed">
            This dashboard provides a visualization of U.S. census data, allowing for an exploration of demographic and economic indicators across different states and counties. The data is intended for informational purposes and to highlight regional trends.<br></br>
          </p>
          <p className="text-slate-700 leading-relaxed"><br></br>Disclaimer</p>
          <p className="text-slate-700 leading-relaxed">
          The restaurant data presented are approximate and sourced from <a className="text-blue-500" href="https://www.openstreetmap.org/">OpenStreetMaps</a>  (OSM). The classification of establishments as "fast food" is based on subjective criteria and personal judgment. This categorization may not align with standard or official definitions.

          The following types of restaurants have been included under the "fast food" classification for the purposes of this project:
          </p>
          <p className='text-sm text-slate-700 leading-relaxed'>
          McDonald's, Burger King, KFC, Subway, Pizza Hut, Domino's, Taco Bell, Wendy's, Dunkin', Starbucks, Sonic, Panda Express, Popeyes, Jack in the Box, Arby's, Carl's Jr., Hardee's, Little Caesars, Wingstop, Krystal
          </p>
          <p className="text-slate-500 text-sm mt-4">
            <span className="font-semibold">Sources:</span> Data is sourced from the U.S. Census Bureau and other public datasets.
          </p>
        </div>
      </main>

      <footer className="bg-white mt-8 py-6">
          <div className="container mx-auto px-6 text-center text-slate-500">
              <p>&copy; {new Date().getFullYear()} Tamhid Chowdhury. All Rights Reserved.</p>
          </div>
      </footer>
    </div>
  );
}

export default App;