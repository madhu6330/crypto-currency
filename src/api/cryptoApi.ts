import axios from 'axios';
import { Cryptocurrency, ChartData, TimeRange } from '../types';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const getTopCryptocurrencies = async (page = 1, perPage = 50): Promise<Cryptocurrency[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page: page,
        sparkline: false,
        price_change_percentage: '24h',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    return [];
  }
};

export const getCryptocurrencyChart = async (id: string, days: string): Promise<ChartData> => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching chart data for ${id}:`, error);
    return { prices: [], market_caps: [], total_volumes: [] };
  }
};

export const searchCryptocurrencies = async (query: string): Promise<Cryptocurrency[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        query: query,
      },
    });
    
    // Search API returns different format, so we need to fetch details for each coin
    const coins = response.data.coins.slice(0, 10);
    if (coins.length === 0) return [];
    
    const ids = coins.map((coin: any) => coin.id).join(',');
    const detailsResponse = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: ids,
        order: 'market_cap_desc',
        sparkline: false,
        price_change_percentage: '24h',
      },
    });
    
    return detailsResponse.data;
  } catch (error) {
    console.error('Error searching cryptocurrencies:', error);
    return [];
  }
};

export const getDaysFromTimeRange = (timeRange: TimeRange): string => {
  switch (timeRange) {
    case '1d': return '1';
    case '7d': return '7';
    case '30d': return '30';
    case '90d': return '90';
    case '1y': return '365';
    case 'max': return 'max';
    default: return '7';
  }
};