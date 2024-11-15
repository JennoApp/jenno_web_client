import { PUBLIC_SOCKET_URL } from '$env/static/public'
import { io, type Socket } from 'socket.io-client'

const socket: Socket = io(`https://jenno-backend.vercel.app`, {
  transports: ["polling", "websocket"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
})

socket.on("connect", () => {
  console.log("Connectado con ID de session:", socket.id)
})

socket.on("disconnect", (reason) => {
  console.error("Desconectado:", reason);
});

socket.on("connect_error", (error) => {
  console.error("Error de conexión:", error.message);
});

export default socket
