import { View } from 'react-native';

export default function Card({ children, className = '' }) {
  return (
    <View
      className={`bg-white rounded-2xl p-4 ${className}`}
      style={{ shadowColor: '#4143d5', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
    >
      {children}
    </View>
  );
}