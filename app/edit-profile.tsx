import { useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useProfile } from '@/lib/hooks/use-profile';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading } = useProfile();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Profile Updated',
        'Your profile has been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color="#666" />
          </Pressable>
          <Text className="text-2xl font-bold">Edit Profile</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Profile Photo */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 rounded-full bg-blue-600 items-center justify-center mb-4">
            {user?.avatar ? (
              <Text className="text-6xl">??</Text>
            ) : (
              <Text className="text-white text-5xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>
          <Button variant="outline" size="sm">
            <IconSymbol name="camera.fill" size={16} color="#666" />
            <Text className="ml-2">Change Photo</Text>
          </Button>
        </View>

        {/* Form Fields */}
        <View className="space-y-6">
          <View>
            <Text className="text-sm font-medium mb-2 text-gray-700">Full Name *</Text>
            <Input
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2 text-gray-700">Email Address *</Text>
            <Input
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-2 text-gray-700">Phone Number</Text>
            <Input
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          {/* Account Settings */}
          <View className="bg-gray-50 rounded-xl p-4 mt-8">
            <Text className="font-bold text-base mb-3">Account Settings</Text>
            
            <Pressable className="flex-row items-center justify-between py-3 border-b border-gray-200">
              <View className="flex-row items-center">
                <IconSymbol name="lock.fill" size={16} color="#666" />
                <Text className="ml-3 font-medium">Change Password</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between py-3 border-b border-gray-200">
              <View className="flex-row items-center">
                <IconSymbol name="envelope.fill" size={16} color="#666" />
                <Text className="ml-3 font-medium">Email Preferences</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <IconSymbol name="bell.fill" size={16} color="#666" />
                <Text className="ml-3 font-medium">Notification Settings</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#9ca3af" />
            </Pressable>
          </View>

          {/* Save Button */}
          <View className="mt-8 mb-6">
            <Button
              onPress={handleSave}
              disabled={isSaving}
              className="w-full h-12"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </View>

          {/* Privacy Notice */}
          <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <View className="flex-row items-start">
              <IconSymbol name="info.circle.fill" size={16} color="#3b82f6" />
              <View className="ml-3 flex-1">
                <Text className="text-blue-900 font-medium mb-1">Privacy Notice</Text>
                <Text className="text-blue-800 text-sm">
                  Your personal information is kept secure and is only used to improve your food delivery experience. 
                  We never share your data with third parties without your consent.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}