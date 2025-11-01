import { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useCart } from '@/lib/hooks/use-cart';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatCurrency } from '@/lib/utils';
import type { Address, PaymentMethod } from '../types';

// Mock data - in real app these would come from hooks
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
    type: 'apple_pay',
    isDefault: false,
  },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { cart, getCartTotals, clearCart } = useCart();
  const totals = getCartTotals();

  const [selectedAddress, setSelectedAddress] = useState<Address>(
    mockAddresses.find(addr => addr.isDefault) || mockAddresses[0]
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(
    mockPaymentMethods.find(method => method.isDefault) || mockPaymentMethods[0]
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const finalTotal = totals.total - promoDiscount;

  const handleApplyPromo = () => {
    // Mock promo code validation
    const validCodes = {
      'SAVE10': 0.1,
      'FIRST20': 0.2,
      'WELCOME': 5.00,
    };

    if (validCodes[promoCode as keyof typeof validCodes]) {
      const discount = typeof validCodes[promoCode as keyof typeof validCodes] === 'number' && 
                      validCodes[promoCode as keyof typeof validCodes] < 1 
        ? totals.subtotal * (validCodes[promoCode as keyof typeof validCodes] as number)
        : validCodes[promoCode as keyof typeof validCodes] as number;
      
      setPromoDiscount(discount);
      Alert.alert('Success', 'Promo code applied!');
    } else {
      Alert.alert('Error', 'Invalid promo code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      Alert.alert('Error', 'Please select delivery address and payment method');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and redirect to success
      clearCart();
      
      Alert.alert(
        'Order Placed!',
        'Your order has been confirmed. You will receive updates via notifications.',
        [
          {
            text: 'View Orders',
            onPress: () => router.replace('/orders')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const AddressCard = ({ address, isSelected, onSelect }: {
    address: Address;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <Pressable
      onPress={onSelect}
      className={`bg-white rounded-xl p-4 mb-3 border-2 ${
        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-100'
      }`}
    >
      <View className="flex-row items-start">
        <View className="bg-blue-100 p-2 rounded-lg mr-3">
          <IconSymbol 
            name={address.type === 'home' ? 'house.fill' : 'building.2.fill'} 
            size={16} 
            color="#3b82f6" 
          />
        </View>
        <View className="flex-1">
          <Text className={`font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
            {address.label}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            {address.street}
          </Text>
          <Text className="text-gray-600 text-sm">
            {address.city}, {address.state} {address.zipCode}
          </Text>
        </View>
        {isSelected && (
          <IconSymbol name="checkmark.circle.fill" size={20} color="#3b82f6" />
        )}
      </View>
    </Pressable>
  );

  const PaymentCard = ({ method, isSelected, onSelect }: {
    method: PaymentMethod;
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <Pressable
      onPress={onSelect}
      className={`bg-white rounded-xl p-4 mb-3 border-2 ${
        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-100'
      }`}
    >
      <View className="flex-row items-center">
        <View className="bg-blue-100 p-2 rounded-lg mr-3">
          <IconSymbol 
            name={method.type === 'apple_pay' ? 'applelogo' : 'creditcard.fill'} 
            size={16} 
            color="#3b82f6" 
          />
        </View>
        <View className="flex-1">
          <Text className={`font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
            {method.type === 'apple_pay' 
              ? 'Apple Pay' 
              : `${method.brand?.toUpperCase()} ???? ${method.last4}`
            }
          </Text>
          {method.type === 'card' && (
            <Text className="text-gray-600 text-sm">
              Expires {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
            </Text>
          )}
        </View>
        {isSelected && (
          <IconSymbol name="checkmark.circle.fill" size={20} color="#3b82f6" />
        )}
      </View>
    </Pressable>
  );

  if (cart.length === 0) {
    return (
      <View className="flex-1 items-center justify-center" style={{ paddingTop: insets.top }}>
        <IconSymbol name="cart" size={64} color="#ccc" />
        <Text className="text-xl font-bold mt-4">Your cart is empty</Text>
        <Text className="text-gray-500 text-center mt-2 mb-8">
          Add items to your cart to proceed with checkout
        </Text>
        <Button onPress={() => router.push('/index')}>
          Browse Vendors
        </Button>
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
          <Text className="text-2xl font-bold">Checkout</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Order Summary */}
        <View className="px-4 py-4 bg-gray-50">
          <Text className="text-lg font-bold mb-3">Order Summary</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            {cart.map((item) => (
              <View key={item.id} className="flex-row items-center mb-3 last:mb-0">
                <Image
                  source={{ uri: item.product.images[0] }}
                  className="w-12 h-12 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="font-medium">{item.product.name}</Text>
                  <Text className="text-gray-600 text-sm">Qty: {item.quantity}</Text>
                </View>
                <Text className="font-bold">{formatCurrency(item.totalPrice)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold">Delivery Address</Text>
            <Button size="sm" variant="outline" onPress={() => router.push('/addresses')}>
              Change
            </Button>
          </View>
          {mockAddresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddress.id === address.id}
              onSelect={() => setSelectedAddress(address)}
            />
          ))}
        </View>

        {/* Payment Method */}
        <View className="px-4 py-4 bg-gray-50">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold">Payment Method</Text>
            <Button size="sm" variant="outline" onPress={() => router.push('/payments')}>
              Change
            </Button>
          </View>
          {mockPaymentMethods.map((method) => (
            <PaymentCard
              key={method.id}
              method={method}
              isSelected={selectedPayment.id === method.id}
              onSelect={() => setSelectedPayment(method)}
            />
          ))}
        </View>

        {/* Delivery Instructions */}
        <View className="px-4 py-4">
          <Text className="text-lg font-bold mb-3">Delivery Instructions</Text>
          <Input
            placeholder="Leave at door, ring bell, etc..."
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Promo Code */}
        <View className="px-4 py-4 bg-gray-50">
          <Text className="text-lg font-bold mb-3">Promo Code</Text>
          <View className="flex-row gap-3">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              className="flex-1"
              autoCapitalize="characters"
            />
            <Button onPress={handleApplyPromo} disabled={!promoCode.trim()}>
              Apply
            </Button>
          </View>
          {promoDiscount > 0 && (
            <View className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Text className="text-green-800 font-medium">
                Promo code applied! You saved {formatCurrency(promoDiscount)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Order Total & Place Order */}
      <View className="border-t border-gray-200 bg-white p-4">
        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="font-medium">{formatCurrency(totals.subtotal)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="font-medium">{formatCurrency(totals.deliveryFee)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Tax</Text>
            <Text className="font-medium">{formatCurrency(totals.tax)}</Text>
          </View>
          {promoDiscount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-green-600">Discount</Text>
              <Text className="text-green-600 font-medium">-{formatCurrency(promoDiscount)}</Text>
            </View>
          )}
          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <Text className="text-lg font-bold">Total</Text>
            <Text className="text-lg font-bold">{formatCurrency(finalTotal)}</Text>
          </View>
        </View>

        <Button
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
          className="w-full"
        >
          {isPlacingOrder ? 'Placing Order...' : `Place Order ? ${formatCurrency(finalTotal)}`}
        </Button>

        <Text className="text-gray-500 text-xs text-center mt-3">
          By placing this order, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}