import { RequestContext } from "../models";

declare global {
  // eslint-disable-next-line  @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      context: RequestContext;
    }
  }
}

declare module 'http' {
  export interface IncomingMessage {
    context: RequestContext;
  }
}
