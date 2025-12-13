const BASE_MULTIPLIER = 0.5; // Base odds multiplier
const TIME_WEIGHT = 0.1; // Weight for time distance
const PRICE_WEIGHT = 0.025; // Weight for price distance
const HOUSE_EDGE = 0.008; // 8% house edge

/**
 * Calculate realistic odds based on time and price distance
 * Uses a more balanced formula for betting odds
 */
export function calculateOdds(
  targetTimeIndex: number,
  targetPriceIndex: number,
  currentTimeIndex: number,
  currentPriceIndex: number
): number {
  // Calculate time distance (how far in the future)
  const timeDistance = targetTimeIndex - currentTimeIndex;
  
  // Calculate price distance (how far from current price)
  const priceDistance = Math.abs(targetPriceIndex - currentPriceIndex);
  
  // Prevent division by zero or negative time
  if (timeDistance <= 0) return 1.1;
  
  // Calculate difficulty score
  // More time = easier to predict (lower odds)
  // More price distance = harder to hit (higher odds)
  const timeFactor = 1 / Math.sqrt(timeDistance);
  const priceFactor = Math.sqrt(priceDistance + 1);
  
  // Combined difficulty
  const difficulty = TIME_WEIGHT * timeFactor + PRICE_WEIGHT * priceFactor;
  
  // Calculate raw odds
  const rawOdds = BASE_MULTIPLIER + (difficulty * 10);
  
  // Apply house edge
  const odds = rawOdds * (1 - HOUSE_EDGE);
  
  // Clamp odds between 1.1x and 20x for realistic betting
  return Math.max(1.1, Math.min(20, odds));
}

/**
 * Format odds for display (e.g., "2.5x")
 */
export function formatOdds(odds: number): string {
  return `${odds.toFixed(2)}x`;
}

/**
 * Calculate potential payout
 */
export function calculatePayout(stake: number, odds: number): number {
  return stake * odds;
}