import { useState } from 'react';
import { View, ScrollView, Pressable, FlatList, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useVendor } from '@/lib/hooks/use-vendors';
import { useProducts } from '@/lib/hooks/use-products';
import { useCart } from '@/lib/hooks/use-cart';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export default function VendorDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: vendor, isLoading } = useVendor(id || '');
  const { data: products } = useProducts(id);
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(products?.map(p => p.category) || []));

  const filteredProducts = products?.filter(p =>
    selectedCategory === 'all' ? true : p.category === selectedCategory
  );

  if (isLoading) {
    return (
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <Skeleton className="w-full h-64" />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Vendor not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1">
        <View className="relative">
          <Image
            source={{ uri: vendor.coverImage || vendor.logo }}
            className="w-full h-64"
            contentFit="cover"
          />
          <Pressable
            onPress={() => router.back()}
            className="absolute top-12 left-4 bg-white/90 rounded-full p-2">
            <IconSymbol name="arrow.back" size={24} color="#000" />
          </Pressable>
        </View>

        <View className="px-4 py-4 bg-white">
          <Text className="text-2xl font-bold mb-2">{vendor.name}</Text>
          <View className="flex-row items-center mb-2">
            <IconSymbol name="star.fill" size={16} color="#fbbf24" />
            <Text className="ml-1 font-semibold">{vendor.rating}</Text>
            <Text className="text-gray-600 ml-2">({vendor.reviewCount} reviews)</Text>
          </View>
          <Text className="text-gray-700 mb-2">{vendor.description}</Text>

          <View className="flex-row items-center mt-2">
            <IconSymbol name="clock.fill" size={16} color="#666" />
            <Text className="ml-1">{vendor.deliveryTime} min</Text>
            <Text className="mx-2">•</Text>
            <IconSymbol name="tag.fill" size={16} color="#666" />
            <Text className="ml-1">{formatCurrency(vendor.deliveryFee)} delivery</Text>
          </View>

          <View className="flex-row flex-wrap mt-3">
            {vendor.cuisine.map((c) => (
              <View key={c} className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-blue-800 text-xs font-medium">{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {categories.length > 0 && (
          <View className="px-4 py-3 bg-gray-50">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                onPress={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedCategory === 'all' ? 'bg-blue-600' : 'bg-white'
                }`}>
                <Text className={selectedCategory === 'all' ? 'text-white font-semibold' : 'text-gray-700'}>
                  All
                </Text>
              </Pressable>
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    selectedCategory === cat ? 'bg-blue-600' : 'bg-white'
                  }`}>
                  <Text className={selectedCategory === cat ? 'text-white font-semibold' : 'text-gray-700'}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View className="px-4 py-4">
          {filteredProducts?.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => router.push(`/product/${product.id}`)}
              className="flex-row bg-white rounded-xl p-3 mb-3 shadow-sm">
              <Image
                source={{ uri: product.images[0] }}
                className="w-24 h-24 rounded-lg"
                contentFit="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-base mb-1">{product.name}</Text>
                <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                  {product.description}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-blue-600 font-bold">{formatCurrency(product.price)}</Text>
                  <Button
                    size="sm"
                    onPress={(e) => {
                      e.stopPropagation();
                      addItem(product, 1, {});
                    }}>
                    Add
                  </Button>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

