import type { IPost, IProfile, IProject, IUser } from ".";

interface IPaginateResponse {
  length: number;
}

export interface IRegisterResponse extends IUser {}
export interface IProjectResponse extends IPaginateResponse {
  projects: IProject[];
}

export interface IProfileResponse extends IPaginateResponse {
  filters: string[];
  profiles: IProfile[];
}
export interface IPostResponse extends IPaginateResponse {
  posts: IPost[];
}
