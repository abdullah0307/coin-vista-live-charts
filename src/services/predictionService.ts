
type TimeSeriesData = number[][];
type ModelType = 'arima' | 'prophet' | 'lstm';

interface PredictionResult {
  forecast: number[];
  upperBound: number[];
  lowerBound: number[];
  dates: string[];
}

/**
 * Simple moving average prediction model
 * This is a simplified implementation as a placeholder for ARIMA
 */
function predictWithARIMA(data: TimeSeriesData, daysToPredict: number): PredictionResult {
  // Extract just the prices from the time series
  const prices = data.map(point => point[1]);
  
  // Calculate moving average (window size of 7 days)
  const windowSize = 7;
  const lastPrice = prices[prices.length - 1];
  
  // Simple moving average of last windowSize days
  const movingAverage = prices.slice(Math.max(0, prices.length - windowSize)).reduce((a, b) => a + b, 0) / windowSize;
  
  // Calculate standard deviation for confidence intervals
  const stdDev = Math.sqrt(
    prices.slice(Math.max(0, prices.length - 30)).reduce((sum, price) => sum + Math.pow(price - movingAverage, 2), 0) / 30
  );
  
  // Generate dates for the forecast
  const lastDate = new Date(data[data.length - 1][0]);
  const dates = Array.from({ length: daysToPredict }, (_, i) => {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  // Generate forecast using trend from recent data
  const recentTrend = (prices[prices.length - 1] - prices[prices.length - 8]) / 7;  
  
  // Create forecast with slight randomness around the trend
  const forecast = Array.from({ length: daysToPredict }, (_, i) => {
    return lastPrice + recentTrend * (i + 1) + (Math.random() - 0.5) * recentTrend * 0.5;
  });
  
  // Generate confidence intervals (upper and lower bounds)
  const confidenceMultiplier = 1.96; // ~95% confidence interval
  const upperBound = forecast.map(price => price + confidenceMultiplier * stdDev);
  const lowerBound = forecast.map(price => price - confidenceMultiplier * stdDev);
  
  return { forecast, upperBound, lowerBound, dates };
}

/**
 * Simplified Prophet-like model
 * This is a simplified implementation as a placeholder for Facebook Prophet
 */
function predictWithProphet(data: TimeSeriesData, daysToPredict: number): PredictionResult {
  // Extract prices
  const prices = data.map(point => point[1]);
  const lastPrice = prices[prices.length - 1];
  
  // Calculate trend over different periods
  const shortTermTrend = (prices[prices.length - 1] - prices[prices.length - 8]) / 7;
  const mediumTermTrend = (prices[prices.length - 1] - prices[prices.length - 15]) / 14;
  const longTermTrend = (prices[prices.length - 1] - prices[prices.length - 31]) / 30;
  
  // Weight the trends (giving more weight to more recent data)
  const weightedTrend = (shortTermTrend * 3 + mediumTermTrend * 2 + longTermTrend) / 6;
  
  // Generate dates for the forecast
  const lastDate = new Date(data[data.length - 1][0]);
  const dates = Array.from({ length: daysToPredict }, (_, i) => {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });
  
  // Add seasonality (day-of-week effect)
  const seasonality = [0.005, -0.003, 0.001, 0.002, -0.001, -0.002, -0.002]; 
  
  // Create forecast with trend and seasonality
  const forecast = Array.from({ length: daysToPredict }, (_, i) => {
    const dayOfWeek = (lastDate.getDay() + i + 1) % 7;
    const seasonalFactor = seasonality[dayOfWeek] * lastPrice;
    return lastPrice + weightedTrend * (i + 1) + seasonalFactor;
  });
  
  // Calculate uncertainty based on price volatility
  const volatility = Math.sqrt(
    prices.slice(Math.max(0, prices.length - 30))
      .map((p, i, arr) => i > 0 ? Math.pow((p / arr[i - 1]) - 1, 2) : 0)
      .reduce((sum, val) => sum + val, 0) / 29
  ) * lastPrice;
  
  // Generate upper and lower bounds with increasing uncertainty over time
  const upperBound = forecast.map((price, i) => price + volatility * Math.sqrt(i + 1));
  const lowerBound = forecast.map((price, i) => price - volatility * Math.sqrt(i + 1));
  
  return { forecast, upperBound, lowerBound, dates };
}

/**
 * Simplified LSTM-like model
 * This is a simplified implementation as a placeholder for LSTM neural networks
 */
function predictWithLSTM(data: TimeSeriesData, daysToPredict: number): PredictionResult {
  // Extract prices
  const prices = data.map(point => point[1]);
  const lastPrice = prices[prices.length - 1];
  
  // Calculate multiple trends over different timeframes
  const trends = [7, 14, 30, 60].map(days => {
    if (prices.length > days) {
      return (prices[prices.length - 1] - prices[prices.length - 1 - days]) / days;
    }
    return 0;
  });
  
  // Calculate weighted average of trends (more weight to recent trends)
  const weightedTrend = (trends[0] * 4 + trends[1] * 2 + trends[2] * 1.5 + trends[3]) / 8.5;
  
  // Generate dates for the forecast
  const lastDate = new Date(data[data.length - 1][0]);
  const dates = Array.from({ length: daysToPredict }, (_, i) => {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });
  
  // Calculate historical volatility
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * lastPrice;
  
  // Create non-linear forecast that accounts for momentum
  const forecast = Array.from({ length: daysToPredict }, (_, i) => {
    // Add dampening effect for longer-term predictions
    const dampingFactor = Math.exp(-0.05 * i);
    // Non-linear growth based on recent momentum
    return lastPrice * Math.exp((weightedTrend / lastPrice) * (i + 1) * dampingFactor);
  });
  
  // Generate confidence intervals with asymmetric bounds (more realistic for price movements)
  // Upper bound can go higher (potential for large price increases)
  const upperBound = forecast.map((price, i) => price * Math.exp(volatility * Math.sqrt(i + 1) * 0.05));
  // Lower bound is limited (prices rarely go below zero)
  const lowerBound = forecast.map((price, i) => price * Math.exp(-volatility * Math.sqrt(i + 1) * 0.05));
  
  return { forecast, upperBound, lowerBound, dates };
}

/**
 * Main prediction function that calls the appropriate model
 */
export function predictCoinPrice(
  historicalData: TimeSeriesData, 
  model: ModelType = 'arima', 
  daysToPredict: number = 7
): PredictionResult | null {
  if (!historicalData || historicalData.length < 30) {
    console.error('Not enough historical data for prediction');
    return null;
  }
  
  try {
    switch (model) {
      case 'arima':
        return predictWithARIMA(historicalData, daysToPredict);
      case 'prophet':
        return predictWithProphet(historicalData, daysToPredict);
      case 'lstm':
        return predictWithLSTM(historicalData, daysToPredict);
      default:
        return predictWithARIMA(historicalData, daysToPredict);
    }
  } catch (error) {
    console.error('Error in prediction:', error);
    return null;
  }
}
