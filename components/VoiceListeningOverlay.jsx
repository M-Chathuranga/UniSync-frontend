import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceListeningOverlay({ visible, isListening, heardText, onStop, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <View className="bg-white rounded-3xl p-8 items-center w-full">
          <View
            className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
              isListening ? 'bg-red-500' : 'bg-indigo-500'
            }`}
          >
            <Ionicons name="mic" size={36} color="#fff" />
          </View>
          <Text className="text-base font-bold text-gray-900 mb-1">
            {isListening ? 'Listening...' : 'Tap mic to speak'}
          </Text>
          <Text className="text-xs text-gray-500 text-center mb-6">
            Say something like "two hundred for food"
          </Text>
          {heardText ? (
            <View className="bg-indigo-50 rounded-xl px-4 py-2 mb-4 w-full">
              <Text className="text-xs text-indigo-600 text-center">"{heardText}"</Text>
            </View>
          ) : null}
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={onStop} className="bg-red-500 rounded-full px-6 py-3">
              <Text className="text-white font-bold text-sm">Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} className="bg-gray-200 rounded-full px-6 py-3">
              <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}