import { useState } from 'react';
import { View, ScrollView, Pressable, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProduct } from '@/lib/hooks/use-products';
import { useCart } from '@/lib/hooks/use-cart';
import { useVendor } from '@/lib/hooks/use-vendors';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { CarouselComponent } from '@/components/ui/carousel';

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || '');
  const { data: vendor } = useVendor(product?.vendorId || '');
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string[]>>({});

  if (isLoading) {
    return (
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <Skeleton className="w-full h-64" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Product not found</Text>
      </View>
    );
  }

  const renderImage = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} className="w-full h-64" contentFit="cover" />
  );

  const toggleCustomization = (customizationId: string, optionId: string) => {
    const customization = product.customizations?.find(c => c.id === customizationId);
    if (!customization) return;

    if (customization.type === 'single') {
      setSelectedCustomizations({ ...selectedCustomizations, [customizationId]: [optionId] });
    } else {
      const current = selectedCustomizations[customizationId] || [];
      const newSelection = current.includes(optionId)
        ? current.filter(id => id !== optionId)
        : [...current, optionId];
      setSelectedCustomizations({ ...selectedCustomizations, [customizationId]: newSelection });
    }
  };

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1">
        <View className="relative">
          <CarouselComponent
            data={product.images}
            renderItem={renderImage}
            itemWidth={400}
            showPagination={false}
            autoplay={false}
          />
          <Pressable
            onPress={() => router.back()}
            className="absolute top-12 left-4 bg-white/90 rounded-full p-2">
            <IconSymbol name="arrow.back" size={24} color="#000" />
          </Pressable>
        </View>

        <View className="px-4 py-6 bg-white">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold mb-2 leading-tight">{product.name}</Text>
              <View className="flex-row items-center mb-3">
                <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg mr-3">
                  <IconSymbol name="star.fill" size={14} color="#fbbf24" />
                  <Text className="ml-1 font-semibold text-yellow-800">{product.rating}</Text>
                </View>
                <Pressable>
                  <Text className="text-blue-600 text-sm">({product.reviewCount} reviews)</Text>
                </Pressable>
              </View>
            </View>
            {!product.isAvailable && (
              <View className="bg-red-100 px-3 py-2 rounded-lg">
                <Text className="text-red-700 font-medium text-sm">Out of Stock</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center mb-4">
            <Text className="text-3xl font-bold text-blue-600">
              {formatCurrency(product.price)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <View className="ml-3 bg-red-50 px-2 py-1 rounded-lg">
                <Text className="text-red-600 line-through text-base font-medium">
                  {formatCurrency(product.originalPrice)}
                </Text>
              </View>
            )}
          </View>
          
          <Text className="text-gray-700 text-base leading-6 mb-4">{product.description}</Text>

          {/* Vendor Info */}
          {vendor && (
            <Pressable 
              onPress={() => router.push(`/vendor/${vendor.id}`)}
              className="bg-gray-50 rounded-xl p-4 mb-4"
            >
              <View className="flex-row items-center">
                <Image
                  source={{ uri: vendor.logo }}
                  className="w-12 h-12 rounded-xl"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="font-semibold text-gray-900">{vendor.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <IconSymbol name="star.fill" size={12} color="#fbbf24" />
                    <Text className="text-sm text-gray-600 ml-1">{vendor.rating} • {vendor.deliveryTime} min</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#9ca3af" />
              </View>
            </Pressable>
          )}
        </View>

        {product.customizations && product.customizations.length > 0 && (
          <View className="px-4 py-4 bg-gray-50">
            <Text className="text-lg font-bold mb-4">Customize Your Order</Text>
            {product.customizations.map((customization) => (
              <View key={customization.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                <View className="flex-row items-center mb-3">
                  <Text className="font-bold text-base flex-1">
                    {customization.name}
                  </Text>
                  {customization.required && (
                    <View className="bg-red-100 px-2 py-1 rounded-lg">
                      <Text className="text-red-700 text-xs font-medium">Required</Text>
                    </View>
                  )}
                </View>
                <Text className="text-gray-600 text-sm mb-3">
                  {customization.type === 'single' ? 'Choose one' : 'Choose multiple'}
                </Text>
                
                <View className="space-y-2">
                  {customization.options.map((option) => {
                    const isSelected = selectedCustomizations[customization.id]?.includes(option.id);
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => toggleCustomization(customization.id, option.id)}
                        className={`flex-row items-center justify-between p-3 rounded-xl border-2 transition-colors ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}>
                        <View className="flex-row items-center flex-1">
                          <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <IconSymbol name="checkmark" size={12} color="white" />
                            )}
                          </View>
                          <Text className={`${isSelected ? 'font-semibold text-blue-900' : 'text-gray-900'}`}>
                            {option.name}
                          </Text>
                        </View>
                        {option.price > 0 && (
                          <Text className="text-blue-600 font-bold">
                            +{formatCurrency(option.price)}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Additional Info */}
        <View className="px-4 py-4 bg-white">
          <Text className="text-lg font-bold mb-4">Additional Information</Text>
          
          {product.calories && (
            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <View className="flex-row items-center">
                <IconSymbol name="flame.fill" size={16} color="#f97316" />
                <Text className="font-semibold text-gray-900 ml-2">Nutritional Info</Text>
              </View>
              <Text className="text-gray-700 mt-2">{product.calories} calories per serving</Text>
            </View>
          )}

          {product.ingredients && product.ingredients.length > 0 && (
            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <IconSymbol name="leaf.fill" size={16} color="#10b981" />
                <Text className="font-semibold text-gray-900 ml-2">Ingredients</Text>
              </View>
              <Text className="text-gray-700">{product.ingredients.join(', ')}</Text>
            </View>
          )}

          {product.allergens && product.allergens.length > 0 && (
            <View className="bg-red-50 rounded-xl p-4 mb-3 border border-red-200">
              <View className="flex-row items-center mb-2">
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#ef4444" />
                <Text className="font-semibold text-red-900 ml-2">Allergens</Text>
              </View>
              <Text className="text-red-700">{product.allergens.join(', ')}</Text>
            </View>
          )}

          {product.preparationTime && (
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center">
                <IconSymbol name="clock.fill" size={16} color="#6b7280" />
                <Text className="font-semibold text-gray-900 ml-2">Preparation Time</Text>
              </View>
              <Text className="text-gray-700 mt-2">Approximately {product.preparationTime} minutes</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="border-t border-gray-200 bg-white p-4 shadow-lg">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm text-gray-600 mb-1">Quantity</Text>
            <View className="flex-row items-center bg-gray-100 rounded-2xl p-1">
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl bg-white items-center justify-center shadow-sm">
                <IconSymbol name="minus" size={16} color="#666" />
              </Pressable>
              <Text className="mx-4 font-bold text-lg min-w-8 text-center">{quantity}</Text>
              <Pressable
                onPress={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl bg-blue-600 items-center justify-center shadow-sm">
                <IconSymbol name="plus" size={16} color="white" />
              </Pressable>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-sm text-gray-600 mb-1">Total</Text>
            <Text className="text-2xl font-bold text-blue-600">
              {formatCurrency(product.price * quantity)}
            </Text>
          </View>
        </View>

        <Button
          onPress={() => {
            addItem(product, quantity, selectedCustomizations);
            router.push('/cart');
          }}
          className="w-full h-14 rounded-2xl shadow-lg"
          disabled={!product.isAvailable}>
          <View className="flex-row items-center justify-center">
            <IconSymbol 
              name={product.isAvailable ? "cart.fill.badge.plus" : "exclamationmark.triangle.fill"} 
              size={20} 
              color="white" 
            />
            <Text className="text-white font-bold text-lg ml-2">
              {product.isAvailable
                ? `Add to Cart`
                : 'Out of Stock'}
            </Text>
          </View>
        </Button>

        {product.isAvailable && (
          <Text className="text-center text-gray-500 text-xs mt-3">
            Free cancellation within 5 minutes of placing order
          </Text>
        )}
      </View>
    </View>
  );
}

