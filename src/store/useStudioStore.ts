import { create } from "zustand";

export interface Studio {
  negocioId: number;
  nombre: string;
  plan: string;
  rol: "ADMIN" | "ARTISTA";
  unidoEn?: string;
}

interface StudioState {
  studioToken: string | null;
  currentStudio: Studio | null;
  studios: Studio[];
  
  setStudioToken: (token: string) => void;
  setCurrentStudio: (studio: Studio) => void;
  setStudios: (studios: Studio[]) => void;
  clearStudio: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  studioToken: null,
  currentStudio: null,
  studios: [],
  
  setStudioToken: (token) => set({ studioToken: token }),
  setCurrentStudio: (studio) => set({ currentStudio: studio }),
  setStudios: (studios) => set({ studios }),
  clearStudio: () => set({ studioToken: null, currentStudio: null }),
}));
