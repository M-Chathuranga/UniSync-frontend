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

export default function SignUpScreen() {
  const router = useRouter();


  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Loading state to control UI button spinner during API call
  const [loading, setLoading] = useState(false);

  // Backend API URL - Replace '192.168.8.100' with your PC's local IPv4 address
  const API_URL = process.env.EXPO_PUBLIC_API_URL + '/users';

  const handleSignUp = async() => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    // Start loading indicator
    setLoading(true);

    try {
      // 2. Send POST request to backend Express API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      // Parse JSON response payload from server
      const data = await response.json();

      // 3. Handle backend HTTP response status
      if (response.status === 201) {
        // HTTP 201 Created: Success
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'Log In Now', onPress: () => router.replace('/login') }
        ]);
      } else {
        // HTTP 400/500 Error response from backend
        Alert.alert('Registration Failed', data.message || 'Something went wrong');
      }

    } catch (error) {
      // Catch network or connection errors
      console.error('Connection Error:', error);
      Alert.alert('Network Error', 'Unable to connect to the backend server. Check Wi-Fi & IP address.');
    } finally {
      // Stop loading indicator
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }} 
      className="bg-indigo-100" 
      bounces={false}
    >
      {/* Header with Back Button & App Title */}
      <View className="flex-row items-center px-5 pt-12 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={26} color="#1e1b4b" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-indigo-900 pr-7">
          Smart Finance
        </Text>
      </View>

      {/* Top Banner Image */}
      <View className="h-60 justify-center items-center px-4 pt-2 pb-2">
        <Image
          source={{ uri: 'https://img.freepik.com/free-vector/sign-concept-illustration_114360-125.jpg' }}
          className="w-full h-full rounded-3xl"
          resizeMode="cover"
        />
      </View>

      {/* Sign Up Card Sheet */}
      <View className="flex-1 bg-white rounded-t-[32px] px-6 pt-8 pb-8 justify-between">
        <View>
          {/* Headings */}
          <Text className="text-3xl font-bold text-gray-900 ">Create Account</Text>
          <Text className="text-sm text-gray-500 mt-1.5 mb-3">
            Start tracking your student budget today.
          </Text>

          {/* First Name Input */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">First Name</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900"
              placeholder="Alex"
              placeholderTextColor="#9ca3af"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name Input */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Last Name</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900"
              placeholder="Morgan"
              placeholderTextColor="#9ca3af"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-700 mb-2">Email</Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-base text-gray-900"
              placeholder="example@student.edu"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Field with Eye Icon */}
          <View className="mb-4">
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

          {/* Sign Up Button */}
          <TouchableOpacity 
            className="bg-indigo-600 py-4 rounded-2xl items-center mt-4 shadow-md shadow-indigo-300" 
            onPress={handleSignUp}
          >
            <Text className="text-white font-bold text-lg">Sign Up →</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Link to Login */}
        <TouchableOpacity 
          className="items-center pt-8 pb-8"
          onPress={() => router.push('/login')}
        >
          <Text className="text-sm text-gray-500">
            Already have an account? <Text className="text-indigo-600 font-bold">Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

