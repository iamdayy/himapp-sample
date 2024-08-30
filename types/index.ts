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
 * Represents a user profile with personal and academic information.
 */
export interface IProfile {
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
  profile: IProfile;
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
  profile: Types.ObjectId | IProfile | number;
}

export interface IDepartment {
  name: string;
  coordinator: Types.ObjectId | IProfile | number;
  members: Types.ObjectId[] | IProfile[] | number[];
}

export interface IOrganizer {
  _id?: string;
  dailyManagement: IDailyManagement[];
  department: IDepartment[];
  period: IPeriod;
}

// TODO: DELETE THIS
/**
 * Represents a department affiliation for a user.
 */
export interface IDepartement {
  profile: Types.ObjectId | IProfile | number;
  departement: string;
  period: IPeriod;
}

/**
 * Represents a member of the administration with their role.
 */
export interface IAdministratorMember {
  role: string;
  profile: Types.ObjectId | IProfile | number;
}

/**
 * Represents the administration structure with members and period.
 */
export interface IAdministrator {
  AdministratorMembers: IAdministratorMember[];
  period: IPeriod;
}

/**
 * Represents a committee member for an event.
 */
export interface ICommittee {
  job: string;
  user: IProfile | string | number;
}

/**
 * Represents a contributor to a project.
 */
export interface IContributor {
  profile: IProfile | Types.ObjectId | number | string;
  job: string;
}

/**
 * Represents a registered participant for an event or project.
 */
export interface IRegistered {
  profile: Types.ObjectId | IProfile | number;
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
 * Represents a blog post with content, author, and publishing information.
 */
export interface IPost {
  title: string;
  mainImage: string; // URL of the main image
  body: string;
  slug?: string;
  categories: {
    title: string;
    description: string;
  }[];
  author?: Types.ObjectId | IProfile | number;
  published?: boolean;
  publishedAt?: Date;
  related?: IPost[]; // Virtual field for related posts
}
