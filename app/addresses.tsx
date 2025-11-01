import { useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { Address } from '../types';

// Mock addresses - in real app this would come from a hook
const mockAddresses: Address[] = [
  {
    id: '1',
    type: 'home',
    label: 'Home',
    street: '123 Main Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    isDefault: true,
  },
  {
    id: '2',
    type: 'work',
    label: 'Office',
    street: '456 Business Ave, Floor 15',
    city: 'New York',
    state: 'NY',
    zipCode: '10002',
    country: 'USA',
    isDefault: false,
  },
];

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    type: 'home' as Address['type'],
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  const resetForm = () => {
    setFormData({
      type: 'home',
      label: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    });
    setEditingAddress(null);
  };

  const handleAddAddress = () => {
    if (!formData.label || !formData.street || !formData.city || !formData.state || !formData.zipCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddress]);
    setShowAddForm(false);
    resetForm();
  };

  const handleEditAddress = () => {
    if (!editingAddress) return;

    const updatedAddresses = addresses.map(addr =>
      addr.id === editingAddress.id ? { ...editingAddress, ...formData } : addr
    );

    setAddresses(updatedAddresses);
    setShowAddForm(false);
    resetForm();
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== id);
            setAddresses(updatedAddresses);
          }
        }
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    setAddresses(updatedAddresses);
  };

  const openEditForm = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    });
    setShowAddForm(true);
  };

  const getAddressTypeIcon = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return 'house.fill';
      case 'work':
        return 'building.2.fill';
      default:
        return 'location.fill';
    }
  };

  const AddressCard = ({ address }: { address: Address }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-start flex-1">
          <View className="bg-blue-50 p-2 rounded-lg mr-3">
            <IconSymbol 
              name={getAddressTypeIcon(address.type)} 
              size={20} 
              color="#3b82f6" 
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-lg">{address.label}</Text>
              {address.isDefault && (
                <View className="bg-green-100 px-2 py-1 rounded-full ml-2">
                  <Text className="text-green-700 text-xs font-medium">Default</Text>
                </View>
              )}
            </View>
            <Text className="text-gray-600 text-sm leading-5">
              {address.street}
            </Text>
            <Text className="text-gray-600 text-sm">
              {address.city}, {address.state} {address.zipCode}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row gap-2">
          {!address.isDefault && (
            <Button 
              size="sm" 
              variant="outline"
              onPress={() => handleSetDefault(address.id)}
            >
              Set Default
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onPress={() => openEditForm(address)}
          >
            Edit
          </Button>
        </View>
        <Pressable 
          onPress={() => handleDeleteAddress(address.id)}
          className="p-2"
        >
          <IconSymbol name="trash.fill" size={20} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.back()} className="mr-3">
              <IconSymbol name="chevron.left" size={24} color="#666" />
            </Pressable>
            <Text className="text-2xl font-bold">Saved Addresses</Text>
          </View>
          <Button 
            size="sm"
            onPress={() => {
              resetForm();
              setShowAddForm(true);
            }}
          >
            <IconSymbol name="plus" size={16} color="white" />
          </Button>
        </View>
      </View>

      {/* Content */}
      {addresses.length > 0 ? (
        <ScrollView className="flex-1 px-4 py-4">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <IconSymbol name="location.fill" size={64} color="#ccc" />
          <Text className="text-xl font-bold mt-4 text-center">No saved addresses</Text>
          <Text className="text-gray-500 text-center mt-2 mb-8">
            Add your favorite delivery locations for faster checkout
          </Text>
          <Button onPress={() => setShowAddForm(true)}>
            Add First Address
          </Button>
        </View>
      )}

      {/* Add/Edit Address Form */}
      <BottomSheet
        visible={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          resetForm();
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <ScrollView className="p-4 max-h-96">
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium mb-2">Address Type</Text>
              <View className="flex-row gap-2">
                {(['home', 'work', 'other'] as Address['type'][]).map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setFormData({ ...formData, type })}
                    className={`flex-1 py-3 px-4 rounded-lg border ${
                      formData.type === type
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text className={`text-center font-medium capitalize ${
                      formData.type === type ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium mb-2">Label *</Text>
              <Input
                placeholder="e.g., Home, Office, Mom's House"
                value={formData.label}
                onChangeText={(text) => setFormData({ ...formData, label: text })}
              />
            </View>

            <View>
              <Text className="text-sm font-medium mb-2">Street Address *</Text>
              <Input
                placeholder="Street address, apt/suite number"
                value={formData.street}
                onChangeText={(text) => setFormData({ ...formData, street: text })}
                multiline
                numberOfLines={2}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium mb-2">City *</Text>
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
              </View>
              <View className="w-20">
                <Text className="text-sm font-medium mb-2">State *</Text>
                <Input
                  placeholder="NY"
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium mb-2">ZIP Code *</Text>
              <Input
                placeholder="ZIP Code"
                value={formData.zipCode}
                onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                keyboardType="numeric"
              />
            </View>

            <View className="flex-row gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onPress={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onPress={editingAddress ? handleEditAddress : handleAddAddress}
              >
                {editingAddress ? 'Update' : 'Add'} Address
              </Button>
            </View>
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}