import { Router, Server } from "@open-rpc/server-js";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { methods } from "../methods";
import cors from "cors";
import { json as jsonParser } from "body-parser";
import { HandleFunction } from "connect";

import openRPCDoc from "../../openrpc.json";
import { Storage } from "./storage";
import jsonSchemaRefParser from "json-schema-ref-parser";
const openRPC = openRPCDoc as any;
/**
 * SignatoryServer - is the server routing side of signatory
 * It instantiates the Signatory server server.
 */
export class SignatoryServer {

  public port: string;
  public storage: Storage;

  constructor(storage: Storage, port: string) {
    this.port = port;
    this.storage = storage;
  }

  /**
   * start - Launches signatory
   */
  public async start() {
    await this.storage.open();
    const methodMapping = methods(this.storage);
    const derefOpenRPCDoc = await jsonSchemaRefParser.dereference(openRPC) as OpenrpcDocument;
    const router = new Router(derefOpenRPCDoc, methodMapping);
    const options = {
      methodMapping,
      openrpcDocument: derefOpenRPCDoc,
      router,
      transportConfigs: this.setupTransport(this.port),
    };
    const server = new Server(options);
    server.start();
  }

  public async stop() {
    this.storage.close();
  }

  private setupTransport(port: string = "8557"): any {
    const corsOptions = { origin: "*" } as cors.CorsOptions;
    return [{
      type: "HTTPTransport", options: {
        middleware: [
          cors(corsOptions) as HandleFunction,
          jsonParser(),
        ],
        port,
      },
    },
    ];
  }

}
