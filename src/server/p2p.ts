import { Chain } from '@core/blockchain/chain';
import { WebSocket } from 'ws';

export enum MessageType {
  latest_block = 0,
  all_block = 1,
  receivedChain = 2,
}

export interface Message {
  type: MessageType;
  payload: any;
}

export class P2PServer extends Chain {
  private sockets: WebSocket[];

  constructor() {
    super();

    this.sockets = [];
  }

  getSockets() {
    return this.sockets;
  }

  /**
   * listen() func
   * entering server->client
   * try to connect : server->client
   */
  listen() {
    const server = new WebSocket.Server({ port: 7545 });

    // server: connection
    server.on('connection', (socket) => {
      console.log('webSocket connected');

      this.connectSocket(socket);
    });
  }

  /**
   * connectToPeer() func
   * entering client->server
   * try to connect : client->server
   */
  connectToPeer(newPeer: string) {
    const socket = new WebSocket(newPeer);

    // clinet: open
    socket.on('open', () => {
      this.connectSocket(socket);
    });
  }

  connectSocket(socket: WebSocket) {
    this.sockets.push(socket);

    this.messageHandler(socket);

    const data: Message = {
      type: MessageType.latest_block,
      payload: {},
    };

    this.errorHandler(socket);

    const send = P2PServer.send(socket);

    // socket.on('message', (data: string) => {
    //   console.log(data);
    // });

    // socket.send('msg from server');
    send(data);
  }

  messageHandler(socket: WebSocket) {
    const callback = (_data: string) => {
      const result: Message = P2PServer.dataParse<Message>(_data);
      const send = P2PServer.send(socket);

      switch (result.type) {
        case MessageType.latest_block: {
          const message: Message = {
            type: MessageType.all_block,
            payload: [this.getLatestBlock()],
          };
          send(message);
          break;
        }
        case MessageType.all_block: {
          const message: Message = {
            type: MessageType.receivedChain,
            payload: this.getChain(),
          };

          // TODO: consider a block add or not
          const [receivedBlock] = result.payload;

          const isValid = this.addBlock(receivedBlock);

          if (!isValid.isError) break;

          send(message);
          break;
        }
        case MessageType.receivedChain: {
          const receivedChain: IBlock[] = result.payload;
          console.log(receivedChain);
          break;
        }
      }
    };

    socket.on('meesage', callback);
  }

  handlChainResponse(
    receivedChain: IBlock[]
  ): Failable<Message | undefined, string> {
    const isValidchain = this.isValidChain(receivedChain);

    if (isValidchain.isError)
      return { isError: true, error: isValidchain.error };

    const isValid = this.replaceChain(receivedChain);
    if (isValid.isError) return { isError: true, error: isValid.error };

    const message: Message = {
      type: MessageType.receivedChain,
      payload: receivedChain,
    };

    this.broadcast(message);

    return { isError: false, value: undefined };
  }

  broadcast(meesage: Message): void {
    this.sockets.forEach((socket) => P2PServer.send(socket)(meesage));
  }

  errorHandler(socket: WebSocket) {
    const close = () => {
      this.sockets.splice(this.sockets.indexOf(socket), 1);

      socket.on('close', close);

      socket.on('error', close);
    };
  }
  static send(_socket: WebSocket) {
    return (_data: Message) => {
      _socket.send(JSON.stringify(_data));
    };
  }

  static dataParse<T>(_data: string): T {
    return JSON.parse(Buffer.from(_data).toString());
  }
}
