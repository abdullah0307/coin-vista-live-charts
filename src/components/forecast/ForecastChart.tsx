
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PredictionModelType } from "@/types/crypto";
import ModelSelector from "./ModelSelector";
import TimeframeSelector from "./TimeframeSelector";
import ForecastChartVisualization from "./ForecastChartVisualization";
import useForecastData from "@/hooks/useForecastData";

interface ForecastChartProps {
  selectedCoinId: string;
  coinName?: string;
  days?: number;
}

const ForecastChart = ({ 
  selectedCoinId, 
  coinName = "Coin", 
  days = 7 
}: ForecastChartProps) => {
  const [predictionModel, setPredictionModel] = useState<PredictionModelType>('arima');
  const [forecastDays, setForecastDays] = useState<number>(7);
  const [historicalDays] = useState<number>(90);
  const { toast } = useToast();

  const showErrorToast = (message: string) => {
    toast({
      title: "Forecast Error",
      description: message,
      variant: "destructive",
    });
  };

  const { predictionData, isLoading, error } = useForecastData({
    coinId: selectedCoinId,
    predictionModel,
    forecastDays,
    historicalDays,
    onError: showErrorToast
  });

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
        <ModelSelector 
          selectedModel={predictionModel} 
          onModelChange={setPredictionModel} 
        />
        
        <TimeframeSelector 
          selectedDays={forecastDays} 
          onDaysChange={setForecastDays} 
        />

        <ForecastChartVisualization 
          predictionData={predictionData} 
          isLoading={isLoading}
          error={error}
        />
      </CardContent>
    </Card>
  );
};

export default ForecastChart;
