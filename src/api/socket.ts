import { io } from "socket.io-client";

// Asegúrate de usar la misma URL base de tu Axios
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL!;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
});
