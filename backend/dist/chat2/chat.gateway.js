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
        this.UserNameList = [];
        this.UserRoomDatabase = new Map();
        this.UserRoomList = [];
        this.RoomList = ['Eighties', 'Ninties', 'Millenium'];
    }
    handleAddUser(clientSocket, data) {
        this.UserDatabase.set(clientSocket.id, data.usr);
        console.log("User db content: ", this.UserDatabase);
        this.UserNameList = [];
        this.UserDatabase.forEach((value, key) => {
            this.UserNameList = [...this.UserNameList, [key, value]];
        });
        console.log("User namelist content: ", this.UserNameList);
        this.server.emit('updateUserList', this.UserNameList);
        this.server.emit('updateRoomList', this.RoomList);
        return data.usr;
    }
    handleDeleteUser(clientSocket, data) {
        this.UserDatabase.delete(data.usr);
        console.log("this user db2 ", this.UserDatabase);
        this.server.emit('lostUser', data.usr);
        return data.usr;
    }
    handleAddRoom(clientSocket, data) {
        this.RoomList = [...this.RoomList, data.room];
        console.log("Updated room list: ", this.RoomList);
        this.server.emit('updateRoomList', this.RoomList);
        return data.room;
    }
    handleJoinRoom(clientSocket, data) {
        clientSocket.join(data.room);
        clientSocket.emit('joinedRoom', data.room);
        console.log(`Client ${clientSocket.id} has joined the chatroom: `, data.room);
        this.UserRoomDatabase.set(clientSocket.id, data.room);
        console.log("Room db content: ", this.UserRoomDatabase);
        this.UserRoomList = [];
        this.UserRoomDatabase.forEach((value, key) => {
            this.UserRoomList = [...this.UserRoomList, [key, value]];
        });
        console.log("User roomlist content: ", this.UserRoomList);
        let subset = this.UserRoomList.filter(element => element[1] === data.room);
        let UserInRoomList = this.UserNameList.filter(element => subset.find(e => e[0] === element[0]) !== undefined);
        this.server.to(data.room).emit('updateUserInRoomList', UserInRoomList);
        return data.room;
    }
    handleLeaveRoom(clientSocket, data) {
        clientSocket.leave(data.room);
        clientSocket.emit('leftRoom', data.room);
        console.log(`Client ${clientSocket.id} has left the chatroom: `, data.room);
        return data.room;
    }
    handleRemoveUser(data) {
        this.server.in(data.id).socketsLeave(data.room);
        this.server.to(data.id).emit('removedFromRoom');
        console.log('user ', data.name, ' removed from room ', data.room, ' by ', data.admin);
        this.UserRoomDatabase.set(data.id, "");
        console.log("Room db content: ", this.UserRoomDatabase);
        this.UserRoomList = [];
        this.UserRoomDatabase.forEach((value, key) => {
            this.UserRoomList = [...this.UserRoomList, [key, value]];
        });
        console.log("User roomlist content: ", this.UserRoomList);
        let subset = this.UserRoomList.filter(element => element[1] === data.room);
        let UserInRoomList = this.UserNameList.filter(element => subset.find(e => e[0] === element[0]) !== undefined);
        this.server.to(data.room).emit('updateUserInRoomList', UserInRoomList);
    }
    handleMessage(clientSocket, data) {
        console.log("msgToServer: ", data);
        this.server.to(data.room).emit('msgToClient', Object.assign(Object.assign({}, data), { id: clientSocket.id }));
        return { event: "msgToServer", data: data };
    }
    handlePrivateMessage(data) {
        this.server.to(data.selectUserId).emit('msgPrivateToClient', { senderId: data.senderId, senderName: data.senderName, message: data.message });
        console.log("msgPrivateToServer: ", data);
    }
    afterInit(server) {
        this.logger.log('Init');
    }
    handleConnection(clientSocket, ...args) {
        this.logger.log(`Client connected: ${clientSocket.id}`);
    }
    handleDisconnect(clientSocket) {
        this.logger.log(`clientSocket disconnected: ${clientSocket.id}`);
        this.UserDatabase.delete(clientSocket.id);
        console.log("User db content: ", this.UserDatabase);
        this.UserNameList = [];
        this.UserDatabase.forEach((value, key) => {
            this.UserNameList = [...this.UserNameList, [key, value]];
        });
        console.log("User namelist content: ", this.UserNameList);
        this.server.emit('updateUserList', this.UserNameList);
        this.UserRoomDatabase.delete(clientSocket.id);
        console.log("User Room db content: ", this.UserRoomDatabase);
        this.UserRoomList = [];
        this.UserRoomDatabase.forEach((value, key) => {
            this.UserRoomList = [...this.UserRoomList, [key, value]];
        });
        console.log("User roomlist content: ", this.UserRoomList);
        this.server.emit('updateUserRoomList', this.UserNameList);
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
    (0, websockets_1.SubscribeMessage)('addRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateWay.prototype, "handleAddRoom", null);
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
__decorate([
    (0, websockets_1.SubscribeMessage)('removeUser'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateWay.prototype, "handleRemoveUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('msgToServer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], ChatGateWay.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('msgPrivateToServer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateWay.prototype, "handlePrivateMessage", null);
ChatGateWay = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: "*" })
], ChatGateWay);
exports.ChatGateWay = ChatGateWay;
//# sourceMappingURL=chat.gateway.js.map