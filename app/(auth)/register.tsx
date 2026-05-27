import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/StyledText';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CustomButton, InputField } from "@/src/components/ui";
import api from "@/src/api/axios";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudioStore } from "@/src/store/useStudioStore";
import { COLORS } from "@/src/theme/colors";

export default function RegisterScreen() {
  const [nombre, setNombre]     = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  
  const setAuth                 = useAuthStore((s) => s.setAuth);
  const clearStudio             = useStudioStore((s) => s.clearStudio);

  const handleRegister = async () => {
    if (!nombre || !email || !password) { setError("Completa todos los campos."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    
    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/register", { nombre, email, password });
      
      setAuth(data.token, data.usuario);
      clearStudio(); 
      
      router.replace("/(studio)/select");
    } catch (e: any) {
      setError(e.response?.data?.error || "Error al crear cuenta.");
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
        <View className="items-center mb-8">
          <Text className="text-white text-3xl font-bold text-center">
            Crear Cuenta
          </Text>
          <Text className="text-muted text-center mt-2">
            Únete y gestiona tu estudio fácilmente
          </Text>
        </View>

        <InputField
          label="Nombre"
          placeholder="Tu nombre completo"
          value={nombre}
          onChangeText={setNombre}
        />
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
            title={loading ? "Creando..." : "Registrarse"}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleRegister}
            disabled={loading}
          />
        </View>

        <View className="flex-row justify-center items-center mt-8">
          <Text className="text-muted">¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-bold">Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
