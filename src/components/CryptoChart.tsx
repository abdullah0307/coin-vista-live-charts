import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coin } from "@/types/crypto";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface CryptoChartProps {
  coins: Coin[];
  isLoading: boolean;
}

type TimeRange = "1D" | "7D" | "30D";

export const CryptoChart = ({ coins, isLoading }: CryptoChartProps) => {
  const [activeTab, setActiveTab] = useState<"price" | "marketCap" | "volume">("price");
  const [timeRange, setTimeRange] = useState<TimeRange>("7D");
  const [chartData, setChartData] = useState<any[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  // Generate random distinct colors for each coin
  useEffect(() => {
    // Set predefined colors for common coins
    const predefinedColors: Record<string, string> = {
      bitcoin: "#f7931a",
      ethereum: "#627eea",
      binancecoin: "#f3ba2f", 
      cardano: "#0033ad",
      solana: "#00ffa3",
    };
    
    // Generate colors for coins
    const newColors = coins.map(coin => {
      // Try to use predefined color first
      if (predefinedColors[coin.id]) {
        return predefinedColors[coin.id];
      }
      
      // Otherwise generate a color based on name hash
      let hash = 0;
      for (let i = 0; i < coin.name.length; i++) {
        hash = coin.name.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      let color = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
      }
      
      return color;
    });
    
    setColors(newColors);
  }, [coins]);

  useEffect(() => {
    if (coins.length === 0) return;

    if (activeTab === "price") {
      const priceData = generatePriceChartData(coins);
      setChartData(priceData);
    } else if (activeTab === "marketCap") {
      const marketCapData = generateMarketCapChartData(coins);
      setChartData(marketCapData);
    } else {
      const volumeData = generateVolumeChartData(coins);
      setChartData(volumeData);
    }
  }, [coins, activeTab, timeRange]);

  // Generate price chart data from sparkline data
  const generatePriceChartData = (coins: Coin[]) => {
    if (coins.length === 0 || !coins[0].sparkline_in_7d) return [];
    
    const dataPoints = coins[0].sparkline_in_7d.price.length;
    const pointsToTake = dataPoints > 0 ? Math.min(dataPoints, 25) : 0;
    
    if (pointsToTake === 0) return [];
    
    const step = Math.floor(dataPoints / pointsToTake);
    const data = [];
    
    for (let i = 0; i < dataPoints; i += step) {
      if (data.length >= pointsToTake) break;
      
      const point: any = { name: i };
      
      coins.forEach((coin, coinIndex) => {
        if (coin.sparkline_in_7d && coin.sparkline_in_7d.price && coin.sparkline_in_7d.price[i]) {
          point[coin.name] = coin.sparkline_in_7d.price[i];
        } else {
          point[coin.name] = null;
        }
      });
      
      data.push(point);
    }
    
    return data;
  };

  // Generate market cap chart data 
  const generateMarketCapChartData = (coins: Coin[]) => {
    if (coins.length === 0) return [];
    
    return [
      {
        name: "Market Cap",
        ...Object.fromEntries(
          coins.map(coin => [coin.name, coin.market_cap])
        )
      }
    ];
  };

  // Generate volume chart data
  const generateVolumeChartData = (coins: Coin[]) => {
    if (coins.length === 0) return [];
    
    return [
      {
        name: "24h Volume",
        ...Object.fromEntries(
          coins.map(coin => [coin.name, coin.total_volume])
        )
      }
    ];
  };
  
  // Format large numbers for y-axis
  const formatYAxis = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  // Format tooltip values
  const formatTooltipValue = (value: number) => {
    if (activeTab === "price") {
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  };

  // Custom tooltip formatter
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    
    if (!active || !payload || payload.length === 0) return null;
    
    return (
      <div className="bg-card border border-border p-2 rounded-md shadow-md">
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="font-medium">{entry.name}:</span>
            <span>{formatTooltipValue(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderChartContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }
    
    if (activeTab === "price") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: "#9ca3af" }} />
            <YAxis 
              tickFormatter={formatYAxis} 
              width={80}
              tick={{ fill: "#9ca3af" }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            {coins.map((coin, index) => (
              <Line
                key={coin.id}
                type="monotone"
                dataKey={coin.name}
                stroke={colors[index]}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      // Bar chart for marketCap or volume
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: "#9ca3af" }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fill: "#9ca3af" }} />
            <Tooltip content={renderTooltip} />
            <Legend />
            {coins.map((coin, index) => (
              <Bar
                key={coin.id}
                dataKey={coin.name}
                fill={colors[index]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="price">Price</TabsTrigger>
            <TabsTrigger value="marketCap">Market Cap</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {(["1D", "7D", "30D"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-2 py-1 text-xs",
                timeRange === range ? "bg-primary text-primary-foreground" : ""
              )}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>
      
      {renderChartContent()}
    </div>
  );
};

export default CryptoChart;
