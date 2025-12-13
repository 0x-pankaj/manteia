import { Audio } from 'expo-av';

let winSound: Audio.Sound | null = null;

export const initSound = async () => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.log('Error initializing audio:', error);
  }
};

export const playWinSound = async () => {
  try {
    // Create a simple beep sound programmatically
    // Or you can use a sound file: require('../assets/sounds/win.mp3')
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' },
      { shouldPlay: true, volume: 0.5 }
    );
    
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('Error playing sound:', error);
  }
};

export const cleanupSound = async () => {
  if (winSound) {
    await winSound.unloadAsync();
    winSound = null;
  }
};