import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useBetStore } from '../state/betStore';

export const UserHistoryButton: React.FC = () => {
  const setShowHistory = useBetStore((state) => state.setShowHistory);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setShowHistory(true)}
    >
      <Text style={styles.icon}>👤</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(241, 248, 187, 0.6)",
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  icon: {
    fontSize: 24,
  },
});