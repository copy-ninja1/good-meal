import { useState } from 'react';
import { View, ScrollView, Pressable, FlatList, Image, Dimensions } from 'react-native';
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

const { width: screenWidth } = Dimensions.get('window');

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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: vendor.coverImage || vendor.logo }}
            className="w-full h-72"
            resizeMode="cover"
          />
          {/* Gradient Overlay */}
          <View className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
          
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="absolute top-12 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <IconSymbol name="chevron.left" size={20} color="#000" />
          </Pressable>

          {/* Vendor Status */}
          <View className="absolute top-12 right-4">
            <View className={`px-3 py-2 rounded-full ${
              vendor.isOpen ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <Text className="text-white text-sm font-semibold">
                {vendor.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          {/* Vendor Logo */}
          <View className="absolute -bottom-8 left-4">
            <Image
              source={{ uri: vendor.logo }}
              className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Vendor Info */}
        <View className="px-4 pt-12 pb-6 bg-white">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl font-bold mr-2">{vendor.name}</Text>
                {vendor.isVerified && (
                  <IconSymbol name="checkmark.seal.fill" size={20} color="#3b82f6" />
                )}
              </View>
              
              <View className="flex-row items-center mb-2">
                <IconSymbol name="star.fill" size={16} color="#fbbf24" />
                <Text className="ml-1 font-semibold text-lg">{vendor.rating}</Text>
                <Text className="text-gray-600 ml-2">({vendor.reviewCount} reviews)</Text>
                <Pressable className="ml-2">
                  <Text className="text-blue-600 text-sm">See reviews</Text>
                </Pressable>
              </View>
              
              <Text className="text-gray-700 text-base leading-6 mb-4">
                {vendor.description}
              </Text>
            </View>
          </View>

          {/* Quick Info Cards */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center mb-1">
                <IconSymbol name="clock.fill" size={16} color="#f97316" />
                <Text className="ml-2 text-orange-600 font-semibold">Delivery</Text>
              </View>
              <Text className="text-gray-900 font-bold">{vendor.deliveryTime} min</Text>
            </View>
            
            <View className="flex-1 bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center mb-1">
                <IconSymbol name="banknote" size={16} color="#10b981" />
                <Text className="ml-2 text-emerald-600 font-semibold">Delivery Fee</Text>
              </View>
              <Text className="text-gray-900 font-bold">{formatCurrency(vendor.deliveryFee)}</Text>
            </View>
            
            <View className="flex-1 bg-gray-50 rounded-xl p-3">
              <View className="flex-row items-center mb-1">
                <IconSymbol name="dollarsign.circle" size={16} color="#8b5cf6" />
                <Text className="ml-2 text-purple-600 font-semibold">Min Order</Text>
              </View>
              <Text className="text-gray-900 font-bold">{formatCurrency(vendor.minOrder)}</Text>
            </View>
          </View>

          {/* Address */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-start">
              <IconSymbol name="location.fill" size={16} color="#6b7280" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-gray-900 mb-1">Address</Text>
                <Text className="text-gray-600">{vendor.address}</Text>
              </View>
              <Pressable className="bg-blue-600 px-3 py-1 rounded-lg">
                <Text className="text-white text-sm font-medium">Directions</Text>
              </Pressable>
            </View>
          </View>

          {/* Cuisine Tags */}
          <View className="flex-row flex-wrap mb-6">
            {vendor.cuisine.map((c) => (
              <View key={c} className="bg-blue-100 rounded-full px-4 py-2 mr-2 mb-2">
                <Text className="text-blue-800 text-sm font-medium">{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Filter */}
        {categories.length > 0 && (
          <View className="px-4 py-4 bg-white border-t border-gray-100">
            <Text className="text-lg font-bold mb-3">Menu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setSelectedCategory('all')}
                  className={`px-5 py-3 rounded-full border-2 ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                  <Text className={`font-semibold ${
                    selectedCategory === 'all' ? 'text-white' : 'text-gray-700'
                  }`}>
                    All Items
                  </Text>
                </Pressable>
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`px-5 py-3 rounded-full border-2 capitalize ${
                      selectedCategory === cat 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-gray-200'
                    }`}>
                    <Text className={`font-semibold ${
                      selectedCategory === cat ? 'text-white' : 'text-gray-700'
                    }`}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Menu Items */}
        <View className="px-4 py-4 bg-gray-50">
          {filteredProducts?.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => router.push(`/product/${product.id}`)}
              className="flex-row bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
              <View className="flex-1 pr-4">
                <Text className="font-bold text-lg mb-2">{product.name}</Text>
                <Text className="text-gray-600 text-sm mb-3 leading-5" numberOfLines={2}>
                  {product.description}
                </Text>
                
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-blue-600 font-bold text-lg">
                      {formatCurrency(product.price)}
                    </Text>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <Text className="text-gray-400 line-through text-sm">
                        {formatCurrency(product.originalPrice)}
                      </Text>
                    )}
                  </View>
                  
                  <View className="flex-row items-center">
                    <IconSymbol name="star.fill" size={12} color="#fbbf24" />
                    <Text className="text-xs text-gray-600 ml-1">{product.rating}</Text>
                  </View>
                </View>

                <Button
                  size="sm"
                  className="mt-3 self-start"
                  onPress={(e) => {
                    e.stopPropagation();
                    addItem(product, 1, {});
                  }}>
                  <IconSymbol name="plus" size={14} color="white" />
                  <Text className="text-white ml-1 font-semibold">Add</Text>
                </Button>
              </View>
              
              <Image
                source={{ uri: product.images[0] }}
                className="w-28 h-28 rounded-xl"
                resizeMode="cover"
              />
            </Pressable>
          ))}

          {filteredProducts?.length === 0 && (
            <View className="items-center py-12">
              <IconSymbol name="fork.knife" size={48} color="#ccc" />
              <Text className="text-gray-500 text-lg mt-4">No items in this category</Text>
              <Text className="text-gray-400 text-sm mt-2">Try selecting a different category</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

