import {Constructor} from "@loopback/context";
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {Namespace} from "socket.io";
import {WebSocketServer} from "./websocket.server";

export {ApplicationConfig};

export class WebsocketApplication extends RestApplication {
  readonly wsServer: WebSocketServer;
  constructor(options: ApplicationConfig = {}) {
    super(options);
    console.log("Rest Application Created");
    this.wsServer = new WebSocketServer(this, options.websocket);
  }

  public websocketRoute(controllerClass: Constructor<any>, namespace?: string | RegExp): Namespace {
    return this.wsServer.route(controllerClass, namespace) as Namespace;
  }

  public async start(): Promise<void> {
    console.log("Starting RS");
    await super.start();
    console.log("Started RS");
    console.log("WS App Start Called");
    if (this.restServer.httpServer?.listening) {
      await this.wsServer.start(this.restServer.httpServer);
    }
  }

  public async stop(): Promise<void> {
    await this.wsServer.stop();
    await super.stop();
  }
}
