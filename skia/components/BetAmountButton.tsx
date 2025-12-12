import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useBetStore } from '../state/betStore';

export const BetAmountButton: React.FC = () => {
  const defaultBetAmount = useBetStore((state) => state.defaultBetAmount);
  const setShowBetSettings = useBetStore((state) => state.setShowBetSettings);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setShowBetSettings(true)}
    >
      <Text style={styles.icon}>💰</Text>
      <Text style={styles.amount}>${defaultBetAmount}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(241, 248, 187, 0.6)",
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  amount: {
    color: "rgba(241, 248, 187, 0.6)",
    fontSize: 16,
    fontWeight: 'bold',
  },
});