import { Group } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useBetStore } from '../../state/betStore';
import { useGridStore } from '../../state/gridStore';
import { usePriceStore } from '../../state/priceStore';
import { snapToGrid } from '../../utils/coords';
import { calculateOdds } from '../../utils/odds';

export const TouchLayer: React.FC = () => {
  const contentOffsetX = useGridStore((state) => state.contentOffsetX);
  const contentOffsetY = useGridStore((state) => state.contentOffsetY);
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);
  const setPendingBet = useBetStore((state) => state.setPendingBet);
  const getCurrentTimeIndex = usePriceStore((state) => state.getCurrentTimeIndex);
  const getCurrentPriceIndex = usePriceStore((state) => state.getCurrentPriceIndex);

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const { x, y } = event;
      
      // Snap to nearest grid cell
      const { timeIndex, priceIndex } = snapToGrid(
        x,
        y,
        cellWidth,
        cellHeight,
        contentOffsetX,
        contentOffsetY
      );

      // Don't allow bets on past cells
      const currentTimeIndex = getCurrentTimeIndex();
      if (timeIndex <= currentTimeIndex) {
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

      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Open bet modal
      setPendingBet({
        timeIndex,
        priceIndex,
        stake: 10,
        odds,
      });
    });

  return <Group />;
};