import { Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, 
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: "*"})
export class ChatGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('ChatGateway');

  private UserDatabase = new Map();

  private UserNameList = [];

  private UserRoomDatabase = new Map();

  private UserRoomList = [];

  private RoomList = ['Eighties', 'Ninties', 'Millenium'];

  @WebSocketServer()
  server: Server; // Nest.js will populate server with the server for the gateway

  @SubscribeMessage('addUser')
  handleAddUser(@ConnectedSocket() clientSocket: Socket, 
                @MessageBody() data: {usr: string}): any {
    this.UserDatabase.set(clientSocket.id, data.usr);
    console.log("User db content: ", this.UserDatabase);
    this.UserNameList = [];
    this.UserDatabase.forEach( (value, key) => {
      this.UserNameList = [ ...this.UserNameList, [key, value] ];
    });
    console.log("User namelist content: ", this.UserNameList);
    //this.UserNameList = [ ...this.UserNameList, [clientSocket.id, data.usr] ];
    this.server.emit('updateUserList', this.UserNameList);
    //this.server.emit('updateUser', JSON.stringify(this.UserDatabase));
    this.server.emit('updateRoomList', this.RoomList);
    return data.usr;
  }

  @SubscribeMessage('deleteUser')
  handleDeleteUser(@ConnectedSocket() clientSocket: Socket, 
                    @MessageBody() data: {usr: string}): any {
    this.UserDatabase.delete(data.usr);
    console.log("this user db2 ",this.UserDatabase);
    this.server.emit('lostUser', data.usr);
    return data.usr;
  }

  @SubscribeMessage('addRoom')
  handleAddRoom(@ConnectedSocket() clientSocket: Socket, 
                @MessageBody() data: {room: string}): any {
    this.RoomList = [ ...this.RoomList, data.room ];
    console.log("Updated room list: ", this.RoomList);
    this.server.emit('updateRoomList', this.RoomList);
    return data.room;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() clientSocket: Socket, 
                  @MessageBody() data: {room: string}): any {
    clientSocket.join(data.room);
    clientSocket.emit('joinedRoom', data.room);
    console.log(`Client ${clientSocket.id} has joined the chatroom: `, data.room);

    this.UserRoomDatabase.set(clientSocket.id, data.room);
    console.log("Room db content: ", this.UserRoomDatabase);
    this.UserRoomList = [];
    this.UserRoomDatabase.forEach( (value, key) => {
      this.UserRoomList = [ ...this.UserRoomList, [key, value] ];
    });
    console.log("User roomlist content: ", this.UserRoomList);

    let subset = this.UserRoomList.filter( element => element[1] === data.room);
    let UserInRoomList = this.UserNameList.filter(
      element => 
        subset.find(e => e[0] === element[0]) !== undefined
    )
    this.server.to(data.room).emit('updateUserInRoomList', UserInRoomList);

    return data.room;
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() clientSocket: Socket, 
                  @MessageBody() data: {room: string}): any {
    clientSocket.leave(data.room);
    clientSocket.emit('leftRoom', data.room);
    console.log(`Client ${clientSocket.id} has left the chatroom: `, data.room);
    return data.room;
  }

  @SubscribeMessage('removeUser')
  handleRemoveUser(@MessageBody() data: {id: string, name: string, room: string, admin: string}): void {
    this.server.in(data.id).socketsLeave(data.room);
    this.server.to(data.id).emit('removedFromRoom');
    console.log('user ', data.name, ' removed from room ', data.room, ' by ', data.admin);

    this.UserRoomDatabase.set(data.id, "");
    console.log("Room db content: ", this.UserRoomDatabase);
    this.UserRoomList = [];
    this.UserRoomDatabase.forEach( (value, key) => {
      this.UserRoomList = [ ...this.UserRoomList, [key, value] ];
    });
    console.log("User roomlist content: ", this.UserRoomList);

    let subset = this.UserRoomList.filter( element => element[1] === data.room);
    let UserInRoomList = this.UserNameList.filter(
      element => 
        subset.find(e => e[0] === element[0]) !== undefined
    )
    this.server.to(data.room).emit('updateUserInRoomList', UserInRoomList);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(@ConnectedSocket() clientSocket: Socket, 
                @MessageBody() data: {room: string, name: string, message: string}): 
    WsResponse<{room: string, name: string, message: string}> {
    console.log("msgToServer: ", data);
    //@MessageBody extract the message body from the payload.  Or we can use handleMessage(client, data): void{}
    this.server.to(data.room).emit('msgToClient', {...data, id: clientSocket.id});
    //this.server.emit('msgToClient', data);
    return {event:"msgToServer", data: data}; // equivalent to clientSocket.emit(data);
  }

  @SubscribeMessage('msgPrivateToServer')
  handlePrivateMessage(@MessageBody() data: { selectUserId: string, 
                                              selectUserName: string, 
                                              senderId: string, 
                                              senderName: string, 
                                              message: string}): 
    //WsResponse<{selectUserId: string, selectUserName: string, name: string, message: string}> { 
      void {
    this.server.to(data.selectUserId).emit('msgPrivateToClient', 
      {senderId: data.senderId, senderName: data.senderName, message: data.message});
    //this.server.to(data.room).emit('msgPrivateToClient', data);
    console.log("msgPrivateToServer: ", data);
    //console.log(data.room);
    //return {event:"msgPrivateToServer", data: data}; 
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(clientSocket: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${clientSocket.id}`);
  }

  handleDisconnect(clientSocket: Socket) {
    this.logger.log(`clientSocket disconnected: ${clientSocket.id}`)
    this.UserDatabase.delete(clientSocket.id);
    console.log("User db content: ", this.UserDatabase);
    this.UserNameList = [];
    this.UserDatabase.forEach( (value, key) => {
      this.UserNameList = [ ...this.UserNameList, [key, value] ];
    });
    console.log("User namelist content: ", this.UserNameList);
    this.server.emit('updateUserList', this.UserNameList);
    this.UserRoomDatabase.delete(clientSocket.id);
    console.log("User Room db content: ", this.UserRoomDatabase);
    this.UserRoomList = [];
    this.UserRoomDatabase.forEach( (value, key) => {
      this.UserRoomList = [ ...this.UserRoomList, [key, value] ];
    });
    console.log("User roomlist content: ", this.UserRoomList);
    this.server.emit('updateUserRoomList', this.UserNameList);
  }
}
