import { View, Text } from 'react-native';

export default function Header({ appName = 'Smart Finance', userInitial = 'S' }) {
  return (
    <View className="flex-row justify-between items-center mb-5">
      <Text className="text-lg font-bold text-[#191c1e]">{appName}</Text>
      <View className="w-10 h-10 rounded-full bg-[#e1e0ff] items-center justify-center">
        <Text className="text-[#2c2cc3] font-bold">{userInitial}</Text>
      </View>
    </View>
  );
}