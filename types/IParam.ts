import { Types } from "mongoose";
export interface ISetSessionParams {
  token: string;
  refreshToken: string;
  user: Types.ObjectId;
}
