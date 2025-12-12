import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚡ GRID RUSH</Text>
      <Text style={styles.subtitle}>Solana-Style Price Prediction</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/game')}
      >
        <Text style={styles.buttonText}>START GAME</Text>
      </TouchableOpacity>

      <View style={styles.features}>
        <Text style={styles.feature}>🎯 Real-time price grid</Text>
        <Text style={styles.feature}>⚡ Instant bet placement</Text>
        <Text style={styles.feature}>💰 Dynamic odds calculation</Text>
        <Text style={styles.feature}>🎮 Smooth Skia rendering</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 30,
    marginBottom: 60,
  },
  buttonText: {
    color: '#0d0d1f',
    fontSize: 20,
    fontWeight: 'bold',
  },
  features: {
    alignItems: 'flex-start',
  },
  feature: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
});