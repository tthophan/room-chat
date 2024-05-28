export class UserInfo {
  [k: string]: any;
  // TODO add some information
}
export class RequestContext {
  cid: string;
  requestTimestamp: number;
  accessToken: string;
  userInfo: UserInfo;
  constructor(data: Partial<RequestContext>) {
    Object.assign(this, data);
  }
}
