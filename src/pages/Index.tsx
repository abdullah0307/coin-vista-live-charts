
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";  // Import the Header component
import CryptoHeader from "@/components/CryptoHeader";
import CryptoChart from "@/components/CryptoChart";
import CryptoTable from "@/components/CryptoTable";
import CoinSelector from "@/components/CoinSelector";
import ForecastChart from "@/components/ForecastChart";
import { fetchTopCoins, fetchCoinsList, getDefaultCoins } from "@/services/cryptoService";
import { Coin } from "@/types/crypto";

const Index = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoinIds, setSelectedCoinIds] = useState<string[]>(getDefaultCoins());
  const [activeForecastCoin, setActiveForecastCoin] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availableCoins, setAvailableCoins] = useState<{id: string, name: string, symbol: string}[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchCoinsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTopCoins(100, "usd", true, "1h,24h,7d,30d");
      
      // Filter to only get the selected coins and make sure they exist
      if (!data || data.length === 0) {
        setCoins([]);
        toast({
          title: "No data available",
          description: "Could not fetch cryptocurrency data. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      const filteredCoins = data.filter(coin => 
        selectedCoinIds.includes(coin.id)
      );
      
      if (filteredCoins.length > 0) {
        setCoins(filteredCoins);
        // Set the first coin as the active forecast coin if none is selected
        if (!activeForecastCoin && filteredCoins.length > 0) {
          setActiveForecastCoin(filteredCoins[0].id);
        }
        setLastUpdated(new Date());
      } else if (data.length > 0) {
        // If none of the selected coins were found, use the top coins
        setCoins(data.slice(0, 5));
        setSelectedCoinIds(data.slice(0, 5).map(coin => coin.id));
        setActiveForecastCoin(data[0].id);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching coins data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cryptocurrency data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCoinIds, toast, activeForecastCoin]);

  const fetchAvailableCoins = useCallback(async () => {
    try {
      const coinsList = await fetchCoinsList();
      if (coinsList && coinsList.length > 0) {
        setAvailableCoins(coinsList);
      }
    } catch (error) {
      console.error("Error fetching coins list:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available coins. Please try again later.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Initial data fetch
  useEffect(() => {
    fetchCoinsData();
    fetchAvailableCoins();
    
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      fetchCoinsData();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchCoinsData, fetchAvailableCoins]);

  // Handle coin selection change
  const handleSelectionChange = (coinIds: string[]) => {
    if (Array.isArray(coinIds) && coinIds.length > 0) {
      setSelectedCoinIds(coinIds);
      // Update active forecast coin if it's not in the selection anymore
      if (!coinIds.includes(activeForecastCoin)) {
        setActiveForecastCoin(coinIds[0]);
      }
    } else {
      // If empty selection, fallback to default coins
      setSelectedCoinIds(getDefaultCoins());
      toast({
        title: "Selection Required",
        description: "Please select at least one coin to display.",
      });
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchCoinsData();
    toast({
      title: "Refreshed",
      description: "Cryptocurrency data has been updated.",
    });
  };

  // Get active coin name for forecast
  const getActiveCoinName = () => {
    const coin = coins.find(c => c.id === activeForecastCoin);
    return coin ? coin.name : "Coin";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Add Header component */}
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">CoinVista Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Live cryptocurrency market data
            </p>
          </div>
          <div className="mt-4 lg:mt-0 text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Coin selector */}
        {availableCoins && availableCoins.length > 0 && (
          <CoinSelector
            availableCoins={availableCoins}
            selectedCoins={selectedCoinIds}
            onSelectionChange={handleSelectionChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        )}
        
        {/* Market overview */}
        <CryptoHeader coins={coins} isLoading={isLoading} />
        
        {/* Charts */}
        <CryptoChart coins={coins} isLoading={isLoading} />

        {/* Forecast section */}
        {activeForecastCoin && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Price Forecasting</h2>
              <div className="flex gap-2">
                {coins.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => setActiveForecastCoin(coin.id)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      activeForecastCoin === coin.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {coin.symbol.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <ForecastChart 
              selectedCoinId={activeForecastCoin} 
              coinName={getActiveCoinName()} 
            />
          </div>
        )}
        
        {/* Data table */}
        <CryptoTable coins={coins} isLoading={isLoading} />
        
        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>Data provided by CoinGecko API</p>
          <p className="mt-1">
            CoinVista Dashboard | Built with React + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
