export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface PriceBuffer {
  points: PricePoint[];
  maxPoints: number;
}