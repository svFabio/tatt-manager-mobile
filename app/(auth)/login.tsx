import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { CustomButton, InputField } from "@/src/components/ui";
import api from "@/src/api/axios";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudioStore } from "@/src/store/useStudioStore";
import { COLORS } from "@/src/theme/colors";
import Logo from '@/assets/images/logo.svg';

export default function LoginScreen() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const setAuth                 = useAuthStore((s) => s.setAuth);
  const clearStudio             = useStudioStore((s) => s.clearStudio);

  const handleLogin = async () => {
    if (!email || !password) { setError("Completa todos los campos."); return; }
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/login", { email, password });
      
      setAuth(data.token, data.usuario);
      clearStudio(); // Asegurarnos de limpiar cualquier estudio previo
      
      router.replace("/(studio)/select");
    } catch (e: any) {
      setError(e.response?.data?.message || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const sessionId = Math.random().toString(36).substring(2, 15);
      const authUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/google-mobile?session=${sessionId}`;
      
      await WebBrowser.openBrowserAsync(authUrl);

      // Iniciar el polling
      const pollInterval = setInterval(async () => {
        try {
          const res = await api.get(`/auth/mobile-token?session=${sessionId}`);
          if (res.data.status === 'ready') {
            clearInterval(pollInterval);
            WebBrowser.dismissBrowser();
            
            setAuth(res.data.token, res.data.usuario);
            clearStudio();
            router.replace("/(studio)/select");
          } else if (res.data.status === 'expired') {
            clearInterval(pollInterval);
            WebBrowser.dismissBrowser();
            Alert.alert("Error", "El tiempo de inicio de sesión ha expirado");
          }
        } catch (pollErr) {
          console.error("Poll error", pollErr);
        }
      }, 2000);

      // Detener el polling si el usuario cierra el navegador manualmente (opcional, dejamos timeout de seguridad)
      setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000); 
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo iniciar sesión con Google");
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
          <Logo width={240} height={100} />
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
          {error ? <Text className="text-xs text-center mb-3" style={{ color: COLORS.danger.text }}>{error}</Text> : null}
          <CustomButton
            title={loading ? "Entrando..." : "Iniciar Sesión"}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleLogin}
          />
          
          <View className="my-4 flex-row items-center">
            <View className="flex-1 h-px bg-white/10" />
            <Text className="mx-4 text-white/50 text-xs">O</Text>
            <View className="flex-1 h-px bg-white/10" />
          </View>

          <CustomButton
            title="Continuar con Google"
            variant="outline"
            size="lg"
            fullWidth
            onPress={handleGoogleLogin}
          />
        </View>

        <View className="flex-row justify-center items-center mt-8">
          <Text className="text-muted">¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text className="text-primary font-bold">Registrarse</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-muted text-xs text-center mt-8">
          v1.0.0 — Tattoo Studio Manager
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
