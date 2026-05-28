import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Text } from "@/src/components/StyledText";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CustomButton, InputField } from "@/src/components/ui";
import api from "@/src/api/axios";
import { useStudioStore } from "@/src/store/useStudioStore";
import { COLORS } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";

export default function JoinStudioScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!code) {
      setError("Ingresa un código válido");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      await api.post("/auth/estudios/unirse", { codigo: code });
      
      // Si se unió con éxito, regresamos a la pantalla de selección para que lo vea en la lista y lo seleccione
      router.replace("/(studio)/select");
    } catch (e: any) {
      setError(e.response?.data?.error || "Error al unirse al estudio. Verifica el código.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-6 justify-center"
      >
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-dark-200 items-center justify-center mb-6" style={{ borderWidth: 1, borderColor: COLORS.primary.border }}>
            <Ionicons name="link-outline" size={32} color={COLORS.primary.DEFAULT} />
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-4">
            Ingresar Código de Estudio
          </Text>
          <Text className="text-muted text-center text-base">
            Pídele el código al administrador de tu estudio para unirte.
          </Text>
        </View>

        <View className="mb-6">
          <InputField
            placeholder="XXXX-XXXX-XXXX-XXXX"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            error={error}
          />
        </View>

        <CustomButton
          title={loading ? "Verificando..." : "Unirse a Estudio"}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleJoin}
          disabled={loading}
        />
        
        <CustomButton
          title="Cancelar"
          variant="ghost"
          size="md"
          fullWidth
          className="mt-4"
          onPress={() => router.back()}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
