import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export async function initializeSocket(): Promise<Socket> {
  if (socket) return socket
  
  try {
    const response = await fetch('/api/server')
    const data = await response.json()
    const serverUrl = data.server_url

    socket = io(serverUrl, {
      transports: ["polling"]
    })

    return socket

  } catch (error) {
    console.error('Error al inicializar el socket:', error)
    throw error
  }
}


