import { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import SafeToSpendCard from '../components/SafeToSpendCard';
import VoiceListeningOverlay from '../components/VoiceListeningOverlay';

export default function AddExpenseScreen() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [heardText, setHeardText] = useState('');

  useEffect(() => {
    Voice.onSpeechResults = (e) => setHeardText(e.value?.[0] || '');
    Voice.onSpeechError = () => setIsListening(false);
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    setShowOverlay(true);
    setHeardText('');
    await Voice.start('en-US');
    setIsListening(true);
  };

  const stopListening = async () => {
    await Voice.stop();
    setIsListening(false);
  };

  return (
    <View className="flex-1 bg-white p-4">
      <SafeToSpendCard amount={640} daysLeft={17} month="Jul" />

      <TouchableOpacity
        onPress={startListening}
        className="bg-indigo-500 w-14 h-14 rounded-full items-center justify-center self-center mt-8"
      >
        <Ionicons name="mic" size={24} color="#fff" />
      </TouchableOpacity>

      <VoiceListeningOverlay
        visible={showOverlay}
        isListening={isListening}
        heardText={heardText}
        onStop={stopListening}
        onClose={() => setShowOverlay(false)}
      />
    </View>
  );
}