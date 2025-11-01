import { useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import type { PaymentMethod } from '../types';

// Mock payment methods - in real app this would come from a hook
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    provider: 'stripe',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    provider: 'stripe',
    last4: '5555',
    brand: 'mastercard',
    expiryMonth: 8,
    expiryYear: 2024,
    isDefault: false,
  },
  {
    id: '3',
    type: 'apple_pay',
    isDefault: false,
  },
];

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      name: '',
    });
  };

  const handleAddCard = () => {
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Basic validation
    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }

    const [month, year] = formData.expiryDate.split('/');
    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
      Alert.alert('Error', 'Please enter a valid expiry date');
      return;
    }

    // Simulate adding card
    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      provider: 'stripe',
      last4: cleanCardNumber.slice(-4),
      brand: getCardBrand(cleanCardNumber),
      expiryMonth: parseInt(month),
      expiryYear: parseInt('20' + year),
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods([...paymentMethods, newCard]);
    setShowAddForm(false);
    resetForm();
    Alert.alert('Success', 'Payment method added successfully!');
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedMethods = paymentMethods.filter(method => method.id !== id);
            setPaymentMethods(updatedMethods);
          }
        }
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    }));
    setPaymentMethods(updatedMethods);
  };

  const getCardBrand = (cardNumber: string): PaymentMethod['brand'] => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    if (firstDigit === '3') return 'amex';
    return 'visa'; // default
  };

  const getCardIcon = (brand?: PaymentMethod['brand']) => {
    switch (brand) {
      case 'visa':
        return 'creditcard.fill';
      case 'mastercard':
        return 'creditcard.fill';
      case 'amex':
        return 'creditcard.fill';
      default:
        return 'creditcard.fill';
    }
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'apple_pay':
        return 'applelogo';
      case 'google_pay':
        return 'g.circle.fill';
      default:
        return 'creditcard.fill';
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const PaymentMethodCard = ({ method }: { method: PaymentMethod }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="bg-blue-50 p-3 rounded-xl mr-3">
            <IconSymbol 
              name={getPaymentMethodIcon(method.type)} 
              size={24} 
              color="#3b82f6" 
            />
          </View>
          <View className="flex-1">
            {method.type === 'card' ? (
              <>
                <Text className="font-bold text-lg capitalize">
                  {method.brand} ???? {method.last4}
                </Text>
                <Text className="text-gray-600 text-sm">
                  Expires {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
                </Text>
              </>
            ) : (
              <Text className="font-bold text-lg">
                {method.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
              </Text>
            )}
          </View>
          {method.isDefault && (
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-medium">Default</Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row gap-2">
          {!method.isDefault && (
            <Button 
              size="sm" 
              variant="outline"
              onPress={() => handleSetDefault(method.id)}
            >
              Set Default
            </Button>
          )}
        </View>
        <Pressable 
          onPress={() => handleDeleteCard(method.id)}
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
            <Text className="text-2xl font-bold">Payment Methods</Text>
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
      {paymentMethods.length > 0 ? (
        <ScrollView className="flex-1 px-4 py-4">
          {paymentMethods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
          
          {/* Quick Add Options */}
          <View className="mt-4">
            <Text className="text-lg font-bold mb-3">Quick Add</Text>
            <View className="flex-row gap-3">
              <Pressable 
                className="flex-1 bg-black rounded-xl p-4 items-center"
                onPress={() => Alert.alert('Apple Pay', 'Apple Pay integration would be implemented here')}
              >
                <IconSymbol name="applelogo" size={24} color="white" />
                <Text className="text-white font-semibold mt-2">Apple Pay</Text>
              </Pressable>
              <Pressable 
                className="flex-1 bg-white border border-gray-200 rounded-xl p-4 items-center"
                onPress={() => Alert.alert('Google Pay', 'Google Pay integration would be implemented here')}
              >
                <Text className="text-2xl">G</Text>
                <Text className="text-gray-700 font-semibold mt-2">Google Pay</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <IconSymbol name="creditcard.fill" size={64} color="#ccc" />
          <Text className="text-xl font-bold mt-4 text-center">No payment methods</Text>
          <Text className="text-gray-500 text-center mt-2 mb-8">
            Add a payment method to place orders faster
          </Text>
          <Button onPress={() => setShowAddForm(true)}>
            Add Payment Method
          </Button>
        </View>
      )}

      {/* Add Card Form */}
      <BottomSheet
        visible={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          resetForm();
        }}
        title="Add Credit Card"
      >
        <ScrollView className="p-4 max-h-96">
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium mb-2">Card Number *</Text>
              <Input
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  cardNumber: formatCardNumber(text) 
                })}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium mb-2">Expiry Date *</Text>
                <Input
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    expiryDate: formatExpiryDate(text) 
                  })}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium mb-2">CVV *</Text>
                <Input
                  placeholder="123"
                  value={formData.cvv}
                  onChangeText={(text) => setFormData({ ...formData, cvv: text })}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium mb-2">Cardholder Name *</Text>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoCapitalize="words"
              />
            </View>

            <View className="bg-blue-50 p-3 rounded-lg">
              <View className="flex-row items-center mb-1">
                <IconSymbol name="lock.fill" size={16} color="#3b82f6" />
                <Text className="text-blue-800 font-medium ml-2">Secure Payment</Text>
              </View>
              <Text className="text-blue-700 text-sm">
                Your payment information is encrypted and secure. We never store your full card details.
              </Text>
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
                onPress={handleAddCard}
              >
                Add Card
              </Button>
            </div>
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}