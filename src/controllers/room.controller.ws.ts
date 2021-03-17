import {Server, Socket} from 'socket.io';
import {DbDataSource} from '../datasources';
import {ws} from '../websockets/decorators/websocket.decorator';
/**
 * A demo controller for websocket
 */
@ws({name: 'roomNsp', namespace: '/room'})
export class RoomControllerWs {
  DB: any;
  constructor(
    @ws.socket() private socket: Socket,
    @ws.server() private io: Server,
  ) {
    this.DB = new DbDataSource();
  }

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
    console.log("-------------Initialize------------------");
    console.log("-------------New Data------------------");
    console.log(data.type);
    console.log("---------------------------------------");
    this.signalTypeFactory(data);
    console.log("-------------Initialize Complete------------------");
    //socket.nsp.emit('chat message', `[${this.socket.id}] ${msg}`);
  }

  private signalTypeFactory(data: any) {
    let {socket} = this;
    if (data.type) {
      switch (data.type) {
        case "create-room": {
          console.log("Creating Room");
          this.createActions(data);
          break;
        }
        case "subscribe": {
          console.log("Subscribing to " + data.emailId);
          socket.join("temp-" + data.roomId);
          socket.join(data.emailId);
          break;
        }
        case "join-room": {
          console.log("Joining Room");
          socket.join(data.roomId);
          console.log(data.emailId + " has joined " + data.roomId);
          socket.to(data.roomId).emit("establish-connections", {
            type: "joined-room",
            roomId: data.roomId,
            emailId: data.emailId,
            firstName: data.firstName,
          });
          break;
        }
        case "video-offer": {
          console.log(data.emailId + " has sent a video offer");
          socket.to(data.to).emit("establish-connections", data);
          break;
        }
        case "video-answer": {
          console.log(data.emailId + " has sent a video answer to: " + data.targetEmailId);
          socket.to(data.to).emit("establish-connections", data);
          break;
        }
        case "started-meeting": {
          console.log("Starting Meeting");
          this.startMeeting(data);
          break;
        }
        case "join-request": {
          console.log("New JOIN Request");
          this.joinRequestActions(data);
          break;
        }
        case "accept-or-reject": {
          console.log("Accept-or-Reject");
          console.log(data);
          socket.to(data.to)
            .emit("establish-connections", {
              type: "accept-or-reject",
              emailId: data.emailId,
              action: data.action,
            });
          break;
        }
        case "new-ice-candidate": {
          console.log("New ICE Candidate Case");
          socket.to(data.to).emit("establish-connections", data);
          break;
        }
        case "close-meeting": {
          console.log("Close Meeting");
          socket.to(data.roomId).emit("establish-connections", data);
          break;
        }
      }
    }
  }

  private joinRequestActions = (data: any) => {
    let {socket, DB: {client, query}} = this;
    client.query(query.Get(query.Match("room_host", data.roomId)))
      .then((response: any) => {
        console.log(data);
        socket.to(response.data.host)
          .emit("establish-connections", {
            type: "join-request",
            firstName: data.firstName,
            emailId: data.emailId,
          });
      })
  }

  private createActions = (data: any) => {
    let {socket, DB: {client, query}} = this;
    client.query(
      query.Create(
        query.Collection('rooms'),
        {
          data: {
            roomId: data.roomId,
            host: data.emailId,
            isStarted: false,
          }
        }
      )
    ).then(() => {
      socket.emit('establish-connections', {
        type: "room-created",
        roomId: data.roomId,
        host: data.emailId,
      });
      console.log("Fauna: Room Created")
    })
      .catch((err: any) => console.log(err));
    console.log(data.emailId + " created the meeting: " + data.roomId);
  }

  private startMeeting = (data: any) => {
    let {socket, DB: {client, query}} = this;
    socket.join(data.roomId);
    socket.join("temp-" + data.roomId);
    console.log(data.emailId + " has joined " + data.roomId);
    client.query(query.Get(query.Match("room_host", data.roomId)))
      .then((response: any) => {
        console.log(response);
        client.query(query.Update(response.ref, {
          data: {
            isStarted: true,
          }
        }))
          .then(() => {
            socket.to("temp-" + data.roomId).emit("establish-connections", {
              type: "started-meeting",
            });
          })
          .catch((err: any) => console.log(err))
        console.log("Meeting Started");
      })
      .catch(() => console.log("Fauna: Error Occured"));
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
