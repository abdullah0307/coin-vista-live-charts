
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import { fetchHistoricalDataForPrediction } from "@/services/cryptoService";
import { predictCoinPrice } from "@/services/predictionService";
import { PredictionModelType, PredictionResult } from "@/types/crypto";

interface ForecastChartProps {
  selectedCoinId: string;
  coinName?: string;
  days?: number;
}

const MODEL_OPTIONS: { value: PredictionModelType; label: string; description: string }[] = [
  { 
    value: 'arima', 
    label: 'ARIMA', 
    description: 'Statistical baseline forecasting using Autoregressive Integrated Moving Average model' 
  },
  { 
    value: 'prophet', 
    label: 'Prophet', 
    description: 'Trend + seasonality based model (similar to Facebook Prophet)' 
  },
  { 
    value: 'lstm', 
    label: 'LSTM', 
    description: 'Deep learning based Long Short-Term Memory neural network approach' 
  },
];

export const ForecastChart = ({ 
  selectedCoinId, 
  coinName = "Coin", 
  days = 7 
}: ForecastChartProps) => {
  const [predictionModel, setPredictionModel] = useState<PredictionModelType>('arima');
  const [forecastDays, setForecastDays] = useState<number>(7);
  const [historicalDays, setHistoricalDays] = useState<number>(90);
  const [predictionData, setPredictionData] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Format large numbers for y-axis
  const formatYAxis = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Generate forecast when coin or model changes
  useEffect(() => {
    if (!selectedCoinId) return;

    const generateForecast = async () => {
      setIsLoading(true);
      try {
        const historicalData = await fetchHistoricalDataForPrediction(selectedCoinId, historicalDays);
        if (!historicalData || historicalData.length < 30) {
          toast({
            title: "Insufficient Data",
            description: "Not enough historical data available for prediction",
            variant: "destructive",
          });
          return;
        }

        const prediction = predictCoinPrice(historicalData, predictionModel, forecastDays);
        setPredictionData(prediction);
      } catch (error) {
        console.error("Forecast error:", error);
        toast({
          title: "Forecast Error",
          description: "Failed to generate forecast. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateForecast();
  }, [selectedCoinId, predictionModel, forecastDays, historicalDays, toast]);

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

  return (
    <Card className="bg-card rounded-lg shadow-lg mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle className="text-xl">Price Forecast</CardTitle>
            <CardDescription>
              {coinName} price prediction for the next {forecastDays} days
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Select Prediction Model:</h4>
          <RadioGroup 
            className="flex flex-col sm:flex-row gap-4"
            value={predictionModel}
            onValueChange={(value) => setPredictionModel(value as PredictionModelType)}
          >
            {MODEL_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-start space-x-2">
                <RadioGroupItem value={option.value} id={`model-${option.value}`} />
                <div className="grid gap-1">
                  <Label htmlFor={`model-${option.value}`}>{option.label}</Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant={forecastDays === 7 ? "default" : "outline"}
            size="sm" 
            onClick={() => setForecastDays(7)}
          >
            7 Days
          </Button>
          <Button 
            variant={forecastDays === 14 ? "default" : "outline"}
            size="sm" 
            onClick={() => setForecastDays(14)}
          >
            14 Days
          </Button>
          <Button 
            variant={forecastDays === 30 ? "default" : "outline"}
            size="sm" 
            onClick={() => setForecastDays(30)}
          >
            30 Days
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !predictionData ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No prediction data available</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData()}
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
                <ReferenceLine x={chartData()[0]?.date} stroke="#ff4444" label="Today" />
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
                  // Fix: Convert array of numbers to a string baseLine to point to the dataKey
                  baseLine="forecast"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fillOpacity={0.2}
                  fill="url(#colorConfidence)"
                  isAnimationActive={true}
                  // Fix: Convert array of numbers to a string baseLine to point to the dataKey
                  baseLine="forecast"
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Shaded area represents prediction confidence interval
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastChart;
