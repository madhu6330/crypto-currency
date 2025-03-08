import { useState, useEffect } from 'react';
import { getTopCryptocurrencies } from './api/cryptoApi';
import { Cryptocurrency } from './types';
import CryptoTable from './components/CryptoTable';
import CryptoChart from './components/CryptoChart';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import { FaMoon, FaSun } from 'react-icons/fa';

function App() {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(10); // Assuming 10 pages by default
  const [darkMode, setDarkMode] = useState<boolean>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const perPage = 50;

  useEffect(() => {
    const fetchCryptocurrencies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTopCryptocurrencies(currentPage, perPage);
        setCryptocurrencies(data);
        if (data.length > 0 && !selectedCrypto) {
          setSelectedCrypto(data[0]);
        }
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
        setError('Failed to fetch cryptocurrency data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCryptocurrencies();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">CryptoDash</h1>
            <button
              onClick={toggleDarkMode}
              className="ml-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
          <SearchBar onSelectCrypto={setSelectedCrypto} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <CryptoChart cryptocurrency={selectedCrypto} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <CryptoTable 
                cryptocurrencies={cryptocurrencies} 
                onSelectCrypto={setSelectedCrypto}
                selectedCrypto={selectedCrypto}
              />
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow-md mt-8 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>CryptoDash © {new Date().getFullYear()} - Cryptocurrency data provided by CoinGecko API</p>
          <p className="text-sm mt-2">
            This dashboard is for informational purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;