import { View } from 'react-native';

export default function ProgressBar({ percent = 0, color = '#4143d5', trackColor = '#e0e3e5', height = 8 }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden' }}>
      <View style={{ width: `${percent}%`, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}