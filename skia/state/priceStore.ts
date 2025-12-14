
// import { create } from 'zustand';
// import { PricePoint } from '../types/price';

// interface PriceStore {
//   points: PricePoint[];
//   currentPrice: number;
//   startTime: number;
//   basePrice: number;
//   lastProcessedTime: number; // Add throttling
  
//   addPoint: (point: PricePoint) => void;
//   getCurrentTimeIndex: () => number;
//   getCurrentPriceIndex: () => number;
//   reset: () => void;
// }

// const MAX_POINTS = 600;
// const MIN_TIME_BETWEEN_POINTS = 500; // Minimum 500ms between points (adjustable)

// export const usePriceStore = create<PriceStore>((set, get) => ({
//   points: [],
//   currentPrice: 3820,
//   startTime: Date.now(),
//   basePrice: 3820,
//   lastProcessedTime: 0,

//   addPoint: (point) => {
//     const state = get();
    
//     // Throttle updates - only process if enough time has passed
//     // Remove this check if you want all updates
//     if (point.timestamp - state.lastProcessedTime < MIN_TIME_BETWEEN_POINTS) {
//       // Still update current price for display
//       set({ currentPrice: point.price });
//       return;
//     }
    
//     set((state) => {
//       const newPoints = [...state.points, point];
      
//       if (newPoints.length > MAX_POINTS) {
//         newPoints.shift();
//       }

//       return {
//         points: newPoints,
//         currentPrice: point.price,
//         lastProcessedTime: point.timestamp,
//       };
//     });
//   },

//   getCurrentTimeIndex: () => {
//     const state = get();
//     if (state.points.length === 0) return 0;
//     const lastPoint = state.points[state.points.length - 1];
//     const timeIndex = Math.floor((lastPoint.timestamp - state.startTime) / 5000);
//     return timeIndex;
//   },

//   getCurrentPriceIndex: () => {
//     const state = get();
//     return Math.floor((state.basePrice - state.currentPrice) / 5);
//   },

//   reset: () => set({
//     points: [],
//     currentPrice: 3820,
//     startTime: Date.now(),
//     basePrice: 3820,
//     lastProcessedTime: 0,
//   }),
// }));



import { create } from 'zustand';
import { PricePoint } from '../types/price';

interface PriceStore {
  points: PricePoint[];
  currentPrice: number;
  startTime: number;
  basePrice: number;
  
  addPoint: (point: PricePoint) => void;
  getCurrentTimeIndex: () => number;
  getCurrentPriceIndex: () => number;
  reset: () => void;
}

const MAX_POINTS = 600; // Keep last 10 minutes of data

export const usePriceStore = create<PriceStore>((set, get) => ({
  points: [],
  currentPrice: 90000,
  startTime: Date.now(),
  basePrice: 90000,

  addPoint: (point) => set((state) => {
    const newPoints = [...state.points, point];
    
    // Keep only recent points
    if (newPoints.length > MAX_POINTS) {
      newPoints.shift();
    }

    console.log('✅ Point added:', {
      price: point.price.toFixed(2),
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      totalPoints: newPoints.length,
    });

    return {
      points: newPoints,
      currentPrice: point.price,
    };
  }),

  getCurrentTimeIndex: () => {
    const state = get();
    if (state.points.length === 0) return 0;
    const lastPoint = state.points[state.points.length - 1];
    const timeIndex = Math.floor((lastPoint.timestamp - state.startTime) / 5000); // 5 second cells
    return timeIndex;
  },

  getCurrentPriceIndex: () => {
    const state = get();
    return Math.floor((state.basePrice - state.currentPrice) / 5); // 5 unit cells
  },

  reset: () => set({
    points: [],
    currentPrice: 3820,
    startTime: Date.now(),
    basePrice: 3820,
  }),
}));
