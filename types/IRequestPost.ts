import type { SortOrder } from "mongoose";
import type { IEvent, IProfile } from ".";

interface IReqQueryPaginate {
  perPage: number;
  page: number;
}

export interface IReqRegister {
  username: string;
  NIM: number;
  password: string;
}

export interface IReqLogin {
  username: string;
  password: string;
}

export interface IReqAuth extends IReqRegister, IReqLogin {
  password_confirmation: string;
}

export interface IReqProfileQuery extends IReqQueryPaginate {
  NIM: number;
  search: string;
  sort: "enteredYear" | "class" | "semester" | "fullName" | "createdAt";
  order: SortOrder;
  email: string;
  filterBy: "enteredYear" | "class" | "semester";
  filter: string;
  deleted: "false" | "true";
}

export interface IReqProfile extends IProfile {}

export interface IReqEvent extends IEvent {}

export interface IReqProjectQuery extends IReqQueryPaginate {
  id: string;
}
export interface IReqPostQuery extends IReqQueryPaginate {
  sort: string;
  order: string;
  slug: string;
}
