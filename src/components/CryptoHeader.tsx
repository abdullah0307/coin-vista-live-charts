
import { useEffect, useState } from "react";
import { Coin } from "@/types/crypto";

interface CryptoHeaderProps {
  coins: Coin[];
  isLoading: boolean;
}

export const CryptoHeader = ({ coins, isLoading }: CryptoHeaderProps) => {
  const [totalMarketCap, setTotalMarketCap] = useState<number>(0);
  const [avgChangePercent, setAvgChangePercent] = useState<number>(0);
  const [totalVolume, setTotalVolume] = useState<number>(0);

  useEffect(() => {
    if (coins.length > 0) {
      // Calculate total market cap
      const marketCap = coins.reduce(
        (sum, coin) => sum + (coin.market_cap || 0),
        0
      );
      setTotalMarketCap(marketCap);

      // Calculate average 24h change percentage
      const totalChange = coins.reduce(
        (sum, coin) => sum + (coin.price_change_percentage_24h || 0),
        0
      );
      setAvgChangePercent(totalChange / coins.length);

      // Calculate total 24h trading volume
      const volume = coins.reduce(
        (sum, coin) => sum + (coin.total_volume || 0),
        0
      );
      setTotalVolume(volume);
    }
  }, [coins]);

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Format large numbers with abbreviations (B for billions, T for trillions)
  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else {
      return `$${formatNumber(num)}`;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-card rounded-lg p-4 shadow-md">
        <h3 className="text-sm text-muted-foreground">Total Market Cap</h3>
        {isLoading ? (
          <div className="h-6 w-24 bg-muted/50 rounded animate-pulse-slow mt-1"></div>
        ) : (
          <p className="text-xl font-bold">{formatLargeNumber(totalMarketCap)}</p>
        )}
      </div>
      <div className="bg-card rounded-lg p-4 shadow-md">
        <h3 className="text-sm text-muted-foreground">24h Avg Change</h3>
        {isLoading ? (
          <div className="h-6 w-20 bg-muted/50 rounded animate-pulse-slow mt-1"></div>
        ) : (
          <p
            className={`text-xl font-bold ${
              avgChangePercent >= 0 ? "text-crypto-up" : "text-crypto-down"
            }`}
          >
            {avgChangePercent >= 0 ? "+" : ""}
            {avgChangePercent.toFixed(2)}%
          </p>
        )}
      </div>
      <div className="bg-card rounded-lg p-4 shadow-md">
        <h3 className="text-sm text-muted-foreground">24h Total Volume</h3>
        {isLoading ? (
          <div className="h-6 w-24 bg-muted/50 rounded animate-pulse-slow mt-1"></div>
        ) : (
          <p className="text-xl font-bold">{formatLargeNumber(totalVolume)}</p>
        )}
      </div>
    </div>
  );
};

export default CryptoHeader;
