
import { useState, useEffect } from "react";
import { fetchHistoricalDataForPrediction } from "@/services/cryptoService";
import { predictCoinPrice } from "@/services/predictionService";
import { PredictionModelType, PredictionResult } from "@/types/crypto";

interface UseForecastDataProps {
  coinId: string;
  predictionModel: PredictionModelType;
  forecastDays: number;
  historicalDays?: number;
  onError?: (message: string) => void;
}

interface ForecastDataState {
  predictionData: PredictionResult | null;
  isLoading: boolean;
}

const useForecastData = ({
  coinId,
  predictionModel,
  forecastDays,
  historicalDays = 90,
  onError
}: UseForecastDataProps): ForecastDataState => {
  const [state, setState] = useState<ForecastDataState>({
    predictionData: null,
    isLoading: false
  });

  useEffect(() => {
    if (!coinId) return;

    const generateForecast = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const historicalData = await fetchHistoricalDataForPrediction(coinId, historicalDays);
        
        if (!historicalData || historicalData.length < 30) {
          if (onError) {
            onError("Not enough historical data available for prediction");
          }
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const prediction = predictCoinPrice(historicalData, predictionModel, forecastDays);
        setState({ predictionData: prediction, isLoading: false });
      } catch (error) {
        console.error("Forecast error:", error);
        if (onError) {
          onError("Failed to generate forecast. Please try again later.");
        }
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    generateForecast();
  }, [coinId, predictionModel, forecastDays, historicalDays, onError]);

  return state;
};

export default useForecastData;
