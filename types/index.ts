import { Types } from "mongoose";

/**
 * Defines the possible roles for users in the system.
 */
export type TRole =
  | "Admin"
  | "Departement"
  | "Internal"
  | "All"
  | "External"
  | "No";

export type IConfig = {
  dailyManagements: string[];
  departments: string[];
};

export interface IFile {
  name: string;
  content: string;
  size: string;
  type: string;
  lastModified: string;
}

/**
 * Represents a link with a name, href, and optional current status.
 */
export interface ILink {
  name: string;
  href: string;
  current?: boolean;
}

/**
 * Represents an address with detailed location information.
 */
export interface IAddress {
  fullAddress: string;
  village: string;
  district: string;
  city: string;
  province: string;
  country: string;
  zip: number;
}

/**
 * Represents a user member with personal and academic information.
 */
export interface IMember {
  id?: string;
  NIM: number;
  fullName: string;
  avatar?: string;
  class: string;
  semester: number;
  birth: {
    place: string;
    date: Date;
  };
  sex: "female" | "male";
  religion: string;
  citizen: string;
  phone: string;
  email: string;
  address: IAddress;
  status?: "active" | "inactive" | "free" | "deleted";
  enteredYear?: number;
  agendas?: IAgenda[];
  projects?: IProject[];
  organizer?: IOrganizer;
  organizersDailyManagement?: IOrganizer[];
  organizersDepartmentCoordinator?: IOrganizer[];
  organizersDepartmentMembers?: IOrganizer[];
}

/**
 * Represents a user account with authentication information.
 */
export interface IUser {
  member: IMember;
  username: string;
  key?: string;
  token?: string;
}

/**
 * Represents a user session with authentication tokens.
 */
export interface ISession {
  token: string;
  refreshToken: string;
  user: Types.ObjectId | IUser;
}

/**
 * Represents a time period with start and end dates.
 */
export interface IPeriod {
  start: Date;
  end: Date;
}

/**
 * Represents an organizer with daily management and department details.
 */

export interface IDailyManagement {
  position: string;
  member: Types.ObjectId | IMember | number;
}

export interface IDepartment {
  name: string;
  coordinator: Types.ObjectId | IMember | number;
  members: Types.ObjectId[] | IMember[] | number[];
}

export interface IOrganizer {
  _id?: string;
  council: {
    name: string;
    image: string | IFile;
    position: string;
  }[];
  advisor: {
    name: string;
    image: string | IFile;
    position: string;
  };
  considerationBoard: IMember[] | number[] | Types.ObjectId[];
  dailyManagement: IDailyManagement[];
  department: IDepartment[];
  period: IPeriod;
}
/**
 * Represents a committee member for an event.
 */
export interface ICommittee {
  job: string;
  user: IMember | string | number;
}

/**
 * Represents a contributor to a project.
 */
export interface IContributor {
  member: IMember | Types.ObjectId | number | string;
  job: string;
}

/**
 * Represents a registered participant for an event or project.
 */
export interface IRegistered {
  member: Types.ObjectId | IMember | number;
  task?: string;
}

/**
 * Represents an agenda with details, committee, and registration information.
 */
export interface IAgenda {
  _id?: number | string;
  title: string;
  date: Date;
  at: string;
  canSee: TRole;
  description: string;
  committee: ICommittee[];
  canRegister: TRole;
  registered?: IRegistered[];
}

/**
 * Represents a project with details, contributors, and registration information.
 */
export interface IProject {
  _id?: string;
  title: string;
  deadline: Date;
  description: string;
  canSee: TRole;
  contributors?: IContributor[];
  canRegister: TRole;
  tasks?: string[];
  registered?: IRegistered[];
}

/**
 * Represents a blog news with content, author, and publishing information.
 */
export interface INews {
  title: string;
  mainImage: string | IFile; // URL of the main image
  body: string;
  slug?: string;
  category: {
    title: string;
    description: string;
  };
  author?: Types.ObjectId | IMember | number;
  published?: boolean;
  publishedAt?: Date;
  tags?: string[];
  related?: INews[]; // Virtual field for related newss
}

export interface IPhoto {
  _id?: string;
  title: string;
  image: string | IFile;
}

export interface IVote {
  user: Types.ObjectId | IMember;
  voteType: "upvote" | "downvote";
}

export interface IQuestion {
  _id?: string;
  title: string;
  body: string;
  tags: string[];
  author: Types.ObjectId | IMember;
  createdAt: Date;
  updatedAt: Date;
  votes: IVote[];
  totalVotes: number;
  answers: IAnswer[] | Types.ObjectId[];
}

export interface IAnswer {
  _id?: string;
  body: string;
  author: Types.ObjectId | IMember;
  createdAt: Date;
  updatedAt: Date;
  votes: IVote[];
  totalVotes: number;
  isAccepted: boolean;
}

export interface IComment {
  _id?: string;
  body: string;
  author: Types.ObjectId | IMember;
  createdAt: Date;
  updatedAt: Date;
}

export interface IForm {
  title: string;
  description: string;
  by: IMember | Types.ObjectId | number;
  questions: IQuestion[];
  invites: IMember[] | number[] | Types.ObjectId;
  public: boolean;
  answers: IAnswer[];
}
