export type MessageParam = {
  cursor?: number;
  limit?: number;
  roomId: number;
};
export type CreateMessage = {
  message: string;
  roomId: number;
  senderId: number;
};
export type DeleteMessage = {
  roomId: number;
  senderId: number;
  id: number;
};
