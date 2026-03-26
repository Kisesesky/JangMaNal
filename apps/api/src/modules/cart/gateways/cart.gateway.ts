import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: 'cart', cors: true })
@Injectable()
export class CartGateway {
  @WebSocketServer()
  server!: Server;

  emitCartUpdated(userId: string, payload: unknown): void {
    this.server.to(userId).emit('cart.updated', payload);
  }
}
