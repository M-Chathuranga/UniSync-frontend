import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Badge({ icon, bgColor = '#e1e0ff', iconColor = '#2c2cc3', size = 32 }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: bgColor }}
    >
      <Ionicons name={icon} size={size * 0.45} color={iconColor} />
    </View>
  );
}