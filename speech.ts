import * as Speech from 'expo-speech';

export function speakText(text: string) {
  if (process.env.EXPO_OS === 'web') {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      window.speechSynthesis.speak(utterance);
    }
    return;
  }
  try {
    Speech.speak(text, { language: 'ar-SA', rate: 0.9 });
  } catch {
    // ignore
  }
}
