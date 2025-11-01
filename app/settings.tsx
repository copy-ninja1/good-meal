import { useState } from 'react';
import { View, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAtom } from 'jotai';
import { persistAuthAtom } from '@/lib/atoms';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [, setAuth] = useAtom(persistAuthAtom);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    darkMode: false,
    locationAccess: true,
    biometricAuth: false,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            setAuth({ user: null, isAuthenticated: false, isLoading: false });
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion request has been submitted. We will process this within 7 days.');
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    showToggle = true 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onToggle?: (value: boolean) => void;
    showToggle?: boolean;
  }) => (
    <View className="bg-white rounded-xl p-4 mb-2 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-gray-100 p-2 rounded-lg mr-3">
            <IconSymbol name={icon} size={20} color="#666" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base">{title}</Text>
            {subtitle && (
              <Text className="text-gray-600 text-sm mt-1">{subtitle}</Text>
            )}
          </View>
        </View>
        {showToggle && value !== undefined && onToggle && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
            thumbColor={value ? '#ffffff' : '#ffffff'}
          />
        )}
      </View>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-lg font-bold mb-3 mt-6 first:mt-0 px-1">{title}</Text>
  );

  const ActionItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    destructive = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    destructive?: boolean;
  }) => (
    <Pressable onPress={onPress}>
      <View className="bg-white rounded-xl p-4 mb-2 shadow-sm border border-gray-100">
        <View className="flex-row items-center">
          <View className={`p-2 rounded-lg mr-3 ${destructive ? 'bg-red-50' : 'bg-gray-100'}`}>
            <IconSymbol 
              name={icon} 
              size={20} 
              color={destructive ? '#ef4444' : '#666'} 
            />
          </View>
          <View className="flex-1">
            <Text className={`font-semibold text-base ${destructive ? 'text-red-600' : 'text-gray-900'}`}>
              {title}
            </Text>
            {subtitle && (
              <Text className="text-gray-600 text-sm mt-1">{subtitle}</Text>
            )}
          </View>
          <IconSymbol name="chevron.right" size={16} color="#9ca3af" />
        </View>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <IconSymbol name="chevron.left" size={24} color="#666" />
          </Pressable>
          <Text className="text-2xl font-bold">Settings</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <SettingItem
          icon="bell.fill"
          title="Push Notifications"
          subtitle="Get notified about order updates and promotions"
          value={settings.pushNotifications}
          onToggle={(value) => updateSetting('pushNotifications', value)}
        />
        <SettingItem
          icon="envelope.fill"
          title="Email Notifications"
          subtitle="Receive order confirmations and receipts"
          value={settings.emailNotifications}
          onToggle={(value) => updateSetting('emailNotifications', value)}
        />
        <SettingItem
          icon="message.fill"
          title="SMS Notifications"
          subtitle="Text messages for delivery updates"
          value={settings.smsNotifications}
          onToggle={(value) => updateSetting('smsNotifications', value)}
        />
        <SettingItem
          icon="tag.fill"
          title="Promotional Offers"
          subtitle="Special deals and discounts"
          value={settings.promotions}
          onToggle={(value) => updateSetting('promotions', value)}
        />

        {/* Privacy & Security */}
        <SectionHeader title="Privacy & Security" />
        <SettingItem
          icon="location.fill"
          title="Location Services"
          subtitle="Help us find nearby restaurants"
          value={settings.locationAccess}
          onToggle={(value) => updateSetting('locationAccess', value)}
        />
        <SettingItem
          icon="faceid"
          title="Biometric Authentication"
          subtitle="Use Face ID or Touch ID for secure login"
          value={settings.biometricAuth}
          onToggle={(value) => updateSetting('biometricAuth', value)}
        />

        {/* App Preferences */}
        <SectionHeader title="App Preferences" />
        <SettingItem
          icon="moon.fill"
          title="Dark Mode"
          subtitle="Switch to dark theme"
          value={settings.darkMode}
          onToggle={(value) => updateSetting('darkMode', value)}
        />

        {/* Account Management */}
        <SectionHeader title="Account" />
        <ActionItem
          icon="person.crop.circle.fill"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => router.push('/edit-profile')}
        />
        <ActionItem
          icon="creditcard.fill"
          title="Payment Methods"
          subtitle="Manage your saved cards"
          onPress={() => router.push('/payments')}
        />
        <ActionItem
          icon="location.circle.fill"
          title="Saved Addresses"
          subtitle="Manage delivery locations"
          onPress={() => router.push('/addresses')}
        />

        {/* Support */}
        <SectionHeader title="Support" />
        <ActionItem
          icon="questionmark.circle.fill"
          title="Help Center"
          subtitle="FAQs and customer support"
          onPress={() => Alert.alert('Help Center', 'Help center would open here')}
        />
        <ActionItem
          icon="phone.fill"
          title="Contact Us"
          subtitle="Get in touch with our support team"
          onPress={() => Alert.alert('Contact Us', 'Contact form would open here')}
        />
        <ActionItem
          icon="doc.text.fill"
          title="Terms of Service"
          subtitle="Read our terms and conditions"
          onPress={() => Alert.alert('Terms of Service', 'Terms would be displayed here')}
        />
        <ActionItem
          icon="shield.fill"
          title="Privacy Policy"
          subtitle="How we handle your data"
          onPress={() => Alert.alert('Privacy Policy', 'Privacy policy would be displayed here')}
        />

        {/* Account Actions */}
        <SectionHeader title="Account Actions" />
        <ActionItem
          icon="arrow.right.square.fill"
          title="Log Out"
          subtitle="Sign out of your account"
          onPress={handleLogout}
        />
        <ActionItem
          icon="trash.fill"
          title="Delete Account"
          subtitle="Permanently delete your account"
          onPress={handleDeleteAccount}
          destructive
        />

        {/* App Info */}
        <View className="mt-8 mb-4 items-center">
          <Text className="text-gray-500 text-sm">FoodDelivery App</Text>
          <Text className="text-gray-400 text-xs mt-1">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}