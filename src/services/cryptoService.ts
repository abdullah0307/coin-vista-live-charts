
import { Coin, CoinHistoricalData } from "../types/crypto";

const API_BASE_URL = "https://api.coingecko.com/api/v3";
const DEFAULT_CURRENCY = "usd";
const DEFAULT_COINS = ["bitcoin", "ethereum", "ripple", "cardano", "solana", "binancecoin", "polkadot", "dogecoin"];

/**
 * Fetches top cryptocurrencies data
 */
export async function fetchTopCoins(
  limit: number = 20,
  currency: string = DEFAULT_CURRENCY,
  sparkline: boolean = true,
  priceChangePercentage: string = "1h,24h,7d,30d"
): Promise<Coin[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=${sparkline}&price_change_percentage=${priceChangePercentage}`
    );
    
    if (!response.ok) {
      console.error("API Error:", response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching cryptocurrency data:", error);
    return [];
  }
}

/**
 * Fetches historical data for a specific coin
 */
export async function fetchCoinHistory(
  coinId: string,
  days: number = 7,
  currency: string = DEFAULT_CURRENCY
): Promise<CoinHistoricalData | null> {
  try {
    if (!coinId) {
      console.error("No coin ID provided for history fetch");
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch historical data for ${coinId}:`, response.status, response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching historical data for ${coinId}:`, error);
    return null;
  }
}

/**
 * Fetches historical data for time series prediction (more data points)
 */
export async function fetchHistoricalDataForPrediction(
  coinId: string, 
  days: number = 90, 
  currency: string = DEFAULT_CURRENCY
): Promise<number[][] | null> {
  try {
    if (!coinId) {
      console.error("No coin ID provided for prediction data");
      return null;
    }
    
    const data = await fetchCoinHistory(coinId, days, currency);
    return data && data.prices ? data.prices : null;
  } catch (error) {
    console.error(`Error fetching prediction data for ${coinId}:`, error);
    return null;
  }
}

/**
 * Fetches available coins list
 */
export async function fetchCoinsList(): Promise<{id: string, name: string, symbol: string}[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/coins/list`);
    
    if (!response.ok) {
      console.error("Failed to fetch coins list:", response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching coins list:", error);
    return [];
  }
}

export const getDefaultCoins = (): string[] => DEFAULT_COINS;
