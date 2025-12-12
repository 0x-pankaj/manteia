import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useWalletStore } from '../state/walletStore';

export const WalletDisplay: React.FC = () => {
  const balance = useWalletStore((state) => state.balance);

  return (
    <View style={styles.container}>
      <View style={styles.balanceBox}>
        <Text style={styles.icon}>💎</Text>
        <Text style={styles.balance}>${balance.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  balanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(241, 248, 187, 0.6)",
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  balance: {
    color: "rgba(241, 248, 187, 0.6)",
    fontSize: 20,
    fontWeight: 'bold',
  },
});