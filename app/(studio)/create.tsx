import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "@/src/components/StyledText";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CustomButton, InputField } from "@/src/components/ui";
import api from "@/src/api/axios";
import { COLORS } from "@/src/theme/colors";

export default function CreateStudioScreen() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      await api.post("/auth/estudios/crear", { nombre: name.trim() });
      
      // Si se creó con éxito, regresamos a la pantalla de selección para que lo seleccione
      router.replace("/(studio)/select");
    } catch (e: any) {
      setError(e.response?.data?.error || "Error al crear el estudio.");
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
            <Text className="text-3xl">✨</Text>
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-4">
            Crear Estudio
          </Text>
          <Text className="text-muted text-center text-base">
            Dale un nombre a tu nuevo espacio de trabajo. Tú serás el administrador.
          </Text>
        </View>

        <View className="mb-6">
          <InputField
            label="Nombre del Estudio"
            placeholder="Ej. Ink & Blood Studio"
            value={name}
            onChangeText={setName}
            error={error}
          />
        </View>

        <CustomButton
          title={loading ? "Creando..." : "Crear Estudio"}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleCreate}
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
