export const PRICE_STEP = 5; // 5 price units per cell
export const TIME_STEP = 5; // 5 seconds per cell (in seconds, not milliseconds)

/**
 * Convert time (milliseconds timestamp) to screen X coordinate
 */
export function timeToX(
  time: number,
  startTime: number,
  cellWidth: number,
  offsetX: number
): number {
  const timeIndex = (time - startTime) / (TIME_STEP * 1000);
  return timeIndex * cellWidth + offsetX;
}

/**
 * Convert price to screen Y coordinate
 */
export function priceToY(
  price: number,
  basePrice: number,
  cellHeight: number,
  offsetY: number
): number {
  const priceIndex = (basePrice - price) / PRICE_STEP;
  return priceIndex * cellHeight + offsetY;
}

/**
 * Convert screen X to time index
 */
export function xToTimeIndex(
  x: number,
  cellWidth: number,
  offsetX: number
): number {
  return Math.floor((x - offsetX) / cellWidth);
}

/**
 * Convert screen Y to price index
 */
export function yToPriceIndex(
  y: number,
  cellHeight: number,
  offsetY: number
): number {
  return Math.floor((y - offsetY) / cellHeight);
}

/**
 * Get cell center coordinates
 */
export function getCellCenter(
  timeIndex: number,
  priceIndex: number,
  cellWidth: number,
  cellHeight: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  return {
    x: timeIndex * cellWidth + cellWidth / 2 + offsetX,
    y: priceIndex * cellHeight + cellHeight / 2 + offsetY,
  };
}

/**
 * Snap touch point to nearest grid cell
 */
export function snapToGrid(
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
  offsetX: number,
  offsetY: number
): { timeIndex: number; priceIndex: number } {
  const timeIndex = Math.floor((x - offsetX) / cellWidth);
  const priceIndex = Math.floor((y - offsetY) / cellHeight);
  return { timeIndex, priceIndex };
}

/**
 * Convert time index to timestamp (milliseconds)
 */
export function timeIndexToTimestamp(timeIndex: number, startTime: number): number {
  return startTime + timeIndex * TIME_STEP * 1000;
}

/**
 * Convert price index to actual price
 */
export function priceIndexToPrice(priceIndex: number, basePrice: number): number {
  return basePrice - priceIndex * PRICE_STEP;
}