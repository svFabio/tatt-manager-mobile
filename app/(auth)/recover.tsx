import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/StyledText";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CustomButton, InputField } from "@/src/components/ui";
import api from "@/src/api/axios";
import { COLORS } from "@/src/theme/colors";

export default function RecoverScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validarEmail = (correo: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const handleSendCode = async () => {
    setError("");

    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    if (!validarEmail(email.trim())) {
      setError("El correo ingresado no tiene un formato válido.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/recovery/send-code", { email: email.trim().toLowerCase() });
    } catch {
      // Silenciar — siempre redirigimos
    } finally {
      setLoading(false);
      // Siempre redirigir a verificar código (no revelar si el correo existe)
      router.push({
        pathname: "/(auth)/verify-code",
        params: { email: email.trim().toLowerCase() },
      });
    }
  };

  return (
    <View className="flex-1 bg-dark relative">
      {/* ── Background Glow ── */}
      <View className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary rounded-full opacity-10 blur-3xl" />
      <View className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-gold-dark rounded-full opacity-10 blur-3xl" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6 z-10"
      >
        <View className="flex-1 justify-center">
          {/* ── Botón Volver ── */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-16 left-0 flex-row items-center z-20"
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.muted} />
            <Text className="text-text-muted text-sm ml-1">Volver</Text>
          </TouchableOpacity>

          {/* ── Icono + Título ── */}
          <View className="items-center mb-10">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-6"
              style={{ backgroundColor: COLORS.primary.ghost }}
            >
              <Ionicons name="lock-closed-outline" size={36} color={COLORS.primary.DEFAULT} />
            </View>
            <Text
              className="text-text-primary text-3xl font-black tracking-tight text-center"
              style={{ fontFamily: "Montserrat_900Black" }}
            >
              Recuperar{"\n"}cuenta
            </Text>
            <Text className="text-text-muted text-sm mt-4 text-center font-medium leading-5 px-4">
              Ingresa tu correo para recibir un código de recuperación de tu cuenta
            </Text>
          </View>

          {/* ── Campo Email ── */}
          <InputField
            label="Correo Electrónico"
            placeholder="tu@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError("");
            }}
            error={error}
          />

          {/* ── Botón Enviar ── */}
          <View className="mt-6">
            <CustomButton
              title={loading ? "Enviando..." : "ENVIAR CÓDIGO"}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleSendCode}
            />
          </View>

          {/* ── Link volver a login ── */}
          <View className="flex-row justify-center items-center mt-10">
            <Text className="text-text-muted">¿Recordaste tu contraseña? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-bold">Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
