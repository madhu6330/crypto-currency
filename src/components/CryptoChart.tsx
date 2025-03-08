import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale,
  ChartOptions
} from 'chart.js';
import { format } from 'date-fns';
import { Cryptocurrency, ChartData, TimeRange } from '../types';
import { getCryptocurrencyChart, getDaysFromTimeRange } from '../api/cryptoApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface CryptoChartProps {
  cryptocurrency: Cryptocurrency | null;
}

const CryptoChart = ({ cryptocurrency }: CryptoChartProps) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!cryptocurrency) return;
      
      setIsLoading(true);
      try {
        const days = getDaysFromTimeRange(timeRange);
        const data = await getCryptocurrencyChart(cryptocurrency.id, days);
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [cryptocurrency, timeRange]);

  if (!cryptocurrency) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md h-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Select a cryptocurrency to view its chart</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md h-96 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
      </div>
    );
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    
    if (timeRange === '1d') {
      return format(date, 'HH:mm');
    } else if (timeRange === '7d') {
      return format(date, 'EEE');
    } else if (timeRange === '30d' || timeRange === '90d') {
      return format(date, 'MMM dd');
    } else {
      return format(date, 'MMM yyyy');
    }
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
          color: '#6b7280',
        },
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: (value) => `$${Number(value).toLocaleString()}`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `$${Number(context.raw).toLocaleString()}`,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 5,
      },
      line: {
        tension: 0.2,
      },
    },
  };

  const prepareChartData = () => {
    if (!chartData || chartData.prices.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const priceColor = cryptocurrency.price_change_percentage_24h >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
    
    return {
      labels: chartData.prices.map(([timestamp]) => formatDate(timestamp)),
      datasets: [
        {
          label: 'Price',
          data: chartData.prices.map(([, price]) => price),
          borderColor: priceColor,
          backgroundColor: `${priceColor}20`,
          fill: true,
          borderWidth: 2,
        },
      ],
    };
  };

  const timeRangeButtons: { label: string; value: TimeRange }[] = [
    { label: '24H', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: '1Y', value: '1y' },
    { label: 'All', value: 'max' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src={cryptocurrency.image} alt={cryptocurrency.name} className="h-8 w-8 mr-2" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {cryptocurrency.name} ({cryptocurrency.symbol.toUpperCase()})
          </h2>
          <span className={`ml-4 text-lg font-semibold ${
            cryptocurrency.price_change_percentage_24h >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            ${cryptocurrency.current_price.toLocaleString()}
            <span className="ml-2">
              {cryptocurrency.price_change_percentage_24h >= 0 ? '+' : ''}
              {cryptocurrency.price_change_percentage_24h.toFixed(2)}%
            </span>
          </span>
        </div>
        <div className="flex space-x-2">
          {timeRangeButtons.map((button) => (
            <button
              key={button.value}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === button.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setTimeRange(button.value)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        {chartData && chartData.prices.length > 0 ? (
          <Line data={prepareChartData()} options={chartOptions} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoChart;