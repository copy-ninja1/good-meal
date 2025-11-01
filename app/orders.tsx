import { useState } from 'react';
import { View, ScrollView, Pressable, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useOrders } from '@/lib/hooks/use-orders';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { Order, OrderStatus } from '../types';

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'preparing':
      return 'bg-orange-100 text-orange-800';
    case 'ready':
      return 'bg-purple-100 text-purple-800';
    case 'on_the_way':
      return 'bg-indigo-100 text-indigo-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready';
    case 'on_the_way':
      return 'On the way';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const { data: orders, isLoading, refetch } = useOrders();

  const activeOrders = orders?.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way'].includes(order.status)
  ) || [];

  const pastOrders = orders?.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  ) || [];

  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const OrderCard = ({ order }: { order: Order }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="font-bold text-lg mb-1">{order.vendor.name}</Text>
          <Text className="text-gray-600 text-sm">
            Order #{order.id.slice(-8).toUpperCase()}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
          <Text className="font-medium text-xs">{getStatusLabel(order.status)}</Text>
        </View>
      </View>

      <View className="border-t border-gray-100 pt-3 mb-3">
        <View className="flex-row items-center mb-2">
          <Image
            source={{ uri: order.items[0].product.images[0] }}
            className="w-10 h-10 rounded-lg"
            resizeMode="cover"
          />
          <View className="flex-1 ml-3">
            <Text className="font-medium text-sm">{order.items[0].product.name}</Text>
            {order.items.length > 1 && (
              <Text className="text-gray-500 text-xs">
                +{order.items.length - 1} more {order.items.length - 1 === 1 ? 'item' : 'items'}
              </Text>
            )}
          </View>
          <Text className="font-bold text-blue-600">
            {formatCurrency(order.total)}
          </Text>
        </View>
      </div>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <IconSymbol name="location.fill" size={14} color="#666" />
          <Text className="text-gray-600 text-sm ml-1" numberOfLines={1}>
            {order.address.street}, {order.address.city}
          </Text>
        </View>
        
        <View className="flex-row gap-2">
          {activeTab === 'active' && order.status !== 'cancelled' && (
            <Button size="sm" variant="outline">
              Track Order
            </Button>
          )}
          {activeTab === 'past' && order.status === 'delivered' && !order.rating && (
            <Button size="sm">
              Rate Order
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onPress={() => router.push(`/order/${order.id}`)}
          >
            View Details
          </Button>
        </View>
      </View>

      {activeTab === 'active' && order.estimatedDeliveryTime && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <IconSymbol name="clock.fill" size={14} color="#f97316" />
            <Text className="text-orange-600 text-sm font-medium ml-1">
              Estimated delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold">My Orders</Text>
          <Pressable onPress={() => router.back()}>
            <IconSymbol name="xmark" size={24} color="#666" />
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <Pressable
            onPress={() => setActiveTab('active')}
            className={`flex-1 py-2 rounded-md items-center ${
              activeTab === 'active' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`font-medium ${
              activeTab === 'active' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Active ({activeOrders.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('past')}
            className={`flex-1 py-2 rounded-md items-center ${
              activeTab === 'past' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`font-medium ${
              activeTab === 'past' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Past ({pastOrders.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="px-4 py-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="bg-white rounded-2xl p-4 mb-4">
              <View className="flex-row justify-between mb-3">
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-20 h-6 rounded-full" />
              </View>
              <Skeleton className="w-24 h-4 mb-2" />
              <Skeleton className="w-full h-12" />
            </View>
          ))}
        </View>
      ) : displayOrders.length > 0 ? (
        <ScrollView 
          className="flex-1 px-4 py-4"
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
          {displayOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-4">
          <IconSymbol 
            name={activeTab === 'active' ? 'clock.fill' : 'checkmark.circle.fill'} 
            size={64} 
            color="#ccc" 
          />
          <Text className="text-xl font-bold mt-4 text-center">
            {activeTab === 'active' ? 'No active orders' : 'No past orders'}
          </Text>
          <Text className="text-gray-500 text-center mt-2 mb-8">
            {activeTab === 'active' 
              ? 'When you place an order, it will appear here'
              : 'Your completed orders will show up here'
            }
          </Text>
          <Button onPress={() => router.push('/index')}>
            Browse Vendors
          </Button>
        </View>
      )}
    </View>
  );
}