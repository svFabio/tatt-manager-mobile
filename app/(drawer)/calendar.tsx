import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCalendar } from "@/src/features/appointments/hooks/useCalendar";
import { MonthHeader } from "@/src/features/appointments/components/MonthHeader";
import { ViewToggle } from "@/src/features/appointments/components/ViewToggle";
import { MonthGrid } from "@/src/features/appointments/components/MonthGrid";
import { DayTimeline } from "@/src/features/appointments/components/DayTimeline";
import { AppointmentDetailModal } from "@/src/features/appointments/components/AppointmentDetailModal";
import type {
  Cita,
  VistaCalendario,
} from "@/src/features/appointments/types";

export default function CalendarScreen() {
  const {
    mesActual,
    diaSeleccionado,
    citasPorDia,
    citasDelDia,
    loading,
    error,
    goPrevMonth,
    goNextMonth,
    seleccionarDia,
  } = useCalendar();

  const [vista, setVista] = useState<VistaCalendario>("month");
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  const handleSelectDay = (fecha: Date) => {
    seleccionarDia(fecha);
  };

  const handleFabPress = () => {
    // TODO: Conectar a pantalla de creación de cita
  };

  return (
    <View className="flex-1 bg-[#121212]">
      <MonthHeader mes={mesActual} onPrev={goPrevMonth} onNext={goNextMonth} />

      <View className="mt-2">
        <ViewToggle vista={vista} onChange={setVista} />
      </View>

      {error ? (
        <View className="mx-4 mt-4 p-3 bg-[#2A1515] rounded-xl border border-[#FF3B30]/30">
          <Text className="text-alert-light text-sm text-center">{error}</Text>
        </View>
      ) : null}

      {loading && vista === "month" ? (
        <View className="py-6 items-center">
          <ActivityIndicator color="#7E51FF" />
        </View>
      ) : null}

      {vista === "month" ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <MonthGrid
            mes={mesActual}
            diaSeleccionado={diaSeleccionado}
            citasPorDia={citasPorDia}
            onSelectDay={handleSelectDay}
          />
        </ScrollView>
      ) : (
        <DayTimeline
          dia={diaSeleccionado}
          citas={citasDelDia}
          onSelectCita={setCitaSeleccionada}
        />
      )}

      <TouchableOpacity
        onPress={handleFabPress}
        activeOpacity={0.85}
        className="absolute bottom-16 self-center w-16 h-14 rounded-2xl bg-[#7E51FF] items-center justify-center"
        style={{
          shadowColor: "#7E51FF",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <AppointmentDetailModal
        cita={citaSeleccionada}
        visible={citaSeleccionada != null}
        onClose={() => setCitaSeleccionada(null)}
      />
    </View>
  );
}
