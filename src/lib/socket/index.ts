import { PUBLIC_SOCKET_URL } from '$env/static/public'
import { io, type Socket } from 'socket.io-client'

const socket: Socket = io(`https://${PUBLIC_SOCKET_URL}`, {
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

export default socket
