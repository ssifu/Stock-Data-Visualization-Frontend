import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { format, parseISO } from 'date-fns';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

// Configure Chart.js to use the date-fns date adapter
Chart.defaults.plugins.tooltip.callbacks.label = function (context) {
  var label = context.dataset.label || '';

  if (label) {
    label += ': ';
  }
  if (context.parsed.y !== null) {
    label += new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(context.parsed.y);
  }

  // Format date using date-fns
  if (context.dataset.xType === 'time') {
    label += ' on ' + format(parseISO(context.parsed.x), 'yyyy-MM-dd'); // Format date as needed
  }

  return label;
};

const StockChart = ({ tradeCodes }) => {
  // State to store the selected trade code
  const [stockData, setStockData] = useState([]);
  const [selectedTradeCode, setSelectedTradeCode] = useState('1JANATAMF');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Define the full URL of your Django API endpoint
        const apiUrl = `https://ssifu.pythonanywhere.com/sql/all-stock-data/`;

        // Make a GET request to the API using async/await
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response JSON
        const data = await response.json();

        // Set the fetched data to the state
        setStockData(data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the async function to fetch data
    fetchData();
  }, []);

  // Filter data based on the selected trade code
  const filteredData = stockData.filter(
    (item) => item.trade_code === selectedTradeCode
  );

  const getCloseData = () => {
    const sortedData = filteredData.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    return sortedData.map((item) => parseFloat(item.close));
  };

  const getVolumeData = () => {
    const sortedData = filteredData.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    return sortedData.map((item) => parseInt(item.volume.replace(/,/g, '')));
  };

  const dates = filteredData
    .map((item) => item.date)
    .sort((a, b) => new Date(a) - new Date(b));

  // Create chart data for the line and bar charts
  const lineChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Close Price',
        data: getCloseData(),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxis: 'y1',
      },
    ],
  };

  const barChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Volume',
        data: getVolumeData(),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxis: 'y2',
      },
    ],
  };

  const barChartoptions = {
    scales: {
      x: {
        type: 'time',
        adapters: {
          date: {
            locale: enUS,
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Volume',
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Close Price',
        },
        min: Math.min(...getCloseData()),
        max: Math.max(...getCloseData()),
      },
    },
  };

  const lineChartoptions = {
    scales: {
      x: {
        type: 'time',
        adapters: {
          date: {
            locale: enUS,
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Close Price',
        },
      },
      y2: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Volume',
        },
        min: 0,
        max: Math.max(...getVolumeData()),
      },
    },
  };

  return (
    <div className="font-mono flex flex-col gap-6">
      {/* Dropdown to select trade code */}
      <div>
        <label
          htmlFor="allTradeCodes"
          className="block text-lg font-medium text-gray-900 lg:text-xl">
          Trade Codes
        </label>
        <select
          className="bg-gray-50 border-4 outline-none border-gray-300 text-gray-900 text-xl rounded-lg focus:ring-blue-500 focus:border-green-500 
          block w-max md:w-36 p-2.5"
          onChange={(e) => setSelectedTradeCode(e.target.value)}
          value={selectedTradeCode}>
          <option value={selectedTradeCode}>{selectedTradeCode}</option>
          {/* Extract unique trade codes */}
          {Array.from(new Set(tradeCodes)).map((code, index) => (
            <option key={index} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
      {stockData.length > 0 ? (
        <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-2 lg:w-6/12">
          {/* Line chart */}
          <Line data={lineChartData} options={lineChartoptions} />
          {/* Bar chart */}
          <Bar data={barChartData} options={barChartoptions} />
        </div>
      ) : (
        <div className="flex gap-2 justify-center text-center m-2">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold">Chart Loading</h1>
        </div>
      )}
    </div>
  );
};

export default StockChart;
