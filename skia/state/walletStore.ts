
import { create } from 'zustand';

interface Transaction {
  id: string;
  type: 'bet' | 'win' | 'loss';
  amount: number;
  timestamp: number;
  betId?: string;
}

interface WalletStore {
  balance: number;
  transactions: Transaction[];
  
  // Actions
  deductStake: (amount: number, betId: string) => void;
  addPayout: (amount: number, betId: string) => void;
  addTransaction: (transaction: Transaction) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  balance: 100.0, // Starting balance
  transactions: [],

  deductStake: (amount, betId) => set((state) => {
    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'bet',
      amount: -amount,
      timestamp: Date.now(),
      betId,
    };

    return {
      balance: state.balance - amount,
      transactions: [...state.transactions, transaction],
    };
  }),

  addPayout: (amount, betId) => set((state) => {
    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'win',
      amount: amount,
      timestamp: Date.now(),
      betId,
    };

    return {
      balance: state.balance + amount,
      transactions: [...state.transactions, transaction],
    };
  }),

  addTransaction: (transaction) => set((state) => ({
    transactions: [...state.transactions, transaction],
  })),
}));