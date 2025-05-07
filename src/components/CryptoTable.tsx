
import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coin } from "@/types/crypto";

interface CryptoTableProps {
  coins: Coin[];
  isLoading: boolean;
}

type SortKey = "market_cap_rank" | "current_price" | "price_change_percentage_24h" | "market_cap" | "total_volume";
type SortDir = "asc" | "desc";

export const CryptoTable = ({ coins, isLoading }: CryptoTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("market_cap_rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [sortedCoins, setSortedCoins] = useState<Coin[]>([]);

  useEffect(() => {
    // Create a sorted copy of the coins array
    const sorted = [...coins].sort((a, b) => {
      const aValue = a[sortKey] as number;
      const bValue = b[sortKey] as number;
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      return sortDir === "asc" 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
    
    setSortedCoins(sorted);
  }, [coins, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Format currency with commas and dollars
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value < 10 ? 4 : 2,
    }).format(value);
  };

  // Format large numbers with abbreviations (B, M, etc)
  const formatLargeNumber = (value: number): string => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  const SortIcon = ({ thisSortKey }: { thisSortKey: SortKey }) => {
    if (sortKey !== thisSortKey) return null;
    
    return sortDir === "asc" ? (
      <ArrowUp className="inline-block ml-1 w-4 h-4" />
    ) : (
      <ArrowDown className="inline-block ml-1 w-4 h-4" />
    );
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h Change</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-8 bg-muted/50 rounded animate-pulse-slow"></div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-muted/50 animate-pulse-slow"></div>
                    <div className="ml-3 h-4 w-24 bg-muted/50 rounded animate-pulse-slow"></div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 w-20 ml-auto bg-muted/50 rounded animate-pulse-slow"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 w-16 ml-auto bg-muted/50 rounded animate-pulse-slow"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 w-24 ml-auto bg-muted/50 rounded animate-pulse-slow"></div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="h-4 w-24 ml-auto bg-muted/50 rounded animate-pulse-slow"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:text-primary"
              onClick={() => handleSort("market_cap_rank")}
            >
              Rank <SortIcon thisSortKey="market_cap_rank" />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:text-primary"
              onClick={() => handleSort("current_price")}
            >
              Price <SortIcon thisSortKey="current_price" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:text-primary"
              onClick={() => handleSort("price_change_percentage_24h")}
            >
              24h Change <SortIcon thisSortKey="price_change_percentage_24h" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:text-primary"
              onClick={() => handleSort("market_cap")}
            >
              Market Cap <SortIcon thisSortKey="market_cap" />
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:text-primary"
              onClick={() => handleSort("total_volume")}
            >
              Volume (24h) <SortIcon thisSortKey="total_volume" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCoins.map((coin) => (
            <TableRow key={coin.id}>
              <TableCell>{coin.market_cap_rank}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="ml-2 font-medium">{coin.name}</span>
                  <span className="ml-2 text-xs uppercase text-muted-foreground">
                    {coin.symbol}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(coin.current_price)}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    coin.price_change_percentage_24h >= 0
                      ? "text-crypto-up"
                      : "text-crypto-down"
                  }
                >
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </TableCell>
              <TableCell className="text-right">
                {formatLargeNumber(coin.market_cap)}
              </TableCell>
              <TableCell className="text-right">
                {formatLargeNumber(coin.total_volume)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CryptoTable;
