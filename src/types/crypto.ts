
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  sparkline_in_7d: {
    price: number[];
  };
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
}

export interface CoinHistoricalData {
  prices: number[][];
  market_caps: number[][];
  total_volumes: number[][];
}

export interface ChartData {
  name: string;
  value: number;
}

export type PredictionModelType = 'arima' | 'prophet' | 'lstm';

export interface PredictionResult {
  forecast: number[];
  upperBound: number[];
  lowerBound: number[];
  dates: string[];
}
