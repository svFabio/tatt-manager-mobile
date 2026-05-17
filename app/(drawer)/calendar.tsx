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
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { COLORS, PRIMARY_SHADOW } from "@/src/theme/colors";
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
    citas,
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
    const fechaOriginal: Date = nuevaCita.fecha;
    const año = fechaOriginal.getFullYear();
    const mes = String(fechaOriginal.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaOriginal.getDate()).padStart(2, "0");
    const fechaFormateada = `${año}-${mes}-${dia}`;

    const cotizacionNum = typeof nuevaCita.cotizacion === 'number' ? nuevaCita.cotizacion : parseFloat(nuevaCita.cotizacion);

    await sessionService.create({
      nombre: nuevaCita.nombre,
      telefono: nuevaCita.telefono,
      zona: nuevaCita.zona,
      tamano: nuevaCita.tamano,
      horas: nuevaCita.horas,
      fecha: fechaFormateada,
      horario: nuevaCita.horario,
      cotizacion: cotizacionNum,
    });

    Alert.alert(
      "¡Éxito!",
      `Sesión registrada para ${nuevaCita.nombre}\nFecha: ${fechaFormateada}\nHora: ${nuevaCita.horario}\nMonto: Bs. ${cotizacionNum}`,
      [{ text: "OK" }]
    );

    setModalVisible(false);
    await refrescar();
  };

  return (
    <View className="flex-1 bg-dark">
      <MonthHeader mes={mesActual} onPrev={goPrevMonth} onNext={goNextMonth} />

      <View className="mt-2">
        <ViewToggle vista={vista} onChange={setVista} />
      </View>

      {error ? (
        <View className="mx-4 mt-4 p-3 rounded-xl border border-alert-light/30" style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}>
          <Text className="text-alert-light text-sm text-center">{error}</Text>
        </View>
      ) : null}

      {vista === "month" ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Month grid with loading overlay */}
          <View style={{ position: 'relative' }}>
            <MonthGrid
              mes={mesActual}
              diaSeleccionado={diaSeleccionado}
              citasPorDia={citasPorDia}
              onSelectDay={handleSelectDay}
            />
            {loading ? (
              <View
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(18,18,18,0.6)',
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 5,
                }}
              >
                <ActivityIndicator color={COLORS.primary.DEFAULT} />
              </View>
            ) : null}
          </View>

          {/* Sessions for selected day */}
          {!loading && citasDelDia.length > 0 ? (
            <View className="mx-4 mt-5">
              <View className="flex-row items-center mb-3">
                <MaterialIcons name="today" size={18} color={COLORS.primary.light} />
                <Text className="text-white text-base font-bold ml-2">
                  {diaSeleccionado.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Text>
              </View>
              {citasDelDia.map((cita) => {
                const fecha = cita.fechaHoraInicio ? new Date(cita.fechaHoraInicio) : null;
                const clienteNombre = cita.cliente?.nombre ?? cita.clienteNombre ?? '—';
                const artistaNombre = cita.artista?.nombre ?? cita.artistaNombre ?? '—';

                const statusKey = (cita.estadoCita || '').toLowerCase() as keyof typeof COLORS.status;
                const statusColors = COLORS.status[statusKey] || COLORS.status.pendiente;
                const statusLabel = cita.estadoCita || 'PENDIENTE';

                return (
                  <TouchableOpacity
                    key={cita.id}
                    activeOpacity={0.7}
                    onPress={() => setCitaSeleccionada(cita)}
                    className="flex-row items-center rounded-2xl p-4 mb-2"
                    style={{ backgroundColor: COLORS.dark[100], borderWidth: 1, borderColor: COLORS.border.subtle }}
                  >
                    {/* Time badge */}
                    <View
                      className="w-12 h-14 rounded-xl items-center justify-center mr-4"
                      style={{ backgroundColor: COLORS.primary.ghost }}
                    >
                      {fecha ? (
                        <Text style={{ color: COLORS.text.primary, fontSize: 14, fontWeight: '800' }}>
                          {fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      ) : (
                        <MaterialIcons name="event" size={20} color={COLORS.primary.DEFAULT} />
                      )}
                    </View>
                    {/* Info */}
                    <View className="flex-1">
                      <Text className="text-white text-sm font-semibold" numberOfLines={1}>{clienteNombre}</Text>
                      <Text style={{ color: COLORS.text.muted }} className="text-xs mt-0.5">{artistaNombre}</Text>
                      {cita.zonaDelCuerpo ? (
                        <Text style={{ color: COLORS.text.dimmed }} className="text-[10px] mt-1">
                          {cita.zonaDelCuerpo}
                          {cita.duracionEnHoras ? ` · ${cita.duracionEnHoras}h` : ''}
                        </Text>
                      ) : null}
                    </View>
                    {/* Status chip */}
                    <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: statusColors.bg }}>
                      <Text style={{ color: statusColors.text, fontSize: 10, fontWeight: '700' }}>
                        {statusLabel}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : !loading ? (
            <View className="mx-4 mt-5 items-center py-8">
              <MaterialIcons name="event-available" size={32} color={COLORS.dark[300]} />
              <Text style={{ color: COLORS.text.muted }} className="text-sm mt-2">
                Sin sesiones el {diaSeleccionado.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </Text>
            </View>
          ) : null}
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
        className="absolute bottom-16 self-center w-16 h-14 rounded-2xl items-center justify-center"
        style={{
          backgroundColor: COLORS.primary.DEFAULT,
          ...PRIMARY_SHADOW,
          elevation: 10,
        }}
      >
        <Feather name="plus" size={26} color={COLORS.text.primary} />
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
