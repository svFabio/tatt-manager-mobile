import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CustomButton, InputField } from "@/src/components/ui";

/**
 * Pantalla de Login (placeholder).
 * Actualmente redirige directamente a las tabs.
 * Conectar con tu backend cuando implementes autenticación.
 */
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: Implementar autenticación con el backend
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        {/* ── Logo / Título ── */}
        <View className="items-center mb-12">
          <Text className="text-gold text-5xl mb-4">🎨</Text>
          <Text className="text-white text-3xl font-bold text-center">
            Tattoo Studio
          </Text>
          <Text className="text-gold text-lg font-semibold">Manager</Text>
        </View>

        {/* ── Formulario ── */}
        <InputField
          label="Email"
          placeholder="tu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <InputField
          label="Contraseña"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View className="mt-4">
          <CustomButton
            title="Iniciar Sesión"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleLogin}
          />
        </View>

        <Text className="text-muted text-xs text-center mt-6">
          v1.0.0 — Tattoo Studio Manager
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
