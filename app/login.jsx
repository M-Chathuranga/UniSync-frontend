import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    router.replace('/tabs');
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }} 
      className="bg-indigo-100" 
      bounces={false}
    >

      {/* App Title */}
            <View className="flex-row items-center px-5 pt-12 pb-2">
              <Text className="flex-1 text-center text-xl font-bold text-indigo-900 pr-7">
                Smart Finance
              </Text>
            </View>

      {/* 1. Header Banner Image */}
      <View className="h-60 justify-center items-center px-4 pt-4 pb-2">
        <Image
          source={{ uri: 'https://img.freepik.com/free-vector/financial-growth-concept-illustration_114360-7853.jpg' }}
          className="w-full h-full rounded-3xl"
          resizeMode="cover"
        />
      </View>

      {/* Login Card Sheet */}
      <View className="flex-1 bg-white rounded-t-[32px] px-6 pt-10 pb-8 justify-between">
        <View>
          
          {/* Shield Icon Badge */}
          <View className="w-12 h-12 rounded-2xl bg-indigo-50 justify-center items-center mb-5">
            <Ionicons name="shield-checkmark" size={26} color="#4f46e5" />
          </View>

          {/* Title and Subtitle */}
          <Text className="text-4xl font-bold text-gray-900 ">Login</Text>
          <Text className="text-sm text-gray-500 mt-1.5 mb-7">
            Enter your email and password to log in
          </Text>

          {/* Email Field */}
          <View className="mb-5">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Email</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900"
              placeholder="alex@example.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Field */}
          <View className="mb-5">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Password</Text>
            <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 bg-white">
              <TextInput
                className="flex-1 py-3.5 text-base text-gray-900"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={22} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me & Forgot Password */}
          <View className="flex-row justify-between items-center my-3">
            <TouchableOpacity 
              className="flex-row items-center" 
              onPress={() => setRememberMe(!rememberMe)}
            >
              <Ionicons 
                name={rememberMe ? "checkbox" : "square-outline"} 
                size={22} 
                color={rememberMe ? "#4f46e5" : "#9ca3af"} 
              />
              <Text className="text-sm text-gray-600 ml-2">Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text className="text-sm text-indigo-600 font-semibold">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Log In Button */}
          <TouchableOpacity 
            className="bg-indigo-600 py-4 rounded-2xl items-center mt-6 shadow-md shadow-indigo-300" 
            onPress={handleLogin}
          >
            <Text className="text-white font-bold text-lg">Log In →</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <TouchableOpacity 
          className="items-center pt-8 pb-8"
          onPress={() => router.push('/signup')}
        >
          <Text className="text-sm text-gray-500">
            Don't have an account? <Text className="text-indigo-600 font-bold">Sign Up</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}