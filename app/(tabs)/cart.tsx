import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useCart } from '@/lib/hooks/use-cart';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatCurrency } from '@/lib/utils';
import { Image } from 'expo-image';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { cart, removeItem, updateQuantity, getCartTotals, clearCart } = useCart();
  const totals = getCartTotals();

  if (cart.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-4" style={{ paddingTop: insets.top }}>
        <IconSymbol name="cart.fill" size={64} color="#ccc" />
        <Text className="text-xl font-bold mt-4">Your cart is empty</Text>
        <Text className="text-gray-500 text-center mt-2">
          Add items from your favorite vendors to get started
        </Text>
        <Button onPress={() => router.push('/index')} className="mt-8">
          Browse Vendors
        </Button>
      </View>
    );
  }

  const vendors = Array.from(new Set(cart.map(item => item.vendorId)));
  const hasMultipleVendors = vendors.length > 1;

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3 bg-white border-b border-gray-200 flex-row items-center justify-between">
        <Text className="text-xl font-bold">Cart</Text>
        {cart.length > 0 && (
          <Pressable onPress={clearCart}>
            <Text className="text-red-600">Clear All</Text>
          </Pressable>
        )}
      </View>

      <ScrollView className="flex-1">
        {hasMultipleVendors && (
          <View className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
            <Text className="text-sm text-yellow-800">
              You have items from multiple vendors. Please order from one vendor at a time.
            </Text>
          </View>
        )}

        <View className="px-4 py-4">
          {cart.map((item) => (
            <View key={item.id} className="bg-white rounded-xl p-3 mb-3 shadow-sm">
              <View className="flex-row">
                <Image
                  source={{ uri: item.product.images[0] }}
                  className="w-20 h-20 rounded-lg"
                  contentFit="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="font-semibold text-base">{item.product.name}</Text>
                  <Text className="text-gray-600 text-sm mb-2">
                    {formatCurrency(item.unitPrice)} each
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                        <IconSymbol name="minus" size={16} color="#666" />
                      </Pressable>
                      <Text className="mx-3 font-semibold">{item.quantity}</Text>
                      <Pressable
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center">
                        <IconSymbol name="plus" size={16} color="white" />
                      </Pressable>
                    </View>

                    <View className="flex-row items-center">
                      <Text className="font-bold mr-3">{formatCurrency(item.totalPrice)}</Text>
                      <Pressable onPress={() => removeItem(item.id)}>
                        <IconSymbol name="trash.fill" size={20} color="#ef4444" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="border-t border-gray-200 bg-white p-4">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Subtotal</Text>
          <Text className="font-semibold">{formatCurrency(totals.subtotal)}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Delivery Fee</Text>
          <Text className="font-semibold">{formatCurrency(totals.deliveryFee)}</Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-600">Tax</Text>
          <Text className="font-semibold">{formatCurrency(totals.tax)}</Text>
        </View>
        <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-200">
          <Text className="text-lg font-bold">Total</Text>
          <Text className="text-lg font-bold">{formatCurrency(totals.total)}</Text>
        </View>
        <Button
          onPress={() => router.push('/checkout')}
          className="w-full"
          disabled={hasMultipleVendors}>
          Proceed to Checkout
        </Button>
      </View>
    </View>
  );
}

