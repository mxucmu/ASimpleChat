import { Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, 
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat'
}) 
// default port = 3000 
// see Socket.IO - Server API Options; for example { transports: ['websocket'] } or { namespace: 'chat' }

export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('ChatGateway');

  private UserDatabase = new Map();

  @WebSocketServer()
  server: Server; // Nest.js will populate server with the server for the gateway

  @SubscribeMessage('addUser')
  handleAddUser(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {usr: string}): any {
    // let user: User = {
    //   UserName: data.usr,
    //   UserID: clientSocket.id,
    // }
    // console.log(user);
    this.UserDatabase.set(data.usr, clientSocket.id);
    console.log(this.UserDatabase);
    //console.log(this.UserDatabase.find(element => element.UserName == data.usr));
    this.server.emit('newUser', data.usr);
    return data.usr;
  }

  @SubscribeMessage('deleteUser')
  handleDeleteUser(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {usr: string}): any {
    this.UserDatabase.delete(data.usr);
    console.log(this.UserDatabase);
    this.server.emit('lostUser', data.usr);
    return data.usr;
  }

  @SubscribeMessage('msgToServer')
  handleMessage(@MessageBody() data: {room: string, name: string, message: string}): 
    WsResponse<{room: string, name: string, message: string}> { 
    //@MessageBody extract the message body from the payload.  Or we can use handleMessage(client, data): void{}
    this.server.to(data.room).emit('msgToClient', data);
    //this.server.emit('msgToClient', data);
    console.log(data);
    console.log(data.room);
    return {event:"msgToServer", data: data}; // equivalent to clientSocket.emit(data);
  }

  @SubscribeMessage('msgPrivateToServer')
  handlePrivateMessage(@MessageBody() data: {name: string, message: string}): 
    WsResponse<{name: string, message: string}> { 
    this.server.to(this.UserDatabase.get(data.name)).emit('msgPrivateToClient', data);
    //this.server.to(data.room).emit('msgPrivateToClient', data);
    console.log(data);
    //console.log(data.room);
    return {event:"msgToServer", data: data}; 
}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {room: string}): any {
    clientSocket.join(data.room);
    clientSocket.emit('joinedRoom', data.room);
    console.log(`Client ${clientSocket.id} has joined the chatroom.`);
    console.log(data.room);
    return data.room;
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() clientSocket: Socket, @MessageBody() data: {room: string}): any {
    clientSocket.leave(data.room);
    clientSocket.emit('leftRoom', data.room);
    console.log(`Client ${clientSocket.id} has left the chatroom.`);
    console.log(data.room);
    return data.room;
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(clientSocket: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${clientSocket.id}`);
  }

  handleDisconnect(clientSocket: Socket) {
    this.logger.log(`clientSocket disconnected: ${clientSocket.id}`)
  }
}
