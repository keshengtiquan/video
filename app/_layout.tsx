import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PlaySourceProvider } from "@/context/PlaySourceContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PlaySourceProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="search-result" options={{ headerShown: false }} />
          <Stack.Screen name="play" options={{ headerShown: false }} />
        </Stack>
      </PlaySourceProvider>
    </SafeAreaProvider>
  );
}
