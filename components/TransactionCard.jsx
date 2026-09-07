import { View, Text } from 'react-native';
import Badge from './Badge';

export default function TransactionCard({ title, sub, amount, icon }) {
  return (
    <View
      className="flex-row items-center bg-white rounded-xl p-3 mb-2"
      style={{ shadowColor: '#4143d5', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 }}
    >
      <View className="mr-3">
        <Badge icon={icon} size={40} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-[#191c1e]">{title}</Text>
        <Text className="text-xs text-[#464555] mt-0.5">{sub}</Text>
      </View>
      <Text className="text-sm font-bold text-[#ba1a1a]">- Rs {Math.abs(amount)}</Text>
    </View>
  );
}