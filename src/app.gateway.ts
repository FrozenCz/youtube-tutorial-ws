import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { timer } from 'rxjs';

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  private logger: Logger = new Logger('AppGateway');

  @WebSocketServer() wss: Server;

  afterInit(server: Server): any {
    this.logger.log('initialized');
    let iterator = 0;
    timer(5000, 2000).subscribe(() => {
      iterator++;
      this.wss.emit('msgToClient', {
        data: [{ msg: 'here is automatic message ' + iterator }],
        previousUpdateVersion: iterator - 1,
        actualUpdateVersion: iterator,
      });
    });
  }

  handleConnection(client: Socket, ...args: any[]): any {
    this.logger.log('client connected ' + client.id);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log('client disconnected ' + client.id);
  }

  @SubscribeMessage('msgToServer') // message to subscribe
  handleMessage(client: Socket, text: string): WsResponse<string> | void {
    // client.emit('msgToClient', 'Hello world!');
    this.wss.emit('msgToClient', 'From server!');
    return { event: 'msgToClient', data: 'Only to client' };
  }
}
