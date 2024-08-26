import type { IPost, IProfile, IProject, IUser } from ".";

/**
 * Interface representing a paginated response.
 */
interface IPaginateResponse {
  /** The total number of items in the response. */
  length: number;
}

/**
 * Interface representing the response for a user registration.
 * Extends the IUser interface to include all user information.
 */
export interface IRegisterResponse extends IUser {}

/**
 * Interface representing the response for a project query.
 * Extends IPaginateResponse to include pagination information.
 */
export interface IProjectResponse extends IPaginateResponse {
  /** An array of projects matching the query. */
  projects: IProject[];
}

/**
 * Interface representing the response for a profile query.
 * Extends IPaginateResponse to include pagination information.
 */
export interface IProfileResponse extends IPaginateResponse {
  /** An array of available filter options. */
  filters: string[];
  /** An array of profiles matching the query. */
  profiles: IProfile[];
}

/**
 * Interface representing the response for a post query.
 * Extends IPaginateResponse to include pagination information.
 */
export interface IPostResponse extends IPaginateResponse {
  /** An array of posts matching the query. */
  posts: IPost[];
}
