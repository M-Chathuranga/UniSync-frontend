import { View, Text } from 'react-native';

export default function SafeToSpendCard({ amount = 0, daysLeft = 0, month = '' }) {
  return (
    <View className="bg-green-50 rounded-2xl p-4 mb-3">
      <Text className="text-[11px] font-bold text-green-600 tracking-wide">
        SAFE TO SPEND TODAY
      </Text>
      <Text className="text-4xl font-extrabold text-green-600 mt-1">
        Rs {amount.toFixed(2)}
      </Text>
      <Text className="text-xs text-green-600 mt-1">
        • {daysLeft} days left in {month}
      </Text>
    </View>
  );
}