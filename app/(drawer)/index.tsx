import React, { useEffect } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/StyledText";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudioStore } from "@/src/store/useStudioStore";
import { useAppointments } from "@/src/features/appointments/hooks/useAppointments";
import { useRequests } from "@/src/features/requests/hooks/useRequests";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { currentStudio } = useStudioStore();
  const { todayAppointments, upcomingAppointments, fetchAppointments } = useAppointments();
  const { pendingRequests, fetchRequests } = useRequests();

  useEffect(() => {
    fetchAppointments();
    fetchRequests();
  }, []);

  return (
    <View className="flex-1 bg-dark">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* ── HEADER ── */}
        <View className="mb-8">
          <Text className="text-text-muted text-sm uppercase tracking-widest font-bold mb-1">
            {currentStudio?.nombre || "Tu Estudio"}
          </Text>
          <Text className="text-text-primary text-3xl font-black tracking-tight">
            Hola, {user?.nombre?.split(' ')[0] || "Tatuador"}
          </Text>
        </View>

        {/* ── QUICK STATS ── */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity activeOpacity={0.8} className="bg-primary-ghost w-[48%] rounded-3xl p-5 border border-primary-border">
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mb-4">
              <Ionicons name="calendar" size={20} color={COLORS.primary.DEFAULT} />
            </View>
            <Text className="text-text-primary text-2xl font-black">{todayAppointments?.length || 0}</Text>
            <Text className="text-primary font-bold text-[10px] mt-1 uppercase tracking-widest">Sesiones Hoy</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} className="bg-danger-ghost w-[48%] rounded-3xl p-5 border border-danger-border">
            <View className="w-10 h-10 rounded-full bg-alert/20 items-center justify-center mb-4">
              <Ionicons name="mail-unread" size={20} color={COLORS.danger.DEFAULT} />
            </View>
            <Text className="text-text-primary text-2xl font-black">{pendingRequests?.length || 0}</Text>
            <Text className="text-alert font-bold text-[10px] mt-1 uppercase tracking-widest">Nuevas Solicitudes</Text>
          </TouchableOpacity>
        </View>

        {/* ── RECENT ACTIVITY ── */}
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-text-primary text-lg font-bold">Próximas Sesiones</Text>
        </View>

        {upcomingAppointments && upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((cita) => (
            <View key={cita.id} className="bg-dark-100 rounded-3xl p-5 border border-border-subtle mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <View>
                  <Text className="text-text-primary font-bold text-lg">{cita.clienteId || "Cliente"}</Text>
                  <Text className="text-text-muted text-xs mt-1">{cita.title || "Sesión de Tatuaje"}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary font-bold text-sm">
                    {new Date(cita.date).toLocaleDateString()}
                  </Text>
                  <Text className="text-text-muted text-xs mt-1">
                    {new Date(cita.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              <View className="h-[1px] bg-dark-200 my-4" />
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color={COLORS.text.muted} />
                  <Text className="text-text-muted text-xs ml-1 font-medium">Revisa el calendario</Text>
                </View>
                <TouchableOpacity 
                  className="bg-dark-200 px-4 py-2 rounded-full"
                  onPress={() => router.push("/(drawer)/calendar")}
                >
                  <Text className="text-text-primary text-xs font-bold">Ver en calendario</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-dark-100 rounded-3xl p-5 border border-border-subtle mb-4 items-center">
            <Text className="text-text-muted text-sm">No hay sesiones programadas próximamente</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
