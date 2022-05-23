import { Socket } from 'socket.io'
import Logger from '../utils/Logger'

export const activeSockets: Map<string, Socket> = new Map<string, Socket>()

/**
 * All handlers for socket.io client events
 */
const socketOnEventHandlers: Map<string, (...args: any[]) => void> = new Map<
  string,
  (...args: any) => void
>()

export const addSocketEventHandler = (
  event: string,
  handler: (socket: Socket, ...args: any[]) => void
) => {
  socketOnEventHandlers.set(event, handler)
}

addSocketEventHandler('disconnect', socket => {
  const worked = activeSockets.delete(socket.id)
  if (worked) new Logger().socketDisconnect(socket)
  else
    console.log(
      `The socket with ID ${socket.id} successfully disconnected but was not removed from activeSockets-Map.`
    )
})

export const socketIOConnectionHandler = (socket: Socket) => {
  new Logger().newSocketConnection(socket)

  // Add client to Map of active socket clients
  activeSockets.set(socket.id, socket)

  // Handle incoming events
  socketOnEventHandlers.forEach((handler, key) => socket.on(key, handler))
}
