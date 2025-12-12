import { BetPlacement } from '../types/bet';

/**
 * Mock API for bet placement and settlement
 */

export interface PlaceBetResponse {
  success: boolean;
  betId?: string;
  error?: string;
}

export interface SettleBetResponse {
  success: boolean;
  won: boolean;
  payout: number;
}

/**
 * Place a bet on the server
 */
export async function placeBet(placement: BetPlacement): Promise<PlaceBetResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Generate unique bet ID
  const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    betId,
  };
}

/**
 * Settle a bet on the server
 */
export async function settleBet(betId: string, won: boolean, stake: number, odds: number): Promise<SettleBetResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));

  const payout = won ? stake * odds : 0;

  return {
    success: true,
    won,
    payout,
  };
}