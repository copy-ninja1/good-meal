import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Provider as JotaiProvider } from "jotai";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import "react-native-reanimated";

import { initAuthAtom, initCartAtom, initThemeAtom } from "@/lib/atoms";
import { useSetAtom } from "jotai";

export const unstable_settings = {
  anchor: "(tabs)",
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

function AppProviders() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, title: "Checkout" }} />
        <Stack.Screen name="addresses" options={{ headerShown: false, title: "Addresses" }} />
        <Stack.Screen name="payments" options={{ headerShown: false, title: "Payment Methods" }} />
        <Stack.Screen name="orders" options={{ headerShown: false, title: "Orders" }} />
        <Stack.Screen name="settings" options={{ headerShown: false, title: "Settings" }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false, title: "Product" }} />
        <Stack.Screen name="vendor/[id]" options={{ headerShown: false, title: "Vendor" }} />
        <Stack.Screen name="order/[id]" options={{ headerShown: false, title: "Order Details" }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

function InitAtoms() {
  const initAuth = useSetAtom(initAuthAtom);
  const initCart = useSetAtom(initCartAtom);
  const initTheme = useSetAtom(initThemeAtom);

  useEffect(() => {
    initAuth();
    initCart();
    initTheme();
  }, [initAuth, initCart, initTheme]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <InitAtoms />
        <AppProviders />
      </JotaiProvider>
    </QueryClientProvider>
  );
}
