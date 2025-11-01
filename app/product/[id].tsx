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

        <View className="px-4 py-4 bg-white">
          <Text className="text-2xl font-bold mb-2">{product.name}</Text>
          <View className="flex-row items-center mb-2">
            <IconSymbol name="star.fill" size={16} color="#fbbf24" />
            <Text className="ml-1 font-semibold">{product.rating}</Text>
            <Text className="text-gray-600 ml-2">({product.reviewCount} reviews)</Text>
          </View>
          <Text className="text-3xl font-bold text-blue-600 mb-2">
            {formatCurrency(product.price)}
          </Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text className="text-gray-500 line-through text-lg">
              {formatCurrency(product.originalPrice)}
            </Text>
          )}
          <Text className="text-gray-700 mt-3">{product.description}</Text>
        </View>

        {product.customizations && product.customizations.length > 0 && (
          <View className="px-4 py-4 bg-white border-t border-gray-200">
            {product.customizations.map((customization) => (
              <View key={customization.id} className="mb-4">
                <Text className="font-semibold mb-2">
                  {customization.name} {customization.required && <Text className="text-red-600">*</Text>}
                </Text>
                {customization.options.map((option) => {
                  const isSelected = selectedCustomizations[customization.id]?.includes(option.id);
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => toggleCustomization(customization.id, option.id)}
                      className={`flex-row items-center justify-between p-3 mb-2 rounded-lg border ${
                        isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}>
                      <Text className={isSelected ? 'font-semibold' : ''}>{option.name}</Text>
                      {option.price > 0 && (
                        <Text className="text-blue-600 font-semibold">
                          +{formatCurrency(option.price)}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {product.calories && (
          <View className="px-4 py-4 bg-white border-t border-gray-200">
            <Text className="font-semibold mb-2">Nutritional Info</Text>
            <Text className="text-gray-700">{product.calories} calories</Text>
          </View>
        )}

        {product.allergens && product.allergens.length > 0 && (
          <View className="px-4 py-4 bg-white border-t border-gray-200">
            <Text className="font-semibold mb-2">Allergens</Text>
            <Text className="text-gray-700">{product.allergens.join(', ')}</Text>
          </View>
        )}
      </ScrollView>

      <View className="border-t border-gray-200 bg-white p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
              <IconSymbol name="minus" size={20} color="#666" />
            </Pressable>
            <Text className="mx-4 font-bold text-lg">{quantity}</Text>
            <Pressable
              onPress={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center">
              <IconSymbol name="plus" size={20} color="white" />
            </Pressable>
          </View>
        </View>
        <Button
          onPress={() => {
            addItem(product, quantity, selectedCustomizations);
            router.push('/cart');
          }}
          className="w-full"
          disabled={!product.isAvailable}>
          {product.isAvailable
            ? `Add to Cart • ${formatCurrency(product.price * quantity)}`
            : 'Out of Stock'}
        </Button>
      </View>
    </View>
  );
}

