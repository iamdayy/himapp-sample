import type { SortOrder } from "mongoose";
import type { IEvent, IProfile } from ".";

/**
 * Interface for pagination query parameters.
 */
interface IReqQueryPaginate {
  /** Number of items per page. */
  perPage: number;
  /** Current page number. */
  page: number;
}

/**
 * Interface for user registration request.
 */
export interface IReqRegister {
  /** User's chosen username. */
  username: string;
  /** User's NIM (Nomor Induk Mahasiswa). */
  NIM: number;
  /** User's chosen password. */
  password: string;
}

/**
 * Interface for user login request.
 */
export interface IReqLogin {
  /** User's username. */
  username: string;
  /** User's password. */
  password: string;
}

/**
 * Interface for authentication request, combining registration and login.
 */
export interface IReqAuth extends IReqRegister, IReqLogin {
  /** Confirmation of the user's password. */
  password_confirmation: string;
}

/**
 * Interface for profile query parameters, extending pagination.
 */
export interface IReqProfileQuery extends IReqQueryPaginate {
  /** User's NIM for filtering. */
  NIM: number;
  /** Search term for filtering profiles. */
  search: string;
  /** Field to sort the results by. */
  sort: "enteredYear" | "class" | "semester" | "fullName" | "createdAt";
  /** Sort order (ascending or descending). */
  order: SortOrder;
  /** User's email for filtering. */
  email: string;
  /** Field to filter the results by. */
  filterBy: "enteredYear" | "class" | "semester";
  /** Value to filter by. */
  filter: string;
  /** Whether to include deleted profiles. */
  deleted: "false" | "true";
}

/**
 * Interface for profile request, extending IProfile.
 */
export interface IReqProfile extends IProfile {}

/**
 * Interface for event request, extending IEvent.
 */
export interface IReqEvent extends IEvent {}

/**
 * Interface for project query parameters, extending pagination.
 */
export interface IReqProjectQuery extends IReqQueryPaginate {
  /** Project ID for filtering. */
  id: string;
}

/**
 * Interface for post query parameters, extending pagination.
 */
export interface IReqPostQuery extends IReqQueryPaginate {
  /** Field to sort the results by. */
  sort: string;
  /** Sort order. */
  order: string;
  /** Post slug for filtering. */
  slug: string;
}
