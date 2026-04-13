import { create } from "zustand";

// ─── Interfaces de TypeScript ──────────────────────────────────────────────

/** Representa una solicitud de cita entrante (vía bot de WhatsApp). */
export interface Request {
  id: string;
  clientName: string;
  clientPhone: string;
  description: string;
  referenceImages: string[];
  bodyPart: string;
  size: string;
  status: "pending" | "quoted" | "accepted" | "rejected";
  quotedPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Representa una cita registrada en la agenda del tatuador. */
export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  description: string;
  date: string; // ISO 8601
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  price: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes: string;
  createdAt: string;
}

// ─── Interfaz del Store ────────────────────────────────────────────────────

interface TattooState {
  // ── Datos ──
  requests: Request[];
  appointments: Appointment[];

  // ── Actions para Solicitudes ──
  setRequests: (requests: Request[]) => void;
  addRequest: (request: Request) => void;
  quoteRequest: (requestId: string, price: number) => void;
  updateRequestStatus: (requestId: string, status: Request["status"]) => void;
  removeRequest: (requestId: string) => void;

  // ── Actions para Citas ──
  setAppointments: (appointments: Appointment[]) => void;
  addManualAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointmentId: string, data: Partial<Appointment>) => void;
  removeAppointment: (appointmentId: string) => void;
}

// ─── Store de Zustand ──────────────────────────────────────────────────────

export const useTattooStore = create<TattooState>((set) => ({
  // ── Estado inicial ──
  requests: [],
  appointments: [],

  // ── Actions: Solicitudes ──
  setRequests: (requests) => set({ requests }),

  addRequest: (request) =>
    set((state) => ({
      requests: [request, ...state.requests],
    })),

  quoteRequest: (requestId, price) =>
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === requestId
          ? { ...req, quotedPrice: price, status: "quoted" as const, updatedAt: new Date().toISOString() }
          : req
      ),
    })),

  updateRequestStatus: (requestId, status) =>
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === requestId
          ? { ...req, status, updatedAt: new Date().toISOString() }
          : req
      ),
    })),

  removeRequest: (requestId) =>
    set((state) => ({
      requests: state.requests.filter((req) => req.id !== requestId),
    })),

  // ── Actions: Citas ──
  setAppointments: (appointments) => set({ appointments }),

  addManualAppointment: (appointment) =>
    set((state) => ({
      appointments: [...state.appointments, appointment].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    })),

  updateAppointment: (appointmentId, data) =>
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === appointmentId ? { ...apt, ...data } : apt
      ),
    })),

  removeAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.filter((apt) => apt.id !== appointmentId),
    })),
}));
