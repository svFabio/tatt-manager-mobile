import "../global.css";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as ReactNative from "react-native";
import { Platform } from "react-native";
import * as SystemUI from "expo-system-ui";
import * as NavigationBar from "expo-navigation-bar";
import { useWebSocket } from "@/src/hooks/useWebSocket";
import { COLORS } from "@/src/theme/colors";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import React from "react";



export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

// Prevenir que el splash screen se oculte antes de cargar assets
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // ── Inicializar conexión WebSocket global ──
  useWebSocket();

  useEffect(() => {
    // Forzar el fondo del sistema base para evitar destellos blancos
    SystemUI.setBackgroundColorAsync(COLORS.dark.DEFAULT);
    
    // Forzar la barra de navegación (Android) a ser negra con botones claros
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(COLORS.dark.DEFAULT);
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  return (
    <ReactNative.View className="flex-1 bg-dark">
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.dark.DEFAULT },
          headerTintColor: COLORS.primary.DEFAULT,
          headerTitleStyle: { fontFamily: "Montserrat_700Bold" },
          contentStyle: { backgroundColor: COLORS.dark.DEFAULT },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(studio)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ReactNative.View>
  );
}

