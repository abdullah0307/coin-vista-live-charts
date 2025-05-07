
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PredictionResult } from "@/types/crypto";

interface ForecastChartVisualizationProps {
  predictionData: PredictionResult | null;
  isLoading: boolean;
}

const ForecastChartVisualization = ({ predictionData, isLoading }: ForecastChartVisualizationProps) => {
  // Format large numbers for y-axis
  const formatYAxis = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Transform prediction data for chart display
  const chartData = () => {
    if (!predictionData) return [];
    
    return predictionData.dates.map((date, i) => ({
      date,
      forecast: predictionData.forecast[i],
      upperBound: predictionData.upperBound[i],
      lowerBound: predictionData.lowerBound[i],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!predictionData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No prediction data available</p>
      </div>
    );
  }

  const data = chartData();
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
        >
          <defs>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tick={{ fill: "#9ca3af" }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            width={80}
            tick={{ fill: "#9ca3af" }}
            domain={['auto', 'auto']}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <Tooltip />
          <ReferenceLine x={data[0]?.date} stroke="#ff4444" label="Today" />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorForecast)"
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="upperBound"
            stroke="transparent"
            fillOpacity={0}
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stroke="transparent"
            fillOpacity={0}
          />
          <Area
            type="monotone"
            dataKey="upperBound"
            stroke="none"
            fillOpacity={0.2}
            fill="url(#colorConfidence)"
            isAnimationActive={true}
          />
          <Area
            type="monotone"
            dataKey="lowerBound"
            stroke="none"
            fillOpacity={0.2}
            fill="url(#colorConfidence)"
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-muted-foreground mt-2">
        Shaded area represents prediction confidence interval
      </p>
    </div>
  );
};

export default ForecastChartVisualization;
