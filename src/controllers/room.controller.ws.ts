import {Socket} from 'socket.io';
import {ws} from '../websockets/decorators/websocket.decorator';

/**
 * A demo controller for websocket
 */
@ws({name: 'roomNsp', namespace: '/room'})
export class RoomControllerWs {
  constructor(
    @ws.socket() // Equivalent to `@inject('ws.socket')`
    private socket: Socket,
  ) { }

  /**
   * The method is invoked when a client connects to the server
   * @param socket
   */
  @ws.connect()
  connect() {
    console.log('Client connected: %s', this.socket.id);
  }

  /**
   * Register a handler for 'chat message' events
   * @param msg
   */
  @ws.subscribe('signal')
  // @ws.emit('namespace' | 'requestor' | 'broadcast')
  handleSignalMessage(data: any) {
    const {socket} = this;
    console.log("-------------Initialize------------------");
    console.log("-------------New Data------------------");
    console.log(data.type);
    console.log("---------------------------------------");
    this.signalTypeFactory(data);
    console.log("-------------Initialize Complete------------------");
    //socket.nsp.emit('chat message', `[${this.socket.id}] ${msg}`);
  }

  private signalTypeFactory(data: any) {
    const {socket} = this;
    if (data.type) {
      switch (data.type) {
        case "create-room": {
          console.log("Creating Room");
          socket.join(data.roomId);
          console.log(data.emailId + " created the meeting: " + data.roomId);
          break;
        }
        case "join-room": {
          console.log("Joining Room");
          socket.join(data.roomId);
          console.log(data.emailId + " entered the meeting: " + data.roomId);
          break;
        }
        case "video-offer": {
          console.log(data.emailId + " has sent a video offer");
          socket.to(data.roomId).emit("establish-connections", data);
          break;
        }
        case "video-answer": {
          console.log(data.emailId + " has sent a video answer");
          socket.to(data.roomId).emit("establish-connections", data);
          break;
        }
      }
    }
  }

  /**
   * The method is invoked when a client disconnects from the server
   * @param socket
   */
  @ws.disconnect()
  disconnect() {
    console.log('Client disconnected: %s', this.socket.id);
  }
}
