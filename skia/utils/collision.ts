import { Bet } from '../types/bet';
import { PricePoint } from '../types/price';
import { PRICE_STEP, TIME_STEP } from './coords';

/**
 * Convert price point to grid indices
 */
export function pricePointToIndices(
  point: PricePoint,
  startTime: number,
  basePrice: number
): { timeIndex: number; priceIndex: number } {
  const timeIndex = Math.floor((point.timestamp - startTime) / (TIME_STEP * 1000));
  const priceIndex = Math.floor((basePrice - point.price) / PRICE_STEP);
  return { timeIndex, priceIndex };
}

/**
 * Check if a price point collides with a bet
 */
export function checkCollision(
  point: PricePoint,
  bet: Bet,
  startTime: number,
  basePrice: number
): boolean {
  const { timeIndex, priceIndex } = pricePointToIndices(point, startTime, basePrice);
  return timeIndex === bet.timeIndex && priceIndex === bet.priceIndex;
}

/**
 * Check line segment for collisions with bets
 * More robust collision detection using interpolation
 */
export function checkLineSegmentCollisions(
  point1: PricePoint,
  point2: PricePoint,
  bets: Map<string, Bet>,
  startTime: number,
  basePrice: number
): Bet[] {
  const collisions: Bet[] = [];
  const checkedBets = new Set<string>();
  
  const { timeIndex: t1, priceIndex: p1 } = pricePointToIndices(point1, startTime, basePrice);
  const { timeIndex: t2, priceIndex: p2 } = pricePointToIndices(point2, startTime, basePrice);
  
  console.log('🔍 Checking collision:', {
    point1: { t: t1, p: p1, price: point1.price.toFixed(2), time: new Date(point1.timestamp).toLocaleTimeString() },
    point2: { t: t2, p: p2, price: point2.price.toFixed(2), time: new Date(point2.timestamp).toLocaleTimeString() },
  });
  
  // Check both endpoints
  const key1 = getBetMapKey(t1, p1);
  const key2 = getBetMapKey(t2, p2);
  
  const bet1 = bets.get(key1);
  if (bet1 && !bet1.settled && !checkedBets.has(bet1.id)) {
    console.log('💥 Collision at endpoint 1!', key1);
    collisions.push(bet1);
    checkedBets.add(bet1.id);
  }
  
  const bet2 = bets.get(key2);
  if (bet2 && !bet2.settled && !checkedBets.has(bet2.id)) {
    console.log('💥 Collision at endpoint 2!', key2);
    collisions.push(bet2);
    checkedBets.add(bet2.id);
  }
  
  // Interpolate between points with higher precision
  const steps = Math.max(Math.abs(t2 - t1), Math.abs(p2 - p1)) * 3;
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const t = Math.floor(t1 + (t2 - t1) * ratio);
    const p = Math.floor(p1 + (p2 - p1) * ratio);
    
    const key = getBetMapKey(t, p);
    const bet = bets.get(key);
    
    if (bet && !bet.settled && !checkedBets.has(bet.id)) {
      console.log(' Collision at interpolated point!', key);
      collisions.push(bet);
      checkedBets.add(bet.id);
    }
  }
  
  return collisions;
}

/**
 * Create a map key for bet lookup
 */
export function getBetMapKey(timeIndex: number, priceIndex: number): string {
  return `${timeIndex},${priceIndex}`;
}