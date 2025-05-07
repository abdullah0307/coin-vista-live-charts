
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
  error: string | null;
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
    isLoading: false,
    error: null
  });

  useEffect(() => {
    if (!coinId) return;

    const generateForecast = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const historicalData = await fetchHistoricalDataForPrediction(coinId, historicalDays);
        
        if (!historicalData || historicalData.length < 30) {
          const errorMessage = "Not enough historical data available for prediction";
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: errorMessage
          }));
          
          if (onError) {
            onError(errorMessage);
          }
          return;
        }

        const prediction = predictCoinPrice(historicalData, predictionModel, forecastDays);
        setState({ 
          predictionData: prediction, 
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error("Forecast error:", error);
        const errorMessage = "Failed to generate forecast. Please try again later.";
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: errorMessage
        }));
        
        if (onError) {
          onError(errorMessage);
        }
      }
    };

    generateForecast();
  }, [coinId, predictionModel, forecastDays, historicalDays, onError]);

  return state;
};

export default useForecastData;
