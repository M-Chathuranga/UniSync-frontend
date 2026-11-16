import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform
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

  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'bg-gray-200', width: 'w-0', textColor: 'text-gray-400' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) {
      return { label: 'Password is weak', color: 'bg-red-500', width: 'w-1/3', textColor: 'text-red-500' };
    }
    if (score === 2 || score === 3) {
      return { label: 'Password is medium', color: 'bg-yellow-500', width: 'w-2/3', textColor: 'text-yellow-600' };
    }
    return { label: 'Password is strong', color: 'bg-green-500', width: 'w-full', textColor: 'text-green-600' };
  };

  const strength = getPasswordStrength(password);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/auth/register`;

      // Send POST request with user parameters
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

      const data = await response.json();

      // Handle 201 Created status
      if (response.status === 201) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'Log In Now', onPress: () => router.replace('/login') },
        ]);
      } else {
        // Handle bad request / user already exists
        Alert.alert('Registration Failed', data.message || 'Could not register user');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Network Error', 'Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }} 
        className="bg-indigo-100" 
        bounces={false}
        keyboardShouldPersistTaps="handled"
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

            {/* Password Field with Eye Icon & Strength Meter */}
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

              {password.length > 0 && (
                <View className="mt-2.5 px-1">
                  <View className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <View className={`h-full rounded-full ${strength.color} ${strength.width}`} />
                  </View>
                  <Text className={`text-xs font-medium mt-1.5 ${strength.textColor}`}>
                    {strength.label}
                  </Text>
                </View>
              )}
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
    </KeyboardAvoidingView>
  );
}
