
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchTopCoins, fetchCoinsList, getDefaultCoins } from "@/services/cryptoService";
import { Coin } from "@/types/crypto";

export function useCryptoData() {
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

  // Get active coin name for forecast
  const getActiveCoinName = () => {
    const coin = coins.find(c => c.id === activeForecastCoin);
    return coin ? coin.name : "Coin";
  };

  return {
    coins,
    selectedCoinIds,
    activeForecastCoin,
    isLoading,
    availableCoins,
    lastUpdated,
    setActiveForecastCoin,
    handleSelectionChange,
    handleRefresh,
    getActiveCoinName
  };
}
