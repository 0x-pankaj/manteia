//state/gridStore.ts
import { Dimensions } from 'react-native';
import { create } from 'zustand';

const { width, height } = Dimensions.get('window');

interface GridStore {
  // Viewport
  contentOffsetX: number;
  contentOffsetY: number;
  canvasWidth: number;
  canvasHeight: number;
  
  // Grid sizing
  cellWidth: number;
  cellHeight: number;
  
  // Auto-follow mode
  followLive: boolean;
  
  // Actions
  setOffset: (x: number, y: number) => void;
  setCanvasSize: (width: number, height: number) => void;
  setCellSize: (width: number, height: number) => void;
  setFollowLive: (follow: boolean) => void;
  centerToLive: (currentTimeIndex: number, currentPriceIndex: number) => void;
}

// Calculate initial cell width (8-10 cells should fit on screen)
// const INITIAL_CELL_WIDTH = width / 9;
const INITIAL_CELL_WIDTH = 60;
// const INITIAL_CELL_HEIGHT = height / 10; //60 pixels for UI space
const INITIAL_CELL_HEIGHT = 60;

export const useGridStore = create<GridStore>((set, get) => ({
  contentOffsetX: 0,
  contentOffsetY: 0,
  canvasWidth: width,
  canvasHeight: height - 200, // Leave space for UI
  cellWidth: INITIAL_CELL_WIDTH,
  cellHeight: INITIAL_CELL_HEIGHT,
  followLive: true,

  setOffset: (x, y) => set({ contentOffsetX: x, contentOffsetY: y }),

  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),

  setCellSize: (width, height) => set({ cellWidth: width, cellHeight: height }),

  setFollowLive: (follow) => set({ followLive: follow }),

  centerToLive: (currentTimeIndex, currentPriceIndex) => {
    const { cellWidth, cellHeight, canvasWidth, canvasHeight } = get();
    // Center the current time and price in the middle of the screen
    const targetX = -currentTimeIndex * cellWidth + canvasWidth / 2 - cellWidth / 2;
    const targetY = -currentPriceIndex * cellHeight + canvasHeight / 2 - cellHeight / 2;
    set({ contentOffsetX: targetX, contentOffsetY: targetY, followLive: true });
  },
}));



/*


import { Dimensions } from 'react-native';
import { create } from 'zustand';

const { width, height } = Dimensions.get('window');

interface GridStore {
  // Viewport
  contentOffsetX: number;
  contentOffsetY: number;
  canvasWidth: number;
  canvasHeight: number;
  
  // Grid sizing
  cellWidth: number;
  cellHeight: number;
  
  // Auto-follow mode
  followLive: boolean;
  
  // Actions
  setOffset: (x: number, y: number) => void;
  setCanvasSize: (width: number, height: number) => void;
  setCellSize: (width: number, height: number) => void;
  setFollowLive: (follow: boolean) => void;
  centerToLive: (currentTimeIndex: number, currentPriceIndex: number) => void;
}

const INITIAL_CELL_WIDTH = 60;
const INITIAL_CELL_HEIGHT = 60;

export const useGridStore = create<GridStore>((set, get) => ({
  contentOffsetX: width / 2, // Start centered in X
  contentOffsetY: height / 2, // Start centered in Y
  canvasWidth: width,
  canvasHeight: height - 200,
  cellWidth: INITIAL_CELL_WIDTH,
  cellHeight: INITIAL_CELL_HEIGHT,
  followLive: true,

  setOffset: (x, y) => set({ contentOffsetX: x, contentOffsetY: y }),

  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),

  setCellSize: (width, height) => set({ cellWidth: width, cellHeight: height }),

  setFollowLive: (follow) => set({ followLive: follow }),

  centerToLive: (currentTimeIndex, currentPriceIndex) => {
    const { cellWidth, cellHeight, canvasWidth, canvasHeight } = get();
    // Center both X and Y
    const targetX = -currentTimeIndex * cellWidth + canvasWidth / 2 - cellWidth / 2;
    const targetY = -currentPriceIndex * cellHeight + canvasHeight / 2 - cellHeight / 2;
    set({ contentOffsetX: targetX, contentOffsetY: targetY, followLive: true });
  },
}));


*/
