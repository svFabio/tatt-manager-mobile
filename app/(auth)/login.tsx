import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CustomButton, InputField } from "@/src/components/ui";
import api from "@/src/api/axios";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function LoginScreen() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const setToken                = useAuthStore((s) => s.setToken);

  const handleLogin = async () => {
    if (!email || !password) { setError("Completa todos los campos."); return; }
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
      router.replace("/");
    } catch (e: any) {
      setError(e.response?.data?.message || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
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
          {error ? <Text className="text-red-400 text-xs text-center mb-3">{error}</Text> : null}
          <CustomButton
            title={loading ? "Entrando..." : "Iniciar Sesión"}
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
