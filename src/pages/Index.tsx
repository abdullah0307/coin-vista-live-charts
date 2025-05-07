
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import CryptoHeader from "@/components/CryptoHeader";
import CryptoChart from "@/components/CryptoChart";
import CryptoTable from "@/components/CryptoTable";
import CoinSelector from "@/components/CoinSelector";
import { fetchTopCoins, fetchCoinsList, getDefaultCoins } from "@/services/cryptoService";
import { Coin } from "@/types/crypto";

const Index = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoinIds, setSelectedCoinIds] = useState<string[]>(getDefaultCoins());
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
        setLastUpdated(new Date());
      } else if (data.length > 0) {
        // If none of the selected coins were found, use the top coins
        setCoins(data.slice(0, 5));
        setSelectedCoinIds(data.slice(0, 5).map(coin => coin.id));
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
  }, [selectedCoinIds, toast]);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
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
