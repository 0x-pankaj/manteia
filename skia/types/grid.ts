export interface GridConfig {
  cellWidth: number;
  cellHeight: number;
  priceStep: number;
  timeStep: number;
}

export interface ViewportBounds {
  minTimeIndex: number;
  maxTimeIndex: number;
  minPriceIndex: number;
  maxPriceIndex: number;
}