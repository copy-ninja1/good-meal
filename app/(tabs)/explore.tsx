import { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, Pressable, TextInput, FlatList, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { useSearch } from '@/lib/hooks/use-search';
import { useVendors } from '@/lib/hooks/use-vendors';
import { useCategories } from '@/lib/hooks/use-categories';
import { useAtom } from 'jotai';
import { searchQueryAtom, filtersAtom, sortAtom } from '@/lib/atoms/filters';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/skeleton';
import { debounce, formatCurrency } from '@/lib/utils';
import type { Vendor, Product, Category } from '../../types';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; featured?: string; sort?: string }>();
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [filters, setFilters] = useAtom(filtersAtom);
  const [sort, setSort] = useAtom(sortAtom);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(params.category || 'all');

  const { data: categories } = useCategories();
  const { data: allVendors, isLoading: loadingVendors } = useVendors({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    featured: params.featured === 'true' ? true : undefined,
    sort: params.sort as any,
  });

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    }
    if (params.sort) {
      setSort(params.sort as any);
    }
  }, [params, setSort]);

  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 500),
    [setSearchQuery]
  );

  const { data: searchResults, isLoading: searchLoading } = useSearch(searchQuery, filters);

  const displayResults = useMemo(() => {
    if (searchQuery && searchResults) {
      // Show search results
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

      return { vendors, products, isSearch: true };
    } else {
      // Show category/browse results
      let vendors = [...(allVendors || [])];

      switch (sort) {
        case 'rating':
          vendors.sort((a, b) => b.rating - a.rating);
          break;
        case 'deliveryTime':
          vendors.sort((a, b) => a.deliveryTime - b.deliveryTime);
          break;
        case 'distance':
          vendors.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          break;
      }

      return { vendors, products: [], isSearch: false };
    }
  }, [searchResults, allVendors, sort, searchQuery]);

  const VendorCard = ({ vendor }: { vendor: Vendor }) => (
    <Pressable
      onPress={() => router.push(`/vendor/${vendor.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-md mb-4"
    >
      <Image
        source={{ uri: vendor.coverImage || vendor.logo }}
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="font-bold text-lg mb-1">{vendor.name}</Text>
            <Text className="text-gray-600 text-sm" numberOfLines={2}>
              {vendor.description}
            </Text>
          </View>
          {!vendor.isOpen && (
            <View className="bg-red-100 px-2 py-1 rounded-full">
              <Text className="text-red-600 text-xs font-medium">Closed</Text>
            </View>
          )}
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <IconSymbol name="star.fill" size={14} color="#fbbf24" />
            <Text className="text-sm ml-1 font-medium">{vendor.rating}</Text>
            <Text className="text-xs text-gray-500 ml-1">
              ({vendor.reviewCount})
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <IconSymbol name="clock.fill" size={14} color="#666" />
            <Text className="text-xs text-gray-600 ml-1">
              {vendor.deliveryTime} min
            </Text>
            <Text className="text-xs text-gray-600 mx-2">•</Text>
            <Text className="text-xs text-gray-600">
              {formatCurrency(vendor.deliveryFee)} delivery
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap mt-2">
          {vendor.cuisine.slice(0, 3).map((c) => (
            <View key={c} className="bg-blue-50 rounded-full px-2 py-1 mr-2 mb-1">
              <Text className="text-blue-700 text-xs font-medium">{c}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      className="flex-row bg-white rounded-xl p-3 mb-3 shadow-sm"
    >
      <Image
        source={{ uri: product.images[0] }}
        className="w-20 h-20 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-base mb-1">{product.name}</Text>
        <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
          {product.description}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-blue-600 font-bold">
            {formatCurrency(product.price)}
          </Text>
          <View className="flex-row items-center">
            <IconSymbol name="star.fill" size={12} color="#fbbf24" />
            <Text className="text-xs ml-1">{product.rating}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const isLoading = searchQuery ? searchLoading : loadingVendors;

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center mb-3">
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
            <IconSymbol name="slider.horizontal.3" size={24} color="#666" />
          </Pressable>
        </View>

        {/* Category Filter */}
        {!searchQuery && categories && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              onPress={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedCategory === 'all' ? 'bg-blue-600' : 'bg-gray-100'
              }`}
            >
              <Text className={selectedCategory === 'all' ? 'text-white font-semibold' : 'text-gray-700'}>
                All
              </Text>
            </Pressable>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedCategory === category.id ? 'bg-blue-600' : 'bg-gray-100'
                }`}
              >
                <Text className={selectedCategory === category.id ? 'text-white font-semibold' : 'text-gray-700'}>
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="px-4 py-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <Skeleton className="w-full h-32 rounded-xl mb-3" />
              <Skeleton className="w-3/4 h-4 mb-2" />
              <Skeleton className="w-1/2 h-3" />
            </View>
          ))}
        </View>
      ) : displayResults.isSearch && searchQuery ? (
        <ScrollView className="flex-1 px-4 py-4">
          {displayResults.vendors.length > 0 && (
            <View className="mb-6">
              <Text className="font-bold text-xl mb-4">Vendors</Text>
              {displayResults.vendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </View>
          )}

          {displayResults.products.length > 0 && (
            <View>
              <Text className="font-bold text-xl mb-4">Dishes</Text>
              {displayResults.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}

          {displayResults.vendors.length === 0 && displayResults.products.length === 0 && (
            <View className="flex-1 items-center justify-center py-20">
              <IconSymbol name="magnifyingglass" size={64} color="#ccc" />
              <Text className="text-gray-500 mt-4 text-center text-lg">No results found</Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Try adjusting your search terms or filters
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {displayResults.vendors.length > 0 ? (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="font-bold text-xl">
                  {selectedCategory === 'all' ? 'All Vendors' : 
                   categories?.find(c => c.id === selectedCategory)?.name || 'Vendors'}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {displayResults.vendors.length} {displayResults.vendors.length === 1 ? 'vendor' : 'vendors'}
                </Text>
              </View>
              {displayResults.vendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </View>
          ) : searchQuery ? (
            <View className="flex-1 items-center justify-center py-20">
              <IconSymbol name="magnifyingglass" size={64} color="#ccc" />
              <Text className="text-gray-500 mt-4 text-center text-lg">No results found</Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Try adjusting your search terms
              </Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <IconSymbol name="magnifyingglass" size={64} color="#ccc" />
              <Text className="text-gray-500 mt-4 text-center text-lg">
                Search for your favorite food
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Or browse vendors by category above
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Filters Bottom Sheet */}
      <BottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter & Sort">
        <View className="p-4">
          <Text className="font-semibold text-lg mb-3">Sort By</Text>
          {[
            { key: 'relevance', label: 'Relevance' },
            { key: 'rating', label: 'Rating' },
            { key: 'deliveryTime', label: 'Delivery Time' },
            { key: 'distance', label: 'Distance' },
            ...(displayResults.isSearch ? [
              { key: 'priceLow', label: 'Price: Low to High' },
              { key: 'priceHigh', label: 'Price: High to Low' }
            ] : [])
          ].map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => {
                setSort(key as any);
                setShowFilters(false);
              }}
              className="flex-row items-center py-3 border-b border-gray-100">
              <View className="w-6 h-6 rounded-full border-2 border-gray-300 items-center justify-center mr-3">
                {sort === key && (
                  <View className="w-3 h-3 rounded-full bg-blue-600" />
                )}
              </View>
              <Text className={`flex-1 ${sort === key ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

