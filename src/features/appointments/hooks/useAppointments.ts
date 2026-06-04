import { useCallback } from "react";
import { useTattooStore, type Appointment } from "@/src/store/useTattooStore";
import api from "@/src/api/axios";

/**
 * Hook para manejar la lógica de negocio de las citas/agenda.
 */
export function useAppointments() {
  const appointments = useTattooStore((state) => state.appointments);
  const setAppointments = useTattooStore((state) => state.setAppointments);
  const addManualAppointment = useTattooStore((state) => state.addManualAppointment);
  const updateAppointment = useTattooStore((state) => state.updateAppointment);

  /** Carga las citas desde el backend. */
  const fetchAppointments = useCallback(async () => {
    try {
      const response = await api.get("/citas");
      const citasArray = response.data.data || response.data;
      setAppointments(Array.isArray(citasArray) ? citasArray : []);
    } catch (error) {
      console.error("[useAppointments] Error al cargar citas:", error);
    }
  }, [setAppointments]);

  /** Crea una cita manual y la envía al backend. */
  const createAppointment = useCallback(
    async (data: Omit<Appointment, "id" | "createdAt">) => {
      try {
        const response = await api.post("/citas", data);
        const newCita = response.data.data || response.data;
        addManualAppointment(newCita);
      } catch (error) {
        console.error("[useAppointments] Error al crear cita:", error);
        throw error;
      }
    },
    [addManualAppointment]
  );

  /** Actualiza el estado de una cita. */
  const changeStatus = useCallback(
    async (appointmentId: string, status: Appointment["status"]) => {
      try {
        await api.patch(`/citas/${appointmentId}`, { status });
        updateAppointment(appointmentId, { status });
      } catch (error) {
        console.error("[useAppointments] Error al actualizar cita:", error);
        throw error;
      }
    },
    [updateAppointment]
  );

  // Citas de hoy
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = (appointments || []).filter((a: any) => {
    const fechaStr = a.fechaHoraInicio || a.date;
    return fechaStr && fechaStr.startsWith(today);
  });

  // Próximas citas
  const upcomingAppointments = (appointments || []).filter((a: any) => {
    const fechaStr = a.fechaHoraInicio || a.date;
    const isFuture = fechaStr && new Date(fechaStr) >= new Date();
    const isScheduled = a.estadoCita === "CONFIRMADA" || a.estadoCita === "PENDIENTE" || a.status === "scheduled";
    return isFuture && isScheduled;
  });

  return {
    appointments,
    todayAppointments,
    upcomingAppointments,
    fetchAppointments,
    createAppointment,
    changeStatus,
  };
}
