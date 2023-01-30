import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
export declare class ChatGateWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private logger;
    private UserDatabase;
    private UserNameList;
    private UserRoomDatabase;
    private UserRoomList;
    private RoomList;
    server: Server;
    handleAddUser(clientSocket: Socket, data: {
        usr: string;
    }): any;
    handleDeleteUser(clientSocket: Socket, data: {
        usr: string;
    }): any;
    handleAddRoom(clientSocket: Socket, data: {
        room: string;
    }): any;
    handleJoinRoom(clientSocket: Socket, data: {
        room: string;
    }): any;
    handleLeaveRoom(clientSocket: Socket, data: {
        room: string;
    }): any;
    handleRemoveUser(data: {
        id: string;
        name: string;
        room: string;
        admin: string;
    }): void;
    handleMessage(clientSocket: Socket, data: {
        room: string;
        name: string;
        message: string;
    }): WsResponse<{
        room: string;
        name: string;
        message: string;
    }>;
    handlePrivateMessage(data: {
        selectUserId: string;
        selectUserName: string;
        senderId: string;
        senderName: string;
        message: string;
    }): void;
    afterInit(server: Server): void;
    handleConnection(clientSocket: Socket, ...args: any[]): void;
    handleDisconnect(clientSocket: Socket): void;
}
