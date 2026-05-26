// app/(drawer)/chat/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { COLORS } from "../../../src/theme/colors";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { 
          backgroundColor: COLORS.dark?.DEFAULT || "#121212",
        },
        headerTintColor: COLORS.primary?.DEFAULT || "#25D366",
        headerTitleStyle: { 
          color: "#fff", 
          fontWeight: "bold" 
        },
        headerShown: false // Se lo delegamos a las pantallas individuales
      }}
    >
      <Stack.Screen name="index" options={{ title: "Mensajes de WhatsApp", headerShown: true }} />
      <Stack.Screen name="[remoteJid]" options={{ title: "Conversación", headerShown: true }} />
    </Stack>
  );
}