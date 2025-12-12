export interface Bet {
  id: string;
  timeIndex: number;
  priceIndex: number;
  stake: number;
  odds: number;
  timestamp: number;
  settled: boolean;
  won?: boolean;
  payout?: number;
}

export interface BetPlacement {
  timeIndex: number;
  priceIndex: number;
  stake: number;
  odds: number;
}