import { useState } from 'react';
import { Cryptocurrency } from '../types';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface CryptoTableProps {
  cryptocurrencies: Cryptocurrency[];
  onSelectCrypto: (crypto: Cryptocurrency) => void;
  selectedCrypto: Cryptocurrency | null;
}

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'market_cap' | 'total_volume';
type SortDirection = 'asc' | 'desc';

const CryptoTable = ({ cryptocurrencies, onSelectCrypto, selectedCrypto }: CryptoTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <FaSort className="inline ml-1" />;
    return sortDirection === 'asc' ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
  };

  const sortedCryptocurrencies = [...cryptocurrencies].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatNumber = (num: number, digits = 2) => {
    if (num === null || num === undefined) return 'N/A';
    
    if (Math.abs(num) >= 1e9) {
      return `$${(num / 1e9).toFixed(digits)}B`;
    } else if (Math.abs(num) >= 1e6) {
      return `$${(num / 1e6).toFixed(digits)}M`;
    } else if (Math.abs(num) >= 1e3) {
      return `$${(num / 1e3).toFixed(digits)}K`;
    } else {
      return `$${num.toFixed(digits)}`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" 
                onClick={() => handleSort('market_cap_rank')}>
              Rank {getSortIcon('market_cap_rank')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Coin
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('current_price')}>
              Price {getSortIcon('current_price')}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price_change_percentage_24h')}>
              24h Change {getSortIcon('price_change_percentage_24h')}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('market_cap')}>
              Market Cap {getSortIcon('market_cap')}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('total_volume')}>
              Volume (24h) {getSortIcon('total_volume')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedCryptocurrencies.map((crypto) => (
            <tr 
              key={crypto.id} 
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${selectedCrypto?.id === crypto.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => onSelectCrypto(crypto)}
            >
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {crypto.market_cap_rank}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <img src={crypto.image} alt={crypto.name} className="h-6 w-6 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{crypto.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{crypto.symbol.toUpperCase()}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                ${crypto.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </td>
              <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
                crypto.price_change_percentage_24h > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {crypto.price_change_percentage_24h > 0 ? '+' : ''}
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                {formatNumber(crypto.market_cap)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                {formatNumber(crypto.total_volume)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CryptoTable;