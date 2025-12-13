import { Canvas, useCanvasRef } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useBetStore } from '../../state/betStore';
import { useGridStore } from '../../state/gridStore';
import { usePriceStore } from '../../state/priceStore';
import { useWalletStore } from '../../state/walletStore';
import { priceIndexToPrice, snapToGrid, timeIndexToTimestamp } from '../../utils/coords';
import { calculateOdds } from '../../utils/odds';
import { BetLayer } from './BetLayer';
import { GridLayer } from './GridLayer';
import { PriceLineLayer } from './PriceLineLayer';

const { width, height } = Dimensions.get('window');

const MIN_BET_TIME_AHEAD = 5; // seconds

export const CanvasView: React.FC = () => {
  const canvasRef = useCanvasRef();
  
  const setOffset = useGridStore((state) => state.setOffset);
  const contentOffsetX = useGridStore((state) => state.contentOffsetX);
  const contentOffsetY = useGridStore((state) => state.contentOffsetY);
  const followLive = useGridStore((state) => state.followLive);
  const setFollowLive = useGridStore((state) => state.setFollowLive);
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);
  const getCurrentTimeIndex = usePriceStore((state) => state.getCurrentTimeIndex);
  const getCurrentPriceIndex = usePriceStore((state) => state.getCurrentPriceIndex);
  const placeBet = useBetStore((state) => state.placeBet);
  const defaultBetAmount = useBetStore((state) => state.defaultBetAmount);
  const startTime = usePriceStore((state) => state.startTime);
  const basePrice = usePriceStore((state) => state.basePrice);
  const points = usePriceStore((state) => state.points);

  const offsetX = useSharedValue(contentOffsetX);
  const offsetY = useSharedValue(contentOffsetY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const lastUpdateTime = useRef(0);


//   useEffect(() => {
//   const now = Date.now();
  
//   if (followLive) {
//     const currentTimeIndex = getCurrentTimeIndex();
//     const currentPriceIndex = getCurrentPriceIndex();
    
//     const targetX = -currentTimeIndex * cellWidth + width / 2;
//     const targetY = -currentPriceIndex * cellHeight + height / 2;
    
//     offsetX.value = targetX;
//     offsetY.value = targetY;
//     runOnJS(setOffset)(targetX, targetY);
    
//     lastUpdateTime.current = now;
//   } else if (now - lastUpdateTime.current > 1000) {
//     // Force a small offset update every second to trigger re-render
//     // This ensures odds update even when not scrolling
//     runOnJS(setOffset)(contentOffsetX, contentOffsetY);
//     lastUpdateTime.current = now;
//   }
// }, [followLive, points.length]);


  // Auto-follow live price
  // useEffect(() => {
  //   if (followLive) {
  //     const currentTimeIndex = getCurrentTimeIndex();
  //     const targetX = -currentTimeIndex * cellWidth + width / 2;
  //     offsetX.value = targetX;
  //     runOnJS(setOffset)(targetX, offsetY.value);
  //   }
  // }, [followLive, points.length]);

  
useEffect(() => {
  if (followLive && points.length > 0) {
    const currentTimeIndex = getCurrentTimeIndex();
    const currentPriceIndex = getCurrentPriceIndex();
    
    // Center both X and Y
    const targetX = -currentTimeIndex * cellWidth + width / 2;
    const targetY = -currentPriceIndex * cellHeight + height / 2;
    
    offsetX.value = targetX;
    offsetY.value = targetY;
    runOnJS(setOffset)(targetX, targetY);
  }
}, [followLive, points.length]);

  // ... existing imports ...

const handleTap = (x: number, y: number) => {
  // Snap to nearest grid cell
  const { timeIndex, priceIndex } = snapToGrid(
    x,
    y,
    cellWidth,
    cellHeight,
    contentOffsetX,
    contentOffsetY
  );

  // Check if bet already exists on this cell
  const existingBet = useBetStore.getState().getBetAtCell(timeIndex, priceIndex);
  if (existingBet) {
    console.log(' Bet already placed on this cell');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    return;
  }

  const currentTimeIndex = getCurrentTimeIndex();
  const gridStartTime = timeIndexToTimestamp(timeIndex, startTime);
  const gridEndTime = gridStartTime + 5000;
  const targetPrice = priceIndexToPrice(priceIndex, basePrice);
  const currentTime = Date.now();
  const secondsAhead = (gridStartTime - currentTime) / 1000;
  
  console.log(' Grid Tap Info:', {
    timeIndex,
    priceIndex,
    currentTimeIndex,
    gridStartTime: new Date(gridStartTime).toLocaleTimeString(),
    gridEndTime: new Date(gridEndTime).toLocaleTimeString(),
    targetPrice,
    secondsAhead,
    currentTime: new Date(currentTime).toLocaleTimeString(),
  });

  // Check if bet is far enough in the future
  if (secondsAhead < MIN_BET_TIME_AHEAD) {
    console.log(` Bet too close to current time. Need ${MIN_BET_TIME_AHEAD}s ahead, got ${secondsAhead.toFixed(1)}s`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    return;
  }

  // Check balance
  const balance = useWalletStore.getState().balance;
  if (defaultBetAmount > balance) {
    console.log(' Insufficient balance');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }

  // Calculate odds
  const currentPriceIndex = getCurrentPriceIndex();
  const odds = calculateOdds(
    timeIndex,
    priceIndex,
    currentTimeIndex,
    currentPriceIndex
  );

  console.log('Odds calculated:', odds);

  // Trigger haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  // Place bet with default amount
  const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Deduct balance first
  useWalletStore.getState().deductStake(defaultBetAmount, betId);
  
  // Then place bet
  placeBet(betId, {
    timeIndex,
    priceIndex,
    stake: defaultBetAmount,
    odds,
  });
};

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      runOnJS(handleTap)(event.x, event.y);
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = offsetX.value;
      startY.value = offsetY.value;
      runOnJS(setFollowLive)(false);
    })
    .onUpdate((event) => {
      offsetX.value = startX.value + event.translationX;
      offsetY.value = startY.value + event.translationY;
      
      runOnJS(setOffset)(offsetX.value, offsetY.value);
    });

  const composed = Gesture.Race(panGesture, tapGesture);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.canvas, { justifyContent: 'center', alignItems: 'center' }]}> 
        <View style={{ padding: 24, backgroundColor: '#222', borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontSize: 18, textAlign: 'center' }}>
            Skia Canvas is not supported on web in this project.
          </Text>
          <Text style={{ color: '#ff8888', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            (Error: Expected arraybuffer as first parameter)
          </Text>
        </View>
      </View>
    );
  }

  return (
    <GestureDetector gesture={composed}>
      <Canvas ref={canvasRef} style={styles.canvas}>
        <GridLayer />
        <BetLayer />
        <PriceLineLayer />
      </Canvas>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: '#0d0d1f',
  },
});