import { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, TextInput, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSearch } from '@/lib/hooks/use-search';
import { useAtom } from 'jotai';
import { searchQueryAtom, filtersAtom, sortAtom } from '@/lib/atoms/filters';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { debounce } from '@/lib/utils';
import type { Vendor, Product } from '../../types';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [filters, setFilters] = useAtom(filtersAtom);
  const [sort, setSort] = useAtom(sortAtom);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 500),
    [setSearchQuery]
  );

  const { data: searchResults, isLoading } = useSearch(searchQuery, filters);

  const sortedResults = useMemo(() => {
    if (!searchResults) return { vendors: [], products: [] };

    let vendors = [...searchResults.vendors];
    let products = [...searchResults.products];

    switch (sort) {
      case 'rating':
        vendors.sort((a, b) => b.rating - a.rating);
        products.sort((a, b) => b.rating - a.rating);
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

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <IconSymbol name="magnifyingglass" size={20} color="#666" />
            <TextInput
              placeholder="Search vendors, dishes..."
              className="flex-1 ml-2"
              defaultValue={searchQuery}
              onChangeText={debouncedSearch}
            />
          </View>
          <Pressable onPress={() => setShowFilters(true)} className="ml-2">
            <IconSymbol name="gear.fill" size={24} color="#666" />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text>Searching...</Text>
        </View>
      ) : searchQuery && sortedResults && (sortedResults.vendors.length > 0 || sortedResults.products.length > 0) ? (
        <ScrollView className="flex-1">
          {sortedResults.vendors.length > 0 && (
            <View className="px-4 py-2">
              <Text className="font-bold text-lg mb-2">Vendors</Text>
              {sortedResults.vendors.map((vendor) => (
                <Pressable
                  key={vendor.id}
                  className="flex-row items-center bg-white rounded-xl p-3 mb-2 shadow-sm">
                  <Text className="text-2xl mr-3">{vendor.rating}⭐</Text>
                  <View className="flex-1">
                    <Text className="font-semibold">{vendor.name}</Text>
                    <Text className="text-gray-600 text-sm">{vendor.description}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {sortedResults.products.length > 0 && (
            <View className="px-4 py-2">
              <Text className="font-bold text-lg mb-2">Dishes</Text>
              {sortedResults.products.map((product) => (
                <Pressable
                  key={product.id}
                  className="flex-row items-center bg-white rounded-xl p-3 mb-2 shadow-sm">
                  <View className="flex-1">
                    <Text className="font-semibold">{product.name}</Text>
                    <Text className="text-blue-600 font-bold">${product.price.toFixed(2)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      ) : searchQuery ? (
        <View className="flex-1 items-center justify-center px-4">
          <IconSymbol name="magnifyingglass" size={48} color="#ccc" />
          <Text className="text-gray-500 mt-4 text-center">No results found</Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <IconSymbol name="magnifyingglass" size={48} color="#ccc" />
          <Text className="text-gray-500 mt-4 text-center">Search for your favorite food</Text>
        </View>
      )}

      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Results">
        <View className="p-4">
          <Text className="font-semibold mb-2">Sort By</Text>
          {['relevance', 'rating', 'priceLow', 'priceHigh'].map((option) => (
            <Pressable
              key={option}
              onPress={() => setSort(option as any)}
              className="flex-row items-center py-2">
              {sort === option && <IconSymbol name="checkmark" size={20} color="#3b82f6" />}
              <Text className={`ml-2 ${sort === option ? 'font-bold' : ''}`}>
                {option === 'priceLow' ? 'Price: Low to High' :
                 option === 'priceHigh' ? 'Price: High to Low' :
                 option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

