import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
})
export class NotificationsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    // console.log(this.server.sockets.adapter.rooms);
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    // console.log(`Client ${client.id} joining room: ${room}`);
    client.join(room);
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    console.log(`Client ${client.id} leaving room: ${room}`);
    client.leave(room);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Automatically leaves all rooms on disconnect
  }

  sendNotification(userId: number, notification: any) {
    const room = `user_${userId}`;
    console.log(`Sending to room: ${room}`);
    this.server.to(room).emit('newNotification', notification);
    console.log(this.server.sockets.adapter.rooms);
  }

  removeAvailabilitySlot(userId: number, removedSlotId: number) {
    const room = `user_${userId}`;
    console.log(`Sending to room: ${room}`);
    this.server.to(room).emit('availabilityRemoved', {
      slotId: removedSlotId,
    });
    console.log(this.server.sockets.adapter.rooms);
  }
}
