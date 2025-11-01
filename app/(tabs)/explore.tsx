import { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, TextInput, FlatList, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useSearch } from '@/lib/hooks/use-search';
import { useCategories } from '@/lib/hooks/use-categories';
import { useVendors } from '@/lib/hooks/use-vendors';
import { useCart } from '@/lib/hooks/use-cart';
import { useAtom } from 'jotai';
import { searchQueryAtom, filtersAtom, sortAtom } from '@/lib/atoms/filters';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/skeleton';
import { debounce, formatCurrency } from '@/lib/utils';
import type { Vendor, Product, Category } from '../../types';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2;

const CategoryCard = ({ item, onPress }: { item: Category; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    className="items-center justify-center bg-white rounded-xl p-4 shadow-sm"
    style={{ width: CARD_WIDTH }}>
    {item.icon ? (
      <Text className="text-4xl mb-2">{item.icon}</Text>
    ) : (
      <IconSymbol name="square.grid.2x2" size={40} color="#3b82f6" />
    )}
    <Text className="font-medium text-center" numberOfLines={2}>
      {item.name}
    </Text>
  </Pressable>
);

const VendorCard = ({ item }: { item: Vendor }) => (
  <Pressable
    onPress={() => router.push(`/vendor/${item.id}`)}
    className="bg-white rounded-xl overflow-hidden shadow-sm mb-3">
    <Image
      source={{ uri: item.coverImage || item.logo }}
      className="w-full h-32"
      resizeMode="cover"
    />
    <View className="p-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="font-bold flex-1" numberOfLines={1}>{item.name}</Text>
        <View className="flex-row items-center">
          <IconSymbol name="star.fill" size={12} color="#fbbf24" />
          <Text className="text-sm ml-1">{item.rating}</Text>
        </View>
      </View>
      <Text className="text-gray-600 text-sm mb-2" numberOfLines={1}>
        {item.cuisine.join(' • ')}
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <IconSymbol name="clock.fill" size={12} color="#666" />
          <Text className="text-xs text-gray-600 ml-1">{item.deliveryTime} min</Text>
        </View>
        <Text className="text-xs text-gray-600">
          {formatCurrency(item.deliveryFee)} delivery
        </Text>
      </View>
    </View>
  </Pressable>
);

const ProductCard = ({ item }: { item: Product }) => {
  const { addItem } = useCart();
  
  return (
    <Pressable
      onPress={() => router.push(`/product/${item.id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-sm"
      style={{ width: CARD_WIDTH }}>
      <Image
        source={{ uri: item.images[0] }}
        className="w-full h-28"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="font-semibold mb-1" numberOfLines={2}>{item.name}</Text>
        <View className="flex-row items-center mb-2">
          <IconSymbol name="star.fill" size={12} color="#fbbf24" />
          <Text className="text-xs ml-1">{item.rating}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-blue-600 font-bold">{formatCurrency(item.price)}</Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              addItem(item, 1, {});
            }}
            className="bg-blue-600 rounded-full p-1">
            <IconSymbol name="plus" size={16} color="white" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [filters, setFilters] = useAtom(filtersAtom);
  const [sort, setSort] = useAtom(sortAtom);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'vendors' | 'products'>('all');

  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 500),
    [setSearchQuery]
  );

  const { data: searchResults, isLoading: searchLoading } = useSearch(searchQuery, filters);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: featuredVendors, isLoading: vendorsLoading } = useVendors({ featured: true, limit: 6 });

  const sortedResults = useMemo(() => {
    if (!searchResults) return { vendors: [], products: [] };

    let vendors = [...searchResults.vendors];
    let products = [...searchResults.products];

    switch (sort) {
      case 'rating':
        vendors.sort((a, b) => b.rating - a.rating);
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        vendors.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'deliveryTime':
        vendors.sort((a, b) => a.deliveryTime - b.deliveryTime);
        break;
      case 'priceLow':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        products.sort((a, b) => b.price - a.price);
        break;
    }

    return { vendors, products };
  }, [searchResults, sort]);

  const hasActiveFilters = Object.keys(filters).length > 0 && Object.values(filters).some(v => 
    Array.isArray(v) ? v.length > 0 : v !== undefined
  );

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const renderEmptyState = () => (
    <ScrollView className="flex-1">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold mb-2">What are you craving?</Text>
        <Text className="text-gray-600 mb-6">Discover restaurants and dishes around you</Text>

        <Text className="text-lg font-semibold mb-4">Browse by category</Text>
        <View className="flex-row flex-wrap justify-between">
          {categoriesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="rounded-xl mb-3" style={{ width: CARD_WIDTH, height: 100 }} />
            ))
          ) : (
            categories?.slice(0, 6).map((category) => (
              <CategoryCard 
                key={category.id} 
                item={category} 
                onPress={() => {
                  setFilters({ ...filters, categories: [category.id] });
                  setSearchQuery(category.name);
                }}
              />
            ))
          )}
        </View>

        <Text className="text-lg font-semibold mb-4 mt-6">Featured vendors</Text>
        {vendorsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-48 rounded-xl mb-3" />
          ))
        ) : (
          featuredVendors?.map((vendor) => (
            <VendorCard key={vendor.id} item={vendor} />
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <View className="flex-1 px-4 py-6">
          <View className="flex-row justify-center space-x-4 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-8 rounded-full" />
            ))}
          </View>
          <View className="flex-row flex-wrap justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="rounded-xl mb-3" style={{ width: CARD_WIDTH, height: 180 }} />
            ))}
          </View>
        </View>
      );
    }

    if (!sortedResults.vendors.length && !sortedResults.products.length) {
      return (
        <View className="flex-1 items-center justify-center px-4">
          <IconSymbol name="magnifyingglass" size={48} color="#ccc" />
          <Text className="text-xl font-semibold mt-4 text-center">No results found</Text>
          <Text className="text-gray-500 text-center mt-2">
            Try adjusting your search or filters
          </Text>
          {hasActiveFilters && (
            <Button onPress={clearFilters} variant="outline" className="mt-4">
              Clear filters
            </Button>
          )}
        </View>
      );
    }

    const allResults = [
      ...sortedResults.vendors.map(v => ({ ...v, type: 'vendor' as const })),
      ...sortedResults.products.map(p => ({ ...p, type: 'product' as const }))
    ];

    const filteredResults = activeTab === 'all' ? allResults :
      activeTab === 'vendors' ? sortedResults.vendors.map(v => ({ ...v, type: 'vendor' as const })) :
      sortedResults.products.map(p => ({ ...p, type: 'product' as const }));

    return (
      <ScrollView className="flex-1">
        <View className="px-4 py-3 border-b border-gray-200 bg-white">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {[
                { key: 'all', label: 'All', count: allResults.length },
                { key: 'vendors', label: 'Vendors', count: sortedResults.vendors.length },
                { key: 'products', label: 'Dishes', count: sortedResults.products.length }
              ].map(({ key, label, count }) => (
                <Pressable
                  key={key}
                  onPress={() => setActiveTab(key as any)}
                  className={`px-4 py-2 rounded-full ${
                    activeTab === key ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                  <Text className={`font-medium ${
                    activeTab === key ? 'text-white' : 'text-gray-700'
                  }`}>
                    {label} ({count})
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="px-4 py-4">
          <View className="flex-row flex-wrap justify-between">
            {filteredResults.map((item, index) => (
              <View key={`${item.type}-${item.id}`} className="mb-3" style={{ width: item.type === 'vendor' ? '100%' : CARD_WIDTH }}>
                {item.type === 'vendor' ? (
                  <VendorCard item={item} />
                ) : (
                  <ProductCard item={item} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Search Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center space-x-3">
          <View className="flex-1">
            <Input
              placeholder="Search vendors, dishes..."
              defaultValue={searchQuery}
              onChangeText={debouncedSearch}
              startContent={<IconSymbol name="magnifyingglass" size={20} color="#666" />}
              variant="bordered"
              className="flex-1"
            />
          </View>
          <Pressable 
            onPress={() => setShowFilters(true)}
            className={`p-2 rounded-lg ${hasActiveFilters ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <IconSymbol name="slider.horizontal.3" size={24} color={hasActiveFilters ? "#3b82f6" : "#666"} />
          </Pressable>
        </View>
      </View>

      {searchQuery ? renderSearchResults() : renderEmptyState()}

      {/* Filters Bottom Sheet */}
      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filters & Sort">
        <View className="p-4">
          <Text className="font-semibold text-lg mb-4">Sort By</Text>
          {[
            { key: 'relevance', label: 'Relevance' },
            { key: 'rating', label: 'Rating' },
            { key: 'distance', label: 'Distance' },
            { key: 'deliveryTime', label: 'Delivery Time' },
            { key: 'priceLow', label: 'Price: Low to High' },
            { key: 'priceHigh', label: 'Price: High to Low' }
          ].map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setSort(key as any)}
              className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className={`text-base ${sort === key ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                {label}
              </Text>
              {sort === key && <IconSymbol name="checkmark" size={20} color="#3b82f6" />}
            </Pressable>
          ))}

          <View className="flex-row space-x-3 mt-6">
            {hasActiveFilters && (
              <Button variant="outline" onPress={clearFilters} className="flex-1">
                Clear All
              </Button>
            )}
            <Button onPress={() => setShowFilters(false)} className="flex-1">
              Apply
            </Button>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

