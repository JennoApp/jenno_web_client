import { setContext, getContext } from 'svelte'
import { io, type Socket } from 'socket.io-client'


type SocketContextType = {
  socket: Socket | null
}

const SOCKET_CONTEXT = 'socket'

export function useSocketContext(): SocketContextType {
  return getContext(SOCKET_CONTEXT) as SocketContextType
}
