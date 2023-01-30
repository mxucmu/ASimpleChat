import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private logger;
    private UserDatabase;
    server: Server;
    handleAddUser(clientSocket: Socket, data: {
        usr: string;
    }): any;
    handleDeleteUser(clientSocket: Socket, data: {
        usr: string;
    }): any;
    handleMessage(data: {
        room: string;
        name: string;
        message: string;
    }): WsResponse<{
        room: string;
        name: string;
        message: string;
    }>;
    handlePrivateMessage(data: {
        name: string;
        message: string;
    }): WsResponse<{
        name: string;
        message: string;
    }>;
    handleJoinRoom(clientSocket: Socket, data: {
        room: string;
    }): any;
    handleLeaveRoom(clientSocket: Socket, data: {
        room: string;
    }): any;
    afterInit(server: Server): void;
    handleConnection(clientSocket: Socket, ...args: any[]): void;
    handleDisconnect(clientSocket: Socket): void;
}
