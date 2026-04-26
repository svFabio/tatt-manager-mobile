import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCalendar } from "@/src/features/appointments/hooks/useCalendar";
import { MonthHeader } from "@/src/features/appointments/components/MonthHeader";
import { ViewToggle } from "@/src/features/appointments/components/ViewToggle";
import { MonthGrid } from "@/src/features/appointments/components/MonthGrid";
import { DayTimeline } from "@/src/features/appointments/components/DayTimeline";
import { AppointmentDetailModal } from "@/src/features/appointments/components/AppointmentDetailModal";
import RegistroCitaModal from "@/src/components/ui/RegistroCita";
import { sessionService } from "@/src/services/sessionService";
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
    refrescar,
  } = useCalendar();

  const [vista, setVista] = useState<VistaCalendario>("month");
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectDay = (fecha: Date) => {
    seleccionarDia(fecha);
  };

  const handleFabPress = () => {
    setModalVisible(true);
  };

  const agregarSesion = async (nuevaCita: any) => {
    try {
      if (
        !nuevaCita.nombre ||
        !nuevaCita.telefono ||
        !nuevaCita.zona ||
        !nuevaCita.horario ||
        !nuevaCita.cotizacion
      ) {
        Alert.alert("❌ Error", "Por favor, completa todos los campos obligatorios.");
        return;
      }

      if (nuevaCita.telefono.length !== 8) {
        Alert.alert("❌ Error", "El teléfono debe tener 8 dígitos.");
        return;
      }

      const cotizacionNum = parseFloat(nuevaCita.cotizacion);
      if (isNaN(cotizacionNum) || cotizacionNum <= 0) {
        Alert.alert("❌ Error", "La cotización debe ser un número mayor a 0.");
        return;
      }

      if (nuevaCita.horas <= 0) {
        Alert.alert("❌ Error", "Las horas deben ser al menos 1.");
        return;
      }

      const fechaOriginal: Date = nuevaCita.fecha;
      const año = fechaOriginal.getFullYear();
      const mes = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaOriginal.getDate()).padStart(2, "0");
      const fechaFormateada = `${año}-${mes}-${dia}`;

      await sessionService.create({
        nombre: nuevaCita.nombre,
        telefono: nuevaCita.telefono,
        zona: nuevaCita.zona,
        horas: nuevaCita.horas,
        fecha: fechaFormateada,
        horario: nuevaCita.horario,
        cotizacion: cotizacionNum,
      });

      Alert.alert(
        "✅ ¡Éxito!",
        `Sesión registrada correctamente para ${nuevaCita.nombre}\n📅 Fecha: ${fechaFormateada}\n⏰ Hora: ${nuevaCita.horario}\n💰 Monto: Bs. ${cotizacionNum}`,
        [{ text: "OK" }]
      );

      setModalVisible(false);
      await refrescar();
    } catch (err: any) {
      console.error("❌ Error:", err);
      if (err?.message && (err.message.includes("horario") || err.message.includes("ocupado"))) {
        Alert.alert(
          "⚠️ Horario No Disponible",
          `${err.message}\n\nPor favor, selecciona otro horario para esta fecha.`,
          [{ text: "Entendido" }]
        );
      } else {
        Alert.alert("❌ Error", err?.message || "Error al guardar la sesión");
      }
    }
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

      <RegistroCitaModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={agregarSesion}
      />
    </View>
  );
}
