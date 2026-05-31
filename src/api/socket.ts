import { io, Socket } from "socket.io-client";

// Asegúrate de usar la misma URL base de tu Axios
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL!;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
});

// ✅ Fix 2: Unirse al room del negocio para recibir solo sus eventos
let currentRoom: number | null = null;

export const joinNegocioRoom = (negocioId: number) => {
  if (currentRoom === negocioId) return; // Ya estamos en ese room
  if (currentRoom !== null) {
    socket.emit("leave-negocio", currentRoom);
  }
  socket.emit("join-negocio", negocioId);
  currentRoom = negocioId;
};

export const leaveNegocioRoom = () => {
  if (currentRoom !== null) {
    socket.emit("leave-negocio", currentRoom);
    currentRoom = null;
  }
};
