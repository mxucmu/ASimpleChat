"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateWay = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let ChatGateWay = class ChatGateWay {
    constructor() {
        this.logger = new common_1.Logger('ChatGateway');
        this.UserDatabase = new Map();
    }
    handleAddUser(clientSocket, data) {
        this.UserDatabase.set(data.usr, clientSocket.id);
        console.log("this user db ", this.UserDatabase);
        this.server.emit('newUser', data.usr);
        return data.usr;
    }
    handleDeleteUser(clientSocket, data) {
        this.UserDatabase.delete(data.usr);
        console.log("this user db2 ", this.UserDatabase);
        this.server.emit('lostUser', data.usr);
        return data.usr;
    }
    handleMessage(data) {
        this.server.emit('msgToClient', data);
        console.log(data);
        console.log(data.room);
        return { event: "msgToServer", data: data };
    }
    handlePrivateMessage(data) {
        this.server.to(this.UserDatabase.get(data.name)).emit('msgPrivateToClient', data);
        console.log(data);
        return { event: "msgToServer", data: data };
    }
    handleJoinRoom(clientSocket, data) {
        clientSocket.join(data.room);
        clientSocket.emit('joinedRoom', data.room);
        console.log(`Client ${clientSocket.id} has joined the chatroom.`);
        console.log(data.room);
        return data.room;
    }
    handleLeaveRoom(clientSocket, data) {
        clientSocket.leave(data.room);
        clientSocket.emit('leftRoom', data.room);
        console.log(`Client ${clientSocket.id} has left the chatroom.`);
        console.log(data.room);
        return data.room;
    }
    afterInit(server) {
        this.logger.log('Init');
    }
    handleConnection(clientSocket, ...args) {
        this.logger.log(`Client connected: ${clientSocket.id}`);
    }
    handleDisconnect(clientSocket) {
        this.logger.log(`clientSocket disconnected: ${clientSocket.id}`);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateWay.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('addUser'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateWay.prototype, "handleAddUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('deleteUser'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateWay.prototype, "handleDeleteUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('msgToServer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ChatGateWay.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('msgPrivateToServer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ChatGateWay.prototype, "handlePrivateMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateWay.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateWay.prototype, "handleLeaveRoom", null);
ChatGateWay = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true, namespace: 'chat' })
], ChatGateWay);
exports.ChatGateWay = ChatGateWay;
//# sourceMappingURL=chat.gate.js.map