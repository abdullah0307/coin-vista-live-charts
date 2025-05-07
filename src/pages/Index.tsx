
import React from "react";
import CryptoHeader from "@/components/CryptoHeader";
import CryptoChart from "@/components/CryptoChart";
import CryptoTable from "@/components/CryptoTable";
import CoinSelector from "@/components/CoinSelector";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import ForecastSection from "@/components/dashboard/ForecastSection";
import { useCryptoData } from "@/hooks/useCryptoData";

const Index = () => {
  const {
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
  } = useCryptoData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <DashboardHeader lastUpdated={lastUpdated} />

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
          <ForecastSection 
            coins={coins}
            activeForecastCoin={activeForecastCoin}
            setActiveForecastCoin={setActiveForecastCoin}
            getActiveCoinName={getActiveCoinName}
          />
        )}
        
        {/* Data table */}
        <CryptoTable coins={coins} isLoading={isLoading} />
        
        {/* Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
};

export default Index;
