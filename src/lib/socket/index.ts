import { io } from 'socket.io-client'
import { PUBLIC_SOCKET_URL } from '$env/static/public'

const socket = io(`https://${PUBLIC_SOCKET_URL}`, {
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})


export default socket

