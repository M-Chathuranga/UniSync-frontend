import { View, Text } from 'react-native';
import ProgressBar from './ProgressBar';

export default function CategoryCard({ label, percent, color }) {
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-xs text-[#464555]">{label}</Text>
        <Text className="text-xs font-semibold text-[#191c1e]">{percent}%</Text>
      </View>
      <ProgressBar percent={percent} color={color} />
    </View>
  );
}