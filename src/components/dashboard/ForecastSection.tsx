
import React from "react";
import { Coin } from "@/types/crypto";
import ForecastChart from "@/components/forecast/ForecastChart";

interface ForecastSectionProps {
  coins: Coin[];
  activeForecastCoin: string;
  setActiveForecastCoin: (coinId: string) => void;
  getActiveCoinName: () => string;
}

const ForecastSection = ({ 
  coins, 
  activeForecastCoin, 
  setActiveForecastCoin,
  getActiveCoinName 
}: ForecastSectionProps) => {
  if (!activeForecastCoin) return null;

  return (
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
  );
};

export default ForecastSection;
