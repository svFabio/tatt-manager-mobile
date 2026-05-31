import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/src/components/StyledText";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CustomButton } from "@/src/components/ui";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudioStore, Studio } from "@/src/store/useStudioStore";
import api from "@/src/api/axios";
import { COLORS } from "@/src/theme/colors";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

export default function SelectStudioScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { studios, setStudios, setStudioToken, setCurrentStudio } = useStudioStore();

  const fetchStudios = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get<Studio[]>("/auth/estudios");
      setStudios(data);
    } catch (e: any) {
      setError("Error al cargar tus estudios. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  const handleSelectStudio = async (studio: Studio) => {
    try {
      setLoading(true);
      const { data } = await api.post(`/auth/estudios/seleccionar/${studio.negocioId}`);
      // El backend nos devuelve token contextual, info del usuario, info del negocio, y rol
      setStudioToken(data.token);
      setCurrentStudio({
        negocioId: data.negocio.id,
        nombre: data.negocio.nombre,
        plan: data.negocio.plan,
        rol: data.rol,
      });
      router.replace("/(drawer)");
    } catch (e: any) {
      setError("Error al entrar al estudio.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg relative">
      {/* ── Background Glow ── */}
      <View className="absolute top-[-5%] left-[-10%] w-72 h-72 bg-primary rounded-full opacity-10" />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Icon */}
        <View className="items-center mt-12 mb-10">
          <View className="w-20 h-20 rounded-3xl items-center justify-center bg-primary-ghost border border-primary-border">
             <Ionicons name="business" size={32} color={COLORS.primary.DEFAULT} />
          </View>
          <Text className="text-text-primary text-3xl font-bold text-center mt-6">
            Selecciona tu espacio
          </Text>
          <Text className="text-text-muted text-sm text-center mt-2 px-4">
            Elige a qué estudio de tatuajes deseas entrar para gestionar tus citas
          </Text>
        </View>

        {error ? (
          <Text className="text-alert text-center mb-6">{error}</Text>
        ) : null}

        {/* Studios List */}
        {loading && studios.length === 0 ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
          </View>
        ) : (
          <View className="gap-y-4 mb-10">
            {studios.map((studio) => (
              <TouchableOpacity
                key={studio.negocioId}
                onPress={() => handleSelectStudio(studio)}
                activeOpacity={0.7}
                className="bg-dark-100 rounded-3xl p-5 flex-row items-center justify-between border border-border-subtle"
              >
                <View className="flex-1">
                  <Text className="text-text-primary text-xl font-bold mb-1.5">{studio.nombre}</Text>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: studio.rol === 'ADMIN' ? COLORS.primary.DEFAULT : COLORS.success.DEFAULT }} />
                    <Text className="text-text-secondary text-xs uppercase tracking-widest font-bold">
                      {studio.rol === 'ADMIN' ? 'Administrador' : 'Tatuador'}
                    </Text>
                    {studio.rol === 'ADMIN' && (
                      <FontAwesome5 name="crown" size={10} color={COLORS.primary.DEFAULT} style={{ marginLeft: 6 }} />
                    )}
                  </View>
                </View>
                <View className="w-10 h-10 rounded-full bg-dark-200 items-center justify-center">
                  <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
                </View>
              </TouchableOpacity>
            ))}
            
            {studios.length === 0 && !loading && (
              <Text className="text-text-muted text-center py-6 text-sm">No perteneces a ningún estudio aún.</Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View className="gap-y-4 mt-auto">
          <CustomButton
            title="Unirse a un estudio nuevo"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => router.push("/(studio)/join")}
          />
          <CustomButton
            title="Crear un nuevo estudio"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => router.push("/(studio)/create")}
          />
          
          <TouchableOpacity onPress={handleLogout} className="mt-8 mb-4 items-center p-2 flex-row justify-center">
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger.text} />
            <Text className="text-danger-text font-bold text-sm ml-2 uppercase tracking-widest">Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
