import { create } from 'zustand';
import { Bet, BetPlacement } from '../types/bet';
import { getBetMapKey } from '../utils/collision';

interface BetStore {
  bets: Bet[];
  betMap: Map<string, Bet>;
  pendingBet: BetPlacement | null;
  defaultBetAmount: number;
  showBetSettings: boolean;
  showHistory: boolean;
  
  // Actions
  setPendingBet: (bet: BetPlacement | null) => void;
  placeBet: (betId: string, placement: BetPlacement) => void;
  settleBet: (betId: string, won: boolean, payout?: number) => void;
  getBetAtCell: (timeIndex: number, priceIndex: number) => Bet | undefined;
  getActiveBets: () => Bet[];
  setDefaultBetAmount: (amount: number) => void;
  setShowBetSettings: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
}

export const useBetStore = create<BetStore>((set, get) => ({
  bets: [],
  betMap: new Map(),
  pendingBet: null,
  defaultBetAmount: 10,
  showBetSettings: false,
  showHistory: false,

  setPendingBet: (bet) => set({ pendingBet: bet }),

  placeBet: (betId, placement) => {
    set((state) => {
      const bet: Bet = {
        id: betId,
        timeIndex: placement.timeIndex,
        priceIndex: placement.priceIndex,
        stake: placement.stake,
        odds: placement.odds,
        timestamp: Date.now(),
        settled: false,
      };

      const key = getBetMapKey(placement.timeIndex, placement.priceIndex);
      const newBetMap = new Map(state.betMap);
      newBetMap.set(key, bet);

      console.log('✅ Bet placed:', {
        betId,
        timeIndex: placement.timeIndex,
        priceIndex: placement.priceIndex,
        stake: placement.stake,
        odds: placement.odds,
      });

      return {
        bets: [...state.bets, bet],
        betMap: newBetMap,
        pendingBet: null,
      };
    });
  },

  settleBet: (betId, won, payout) => {
    set((state) => {
      const bet = state.bets.find((b) => b.id === betId);
      if (!bet || bet.settled) return state;

      const updatedBets = state.bets.map((b) =>
        b.id === betId
          ? { ...b, settled: true, won, payout }
          : b
      );

      // Also update betMap to reflect settled status
      const key = getBetMapKey(bet.timeIndex, bet.priceIndex);
      const newBetMap = new Map(state.betMap);
      const betInMap = newBetMap.get(key);
      if (betInMap) {
        newBetMap.set(key, { ...betInMap, settled: true, won, payout });
      }

      console.log('🏁 Bet settled:', {
        betId,
        won,
        payout,
      });

      return { 
        bets: updatedBets,
        betMap: newBetMap,
      };
    });
  },

  getBetAtCell: (timeIndex, priceIndex) => {
    const key = getBetMapKey(timeIndex, priceIndex);
    return get().betMap.get(key);
  },

  getActiveBets: () => {
    return get().bets.filter((b) => !b.settled);
  },

  setDefaultBetAmount: (amount) => set({ defaultBetAmount: amount }),

  setShowBetSettings: (show) => set({ showBetSettings: show }),

  setShowHistory: (show) => set({ showHistory: show }),
}));