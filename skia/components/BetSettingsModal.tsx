import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useBetStore } from '../state/betStore';

export const BetSettingsModal: React.FC = () => {
  const showBetSettings = useBetStore((state) => state.showBetSettings);
  const setShowBetSettings = useBetStore((state) => state.setShowBetSettings);
  const defaultBetAmount = useBetStore((state) => state.defaultBetAmount);
  const setDefaultBetAmount = useBetStore((state) => state.setDefaultBetAmount);
  
  const [inputValue, setInputValue] = useState(defaultBetAmount.toString());

  const quickAmounts = [1,5, 10, 25, 50, 100];

  const handleSave = () => {
    const amount = parseFloat(inputValue);
    if (!isNaN(amount) && amount > 0) {
      setDefaultBetAmount(amount);
      setShowBetSettings(false);
    }
  };

  if (!showBetSettings) return null;

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={() => setShowBetSettings(false)}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setShowBetSettings(false)}
      >
        <View style={styles.modal} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Bet Settings</Text>
          
          <Text style={styles.label}>Default Bet Amount</Text>
          
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="numeric"
            placeholder="Enter amount"
            placeholderTextColor="#666"
          />

          <Text style={styles.quickLabel}>Quick Select:</Text>
          
          <View style={styles.quickButtons}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickButton,
                  parseFloat(inputValue) === amount && styles.quickButtonActive
                ]}
                onPress={() => setInputValue(amount.toString())}
              >
                <Text style={styles.quickButtonText}>${amount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowBetSettings(false)}
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
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0d0d1f',
    borderWidth: 2,
    borderColor: '#00ff88',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  quickLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 12,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickButton: {
    backgroundColor: '#0d0d1f',
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 12,
    padding: 12,
    width: '30%',
    marginBottom: 8,
  },
  quickButtonActive: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#00ff88',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saveText: {
    color: '#0d0d1f',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
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