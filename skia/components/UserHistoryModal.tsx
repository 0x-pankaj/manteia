import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useBetStore } from '../state/betStore';
import { usePriceStore } from '../state/priceStore';
import { priceIndexToPrice, timeIndexToTimestamp } from '../utils/coords';

export const UserHistoryModal: React.FC = () => {
  const showHistory = useBetStore((state) => state.showHistory);
  const setShowHistory = useBetStore((state) => state.setShowHistory);
  const bets = useBetStore((state) => state.bets);
  const basePrice = usePriceStore((state) => state.basePrice);
  const startTime = usePriceStore((state) => state.startTime);

  if (!showHistory) return null;

  const settledBets = bets.filter((b) => b.settled);
  const wins = settledBets.filter((b) => b.won).length;
  const losses = settledBets.filter((b) => !b.won).length;
  const totalWon = settledBets
    .filter((b) => b.won)
    .reduce((sum, b) => sum + (b.payout || 0), 0);
  const totalLost = settledBets
    .filter((b) => !b.won)
    .reduce((sum, b) => sum + b.stake, 0);

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={() => setShowHistory(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Bet History</Text>

          <View style={styles.stats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Wins</Text>
              <Text style={styles.statValue}>{wins}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Losses</Text>
              <Text style={styles.statValue}>{losses}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Win Rate</Text>
              <Text style={styles.statValue}>
                {settledBets.length > 0
                  ? `${((wins / settledBets.length) * 100).toFixed(1)}%`
                  : '0%'}
              </Text>
            </View>
          </View>

          <View style={styles.profitBox}>
            <Text style={styles.profitLabel}>Net Profit/Loss</Text>
            <Text
              style={[
                styles.profitValue,
                totalWon - totalLost >= 0 ? styles.profit : styles.loss,
              ]}
            >
              ${(totalWon - totalLost).toFixed(2)}
            </Text>
          </View>

          <ScrollView style={styles.historyList}>
            {bets
              .slice()
              .reverse()
              .map((bet) => {
                const targetPrice = priceIndexToPrice(bet.priceIndex, basePrice);
                const targetTime = timeIndexToTimestamp(bet.timeIndex, startTime);

                return (
                  <View
                    key={bet.id}
                    style={[
                      styles.betItem,
                      bet.settled && bet.won && styles.betItemWin,
                      bet.settled && !bet.won && styles.betItemLoss,
                    ]}
                  >
                    <View style={styles.betHeader}>
                      <Text style={styles.betPrice}>${targetPrice.toFixed(2)}</Text>
                      <Text style={styles.betTime}>
                        {new Date(targetTime).toLocaleTimeString()}
                      </Text>
                    </View>
                    <View style={styles.betDetails}>
                      <Text style={styles.betStake}>Stake: ${bet.stake}</Text>
                      <Text style={styles.betOdds}>{bet.odds.toFixed(2)}x</Text>
                    </View>
                    {bet.settled && (
                      <View style={styles.betResult}>
                        <Text
                          style={[
                            styles.betResultText,
                            bet.won ? styles.winText : styles.lossText,
                          ]}
                        >
                          {bet.won
                            ? `WON $${bet.payout?.toFixed(2)}`
                            : `LOST $${bet.stake.toFixed(2)}`}
                        </Text>
                      </View>
                    )}
                    {!bet.settled && (
                      <Text style={styles.pendingText}>Pending...</Text>
                    )}
                  </View>
                );
              })}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowHistory(false)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    height: '80%',
    borderTopWidth: 3,
    borderColor: '#00ff88',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profitBox: {
    backgroundColor: '#0d0d1f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  profitLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profit: {
    color: '#00ff88',
  },
  loss: {
    color: '#ff4444',
  },
  historyList: {
    flex: 1,
  },
  betItem: {
    backgroundColor: '#0d0d1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  betItemWin: {
    borderColor: '#00ff88',
  },
  betItemLoss: {
    borderColor: '#ff4444',
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  betPrice: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  betTime: {
    color: '#999',
    fontSize: 14,
  },
  betDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  betStake: {
    color: '#fff',
    fontSize: 14,
  },
  betOdds: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
  },
  betResult: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  betResultText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  winText: {
    color: '#00ff88',
  },
  lossText: {
    color: '#ff4444',
  },
  pendingText: {
    color: '#ffaa00',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: '#00ff88',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  closeText: {
    color: '#0d0d1f',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});