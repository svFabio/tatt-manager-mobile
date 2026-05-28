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
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 40 }}>
        
        {/* Header Icon */}
        <View className="items-center mt-10 mb-8">
          <View style={{ width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.dark[200], borderWidth: 1, borderColor: COLORS.primary.border }}>
             <Ionicons name="briefcase-outline" size={36} color={COLORS.primary.DEFAULT} />
          </View>
          <Text className="text-white text-3xl font-bold text-center mt-6">
            Seleccionar espacio{"\n"}de trabajo
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
                className="bg-dark-100 rounded-2xl p-5 flex-row items-center justify-between"
                style={{ borderWidth: 1, borderColor: COLORS.border.subtle }}
              >
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold mb-1">{studio.nombre}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-muted text-sm">{studio.rol === 'ADMIN' ? 'Administrador' : 'Tatuador'}</Text>
                    {studio.rol === 'ADMIN' && (
                      <FontAwesome5 name="crown" size={12} color={COLORS.primary.DEFAULT} style={{ marginLeft: 6 }} />
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.text.muted} />
              </TouchableOpacity>
            ))}
            
            {studios.length === 0 && !loading && (
              <Text className="text-muted text-center py-6">No perteneces a ningún estudio aún.</Text>
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
          
          <TouchableOpacity onPress={handleLogout} className="mt-6 items-center p-2">
            <Text className="text-alert font-medium text-base">Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
