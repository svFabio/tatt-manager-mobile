import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '@/src/components/StyledText';
import { router } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { CustomButton, InputField } from "@/src/components/ui";
import api from "@/src/api/axios";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudioStore } from "@/src/store/useStudioStore";
import { COLORS } from "@/src/theme/colors";
import { FontAwesome } from '@expo/vector-icons';

const GoogleIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05"/>
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.18-4.53z" fill="#EA4335"/>
  </Svg>
);

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
    <View className="flex-1 bg-dark relative">
      {/* ── Background Glow ── */}
      <View className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary rounded-full opacity-10 blur-3xl" />
      <View className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-gold-dark rounded-full opacity-10 blur-3xl" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6 z-10"
      >
        {/* ── Center Content Container ── */}
        <View className="flex-1 justify-center">
          {/* ── Logo / Título ── */}
          <View className="items-center mb-10">
            <Text className="text-white text-[48px] font-black tracking-tighter" style={{ fontFamily: "Montserrat_900Black" }}>TATT</Text>
            <Text className="text-primary text-[48px] font-black tracking-tighter -mt-5" style={{ fontFamily: "Montserrat_900Black" }}>STUDIO</Text>
            <Text className="text-text-muted text-sm mt-4 text-center font-medium">Ingresa tus datos para continuar</Text>
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
            
            <View className="my-8 flex-row items-center">
              <View className="flex-1 h-[1px] bg-dark-200" />
              <Text className="mx-4 text-text-muted text-xs font-bold tracking-widest uppercase">O continuar con</Text>
              <View className="flex-1 h-[1px] bg-dark-200" />
            </View>

            <TouchableOpacity
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              className="flex-row items-center justify-center bg-white rounded-2xl py-4 px-6"
            >
              <GoogleIcon />
              <Text className="ml-3 text-[#333333] font-bold text-base">Continuar con Google</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center mt-10">
            <Text className="text-text-muted">¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text className="text-primary font-bold">Crear una cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}
