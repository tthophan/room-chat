import { RequestContext } from "../models";

declare global {
  // eslint-disable-next-line  @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      context: RequestContext;
    }
  }
}
