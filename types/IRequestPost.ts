import type { SortOrder } from "mongoose";
import type { IAgenda, IFile, IMember, INews, IPhoto, IQuestion } from ".";

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
 * Interface for member query parameters, extending pagination.
 */
export interface IReqMemberQuery extends IReqQueryPaginate {
  /** User's NIM for filtering. */
  NIM: number;
  /** Search term for filtering members. */
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
  /** Whether to include deleted members. */
  deleted: "false" | "true";
}

/**
 * Interface for member request, extending IMember.
 */
export interface IReqMember extends IMember {}

/**
 * Interface for member avatar request, extending IMember.
 */
export interface IReqMemberAvatar {
  avatar: IFile;
}

/**
 * Interface for event request, extending IEvent.
 */
export interface IReqAgenda extends IAgenda {}

/**
 * Interface for project query parameters, extending pagination.
 */
export interface IReqProjectQuery extends IReqQueryPaginate {
  /** Project ID for filtering. */
  id: string;

  /** Show missed project */
  showMissed: string;
  /** Field to sort the results by. */
  sort: string;
  /** Sort order. */
  order: SortOrder;
}

/**
 * Interface for news query parameters, extending pagination.
 */
export interface IReqNewsQuery extends IReqQueryPaginate {
  /** Field to sort the results by. */
  sort: string;
  /** Sort order. */
  order: string;
  /** News slug for filtering. */
  slug: string;
  /** Category for filtering. */
  category: string;
  /** Tags for filtering. */
  tags: string;
  /** Search term for filtering news. */
  search: string;
}

/**
 * Interface for news request, extending INews.
 */
export interface IReqNews extends INews {}

export interface IReqQuestionQuery extends IReqQueryPaginate {
  /** Field to sort the results by. */
  sort: string;
  /** Sort order. */
  order: string;
  /** Question ID for filtering. */
  id: string;
  /** Tags for filtering. */
  tags: string[];
  /** Search term for filtering questions. */
  search: string;
  /** Whether to filter by answered questions. */
  answered: string;
  /** Whether to filter by unanswered questions. */
  unanswered: string;
}

export interface IReqPhoto extends IPhoto {}
export interface IReqPhotoQuery extends IReqQueryPaginate {
  /** Field to sort the results by. */
  sort: string;
  /** Sort order. */
  order: string;
  /** Photo ID for filtering. */
  id: string;
}

export interface IReqQuestion extends IQuestion {
  isAnonymous: boolean;
}
