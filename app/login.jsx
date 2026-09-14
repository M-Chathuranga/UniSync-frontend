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
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_USER_KEY = '@smart_finance_auth_user';

export const extractNameFromEmail = (email) => {
  if (!email || !email.includes('@')) return 'User';
  const rawUsername = email.split('@')[0];
  const cleaned = rawUsername.replace(/[._\-0-9]/g, ' ').trim();
  if (!cleaned) return rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1);
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Basic validation - Check if fields are empty
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      // 2. Define backend API URL from .env file
      const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/auth/login`;

      // 3. Send HTTP POST request to Express Backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
        }),
      });

      // 4. Parse the JSON response from Backend
      const data = await response.json();

      // 5. Check if HTTP Status Code is 200 (Success)
      if (response.status === 200) {
        // Prepare user session object with real JWT token and User details from DB
        const userSession = {
          token: data.token,
          email: data.user.email,
          name: data.user.name,
          rememberMe: rememberMe,
          loggedInAt: new Date().toISOString(),
        };

        // Save session data to phone storage
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userSession));

        // Navigate to dashboard/tabs screen
        router.replace('/tabs');
      } else {
        // Handle HTTP 400 or 401 response errors sent from controller
        Alert.alert('Login Failed', data.message || 'Invalid email or password');
      }

    } catch (error) {
      // Handle Network level errors (IP address mismatched, server offline, etc.)
      console.error('Network Error:', error);
      Alert.alert('Network Error', 'Unable to connect to the backend server. Check Wi-Fi & IP address.');
      
    }finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }} 
      className="bg-indigo-100" 
      bounces={false}
    >
      <View className="flex-row items-center px-5 pt-12 pb-2">
        <Text className="flex-1 text-center text-xl font-bold text-indigo-900 pr-7">
          Smart Finance
        </Text>
      </View>

      <View className="h-60 justify-center items-center px-4 pt-4 pb-2">
        <Image
          source={{ uri: 'https://img.freepik.com/free-vector/financial-growth-concept-illustration_114360-7853.jpg' }}
          className="w-full h-full rounded-3xl"
          resizeMode="cover"
        />
      </View>

      <View className="flex-1 bg-white rounded-t-[32px] px-6 pt-10 pb-8 justify-between">
        <View>
          <View className="w-12 h-12 rounded-2xl bg-indigo-50 justify-center items-center mb-5">
            <Ionicons name="shield-checkmark" size={26} color="#4f46e5" />
          </View>

          <Text className="text-4xl font-bold text-gray-900">Login</Text>
          <Text className="text-sm text-gray-500 mt-1.5 mb-7">
            Enter your email and password to log in
          </Text>

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
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              importantForAutofill="yes"
            />
          </View>

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

          <TouchableOpacity 
            className="bg-indigo-600 py-4 rounded-2xl items-center mt-6 shadow-md shadow-indigo-300" 
            onPress={handleLogin}
          >
            <Text className="text-white font-bold text-lg">Log In →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/signup')}>
          <Text className="text-sm text-gray-500">
            Don't have an account? <Text className="text-indigo-600 font-bold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}