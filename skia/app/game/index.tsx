import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { BetAmountButton } from '../../components/BetAmountButton';
import { BetSettingsModal } from '../../components/BetSettingsModal';
import { FollowButton } from '../../components/FollowButton';
import { UserHistoryButton } from '../../components/UserHistoryButton';
import { UserHistoryModal } from '../../components/UserHistoryModal';
import { WalletDisplay } from '../../components/WalletDisplay';
import { settleBet } from '../../server/mockAPI';
import { startPriceFeed, stopPriceFeed } from '../../server/mockFeed';
import { useBetStore } from '../../state/betStore';
import { usePriceStore } from '../../state/priceStore';
import { useWalletStore } from '../../state/walletStore';
import { checkLineSegmentCollisions } from '../../utils/collision';
import { CanvasView } from './CanvasView';
import { initSound, playWinSound } from '@/utils/sound';

export default function GameScreen() {
  const addPoint = usePriceStore((state) => state.addPoint);
  const points = usePriceStore((state) => state.points);
  const startTime = usePriceStore((state) => state.startTime);
  const basePrice = usePriceStore((state) => state.basePrice);
  const betMap = useBetStore((state) => state.betMap);
  const bets = useBetStore((state) => state.bets);
  const settleBetAction = useBetStore((state) => state.settleBet);
  const addPayout = useWalletStore((state) => state.addPayout);

  useEffect(() => {

    initSound();
  },[]);

  useEffect(() => {
    // Start price feed
    const client = startPriceFeed();

    client.on('price', (pricePoint) => {
      addPoint(pricePoint);
    });

    return () => {
      stopPriceFeed();
    };
  }, []);

  // Collision detection
  useEffect(() => {
    if (points.length < 2) return;

    const lastPoint = points[points.length - 1];
    const prevPoint = points[points.length - 2];

    // Check for collisions
    const collisions = checkLineSegmentCollisions(
      prevPoint,
      lastPoint,
      betMap,
      startTime,
      basePrice
    );

    // Settle each collision
    collisions.forEach(async (bet) => {
      console.log('Collision detected!', {
        betId: bet.id,
        timeIndex: bet.timeIndex,
        priceIndex: bet.priceIndex,
        gridStartTime: startTime + bet.timeIndex * 5000,
        gridEndTime: startTime + (bet.timeIndex + 1) * 5000,
        currentPrice: lastPoint.price,
        stake: bet.stake,
        odds: bet.odds,
      });

      const response = await settleBet(bet.id, true, bet.stake, bet.odds);
      
      if (response.success) {
        settleBetAction(bet.id, response.won, response.payout);
        if (response.won) {
          addPayout(response.payout, bet.id);
          playWinSound();
          console.log('Win!', { payout: response.payout });
        }
      }
    });
  }, [points]);


    // Auto-settle expired bets (bets that weren't hit)
  useEffect(() => {
    if (points.length === 0) return;

    const currentTime = Date.now();
    const activeBets = bets.filter((b) => !b.settled);

    activeBets.forEach(async (bet) => {
      const betEndTime = timeIndexToTimestamp(bet.timeIndex + 1, startTime);
      
      // If current time has passed the bet's time window, it's a loss
      if (currentTime > betEndTime) {
        console.log(' Bet expired (missed):', {
          betId: bet.id,
          betEndTime: new Date(betEndTime).toLocaleTimeString(),
          currentTime: new Date(currentTime).toLocaleTimeString(),
        });

        const response = await settleBet(bet.id, false, bet.stake, bet.odds);
        
        if (response.success) {
          settleBetAction(bet.id, false, 0);
        }
      }
    });
  }, [points]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <CanvasView />
      <WalletDisplay />
      <BetAmountButton />
      <UserHistoryButton />
      <FollowButton />
      <BetSettingsModal />
      <UserHistoryModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1f',
  },
});
function timeIndexToTimestamp(timeIndex: number, startTime: number) {
  // Each time index represents a 5 second interval (5000 ms)
  return startTime + timeIndex * 5000;
}
