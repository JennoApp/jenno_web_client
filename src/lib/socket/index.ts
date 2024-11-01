import { io } from 'socket.io-client'
import { PUBLIC_SOCKET_URL } from '$env/static/public'

const socket = io(`wss:${PUBLIC_SOCKET_URL}`)


export default socket

/*
const users = []

// Función para agregar un nuevo usuario
const addUser = (userId, socketId) => {
  // Verificar si el usuario ya existe en el array
  const existingUser = users.find(user => user.userId === userId);
  if (!existingUser) {
    // Agregar el nuevo usuario al array
    users.push({ userId, socketId });
    console.log(`Usuario añadido: ${userId}`);
  } else {
    console.log(`El usuario ${userId} ya existe.`);
  }
};

socket.on("connect", () => {
  console.log("Successfully connected to socket")

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log(users)
  });
})

*/
