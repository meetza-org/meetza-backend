import {Constructor, Context} from '@loopback/context';
import {HttpServer} from '@loopback/http-server';
import {Server, Socket} from "socket.io";
import {getWebSocketMetadata, WebSocketMetadata} from "./decorators/websocket.decorator";
import {WebSocketControllerFactory} from './websocket-controller-factory';

const debug = require('debug')('loopback:websocket');

/* eslint-disable @typescript-eslint/no-explicit-any */
export type SockIOMiddleware = (
  socket: Socket,
  fn: (err?: any) => void,
) => void;

/**
 * A websocket server
 */
export class WebSocketServer extends Context {
  private io: Server;

  constructor(
    public ctx: Context,
    private options: any = {},
  ) {
    super(ctx);
    console.log("Inside WebSocket Constructor");
    this.io = new Server(options);
    ctx.bind('ws.server').to(this.io);
  }

  /**
   * Register a sock.io middleware function
   * @param fn
   */
  use(fn: SockIOMiddleware) {
    return this.io.use(fn);
  }

  /**
   * Register a websocket controller
   * @param ControllerClass
   * @param meta
   */
  route(ControllerClass: Constructor<any>, meta?: WebSocketMetadata | string | RegExp) {
    console.log('Inside Routes');
    console.log(ControllerClass);
    console.log(meta);
    if (meta instanceof RegExp || typeof meta === 'string') {
      meta = {namespace: meta} as WebSocketMetadata;
    }
    if (meta == null) {
      console.log('Meta Null');
      meta = getWebSocketMetadata(ControllerClass) as WebSocketMetadata;
      console.log('Meta Received');
      console.log(meta);
    }
    const nsp = (meta && meta.namespace) ? this.io.of(meta.namespace) : this.io;
    if (meta && meta.name) {
      this.ctx.bind(`ws.namespace.${meta.name}`).to(nsp);
    }

    console.log('Before On Connection');
    /* eslint-disable @typescript-eslint/no-misused-promises */
    nsp.on('connection', async socket => {
      console.log('connection socket');
      debug(
        'Websocket connected: id=%s namespace=%s',
        socket.id,
        socket.nsp.name,
      );
      if (meta) {
        // Create a request context
        const reqCtx = new Context(this);
        // Bind websocket
        reqCtx.bind('ws.socket').to(socket);
        // Instantiate the controller instance
        await new WebSocketControllerFactory(reqCtx, ControllerClass).create(socket);
      }
    });
    return nsp;
  }

  /**
   * Start the websocket server
   */
  async start(httpServer: HttpServer) {
    console.log("WS Start Called");
    //await httpServer.start();
    this.io.attach(httpServer.server, this.options.websocket);
    this.ctx.bind('ws.server').to(this.io);
  }

  /**
   * Stop the websocket server
   */
  async stop() {
    const close = new Promise<void>((resolve, reject) => {
      this.io.close(() => {
        resolve();
      });
    });
    await close;
  }
}
