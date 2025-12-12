import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { placeBet } from '../server/mockAPI';
import { useBetStore } from '../state/betStore';
import { usePriceStore } from '../state/priceStore';
import { useWalletStore } from '../state/walletStore';
import { priceIndexToPrice, timeIndexToTimestamp } from '../utils/coords';
import { formatOdds } from '../utils/odds';

export const BetModal: React.FC = () => {
  const pendingBet = useBetStore((state) => state.pendingBet);
  const setPendingBet = useBetStore((state) => state.setPendingBet);
  const placeBetAction = useBetStore((state) => state.placeBet);
  const deductStake = useWalletStore((state) => state.deductStake);
  const balance = useWalletStore((state) => state.balance);
  const basePrice = usePriceStore((state) => state.basePrice);
  const startTime = usePriceStore((state) => state.startTime);

  const [customStake, setCustomStake] = useState('10');

  const stakes = [1, 5, 10, 25, 50];

  if (!pendingBet) return null;

  const targetPrice = priceIndexToPrice(pendingBet.priceIndex, basePrice);
  const targetTime = timeIndexToTimestamp(pendingBet.timeIndex, startTime);
  const timeFromNow = Math.floor((targetTime - Date.now()) / 1000);

  const handleConfirm = async (stake: number) => {
    if (stake > balance) {
      alert('Insufficient balance');
      return;
    }

    try {
      // Call mock API
      const response = await placeBet({
        ...pendingBet,
        stake,
      });

      if (response.success && response.betId) {
        // Deduct from wallet
        deductStake(stake, response.betId);

        // Place bet in store
        placeBetAction(response.betId, {
          ...pendingBet,
          stake,
        });
      }
    } catch (error) {
      console.error('Failed to place bet:', error);
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={() => setPendingBet(null)}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setPendingBet(null)}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>Place Bet</Text>

          <View style={styles.info}>
            <Text style={styles.infoLabel}>Target Price:</Text>
            <Text style={styles.infoValue}>${targetPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>{timeFromNow}s from now</Text>
          </View>

          <View style={styles.info}>
<Text style={styles.infoLabel}>Odds:</Text>
<Text style={styles.oddsValue}>{formatOdds(pendingBet.odds)}</Text>
</View>

      <Text style={styles.stakeLabel}>Select Stake:</Text>

      <View style={styles.stakeButtons}>
        {stakes.map((stake) => (
          <TouchableOpacity
            key={stake}
            style={styles.stakeButton}
            onPress={() => handleConfirm(stake)}
          >
            <Text style={styles.stakeText}>${stake}</Text>
            <Text style={styles.payoutText}>
              Win ${(stake * pendingBet.odds).toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setPendingBet(null)}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>
);
};
const styles = StyleSheet.create({
overlay: {
flex: 1,
backgroundColor: 'rgba(0, 0, 0, 0.8)',
justifyContent: 'center',
alignItems: 'center',
},
modal: {
backgroundColor: '#1a1a2e',
borderRadius: 20,
padding: 24,
width: '85%',
borderWidth: 2,
borderColor: '#00ff88',
},
title: {
fontSize: 24,
fontWeight: 'bold',
color: '#00ff88',
textAlign: 'center',
marginBottom: 20,
},
info: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 12,
},
infoLabel: {
color: '#999',
fontSize: 16,
},
infoValue: {
color: '#fff',
fontSize: 16,
fontWeight: '600',
},
oddsValue: {
color: '#00ff88',
fontSize: 18,
fontWeight: 'bold',
},
stakeLabel: {
color: '#fff',
fontSize: 16,
marginTop: 20,
marginBottom: 12,
},
stakeButtons: {
flexDirection: 'row',
flexWrap: 'wrap',
justifyContent: 'space-between',
},
stakeButton: {
backgroundColor: '#0d0d1f',
borderWidth: 2,
borderColor: '#00ff88',
borderRadius: 12,
padding: 16,
width: '48%',
marginBottom: 12,
},
stakeText: {
color: '#fff',
fontSize: 18,
fontWeight: 'bold',
textAlign: 'center',
},
payoutText: {
color: '#00ff88',
fontSize: 12,
textAlign: 'center',
marginTop: 4,
},
cancelButton: {
marginTop: 12,
padding: 16,
borderRadius: 12,
backgroundColor: '#333',
},
cancelText: {
color: '#fff',
fontSize: 16,
textAlign: 'center',
},
});