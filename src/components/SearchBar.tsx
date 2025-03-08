import { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { searchCryptocurrencies } from '../api/cryptoApi';
import { Cryptocurrency } from '../types';

interface SearchBarProps {
  onSelectCrypto: (crypto: Cryptocurrency) => void;
}

const SearchBar = ({ onSelectCrypto }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Cryptocurrency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const data = await searchCryptocurrencies(query);
          setResults(data);
          setShowResults(true);
        } catch (error) {
          console.error('Error searching cryptocurrencies:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (crypto: Cryptocurrency) => {
    onSelectCrypto(crypto);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cryptocurrencies..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
          </div>
        )}
      </div>
      
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {results.map((crypto) => (
              <li 
                key={crypto.id}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => handleSelect(crypto)}
              >
                <div className="flex items-center">
                  <img src={crypto.image} alt={crypto.name} className="h-6 w-6 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{crypto.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{crypto.symbol.toUpperCase()}</div>
                  </div>
                  <div className="ml-auto text-sm text-gray-900 dark:text-gray-100">
                    ${crypto.current_price.toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;