import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useGridStore } from '../state/gridStore';
import { usePriceStore } from '../state/priceStore';

const { width, height } = Dimensions.get('window');

export const FollowButton: React.FC = () => {
  const followLive = useGridStore((state) => state.followLive);
  const setFollowLive = useGridStore((state) => state.setFollowLive);
  const setOffset = useGridStore((state) => state.setOffset);
  const cellWidth = useGridStore((state) => state.cellWidth);
  const cellHeight = useGridStore((state) => state.cellHeight);
  const getCurrentTimeIndex = usePriceStore((state) => state.getCurrentTimeIndex);
  const getCurrentPriceIndex = usePriceStore((state) => state.getCurrentPriceIndex);

const handlePress = () => {
    if (!followLive) {
      // Center to current price - both X and Y
      const currentTimeIndex = getCurrentTimeIndex();
      const currentPriceIndex = getCurrentPriceIndex();
      
      // Center horizontally (X axis - time)
      const targetX = -currentTimeIndex * cellWidth + width / 2;
      
      // Center vertically (Y axis - price)
      const targetY = -currentPriceIndex * cellHeight + height / 2;
      
      setOffset(targetX, targetY);
      setFollowLive(true);
    } else {
      setFollowLive(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, followLive && styles.buttonActive]}
      onPress={handlePress}
    >
      <Text style={styles.text}>
        {followLive ? '📍 Following' : '🎯 Center Live'}
      </Text>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#666',
    zIndex: 10,
  },
  buttonActive: {
    borderColor: '#00ff88',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});