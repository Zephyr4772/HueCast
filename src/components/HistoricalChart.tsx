import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { HistoricalDataPoint } from '../utils/aqiApi';
import { AQILevel, getAQILevel } from '../utils/aqiLevels';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoricalChartProps {
  data: HistoricalDataPoint[];
  cityName: string;
  className?: string;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data, cityName, className = '' }) => {
  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 text-center ${className}`}>
        <p className="text-gray-500">No historical data available for {cityName}</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: data.slice(-timeRange).map(item => {
      const date = new Date(item.time.s);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'AQI',
        data: data.slice(-timeRange).map(item => item.aqi),
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: (context: any) => {
          const value = context.dataset.data[context.dataIndex];
          const level = getAQILevel(value);
          return level.color;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const level = getAQILevel(value);
            return `${value} - ${level.level} (${level.description})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'AQI',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Air Quality Trend - {cityName}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 7
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 30
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>
      <div className="h-64 w-full">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>Hover over points to see AQI details</p>
      </div>
    </div>
  );
};

export default HistoricalChart;
