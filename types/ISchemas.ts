import type { Document } from "mongoose";
import type {
  IAddress,
  IAdministrator,
  IAdministratorMember,
  IAgenda,
  ICommittee,
  IContributor,
  IDailyManagement,
  IDepartement,
  IDepartment,
  IOrganizer,
  IPost,
  IProfile,
  IProject,
  IRegistered,
  ISession,
  IUser,
} from ".";

/**
 * Extends the IUser interface with Document and adds a password field.
 */
export interface IUserSchema extends Omit<IUser, "id">, Document {
  password: string;
}

/**
 * Extends the ISession interface with Document and adds timestamp fields.
 */
export interface ISessionSchema extends ISession, Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extends the IProfile interface with Document and adds timestamp fields.
 */
export interface IProfileSchema extends Omit<IProfile, "id">, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizerSchema extends Omit<IOrganizer, "id">, Document {}

export interface IDailyManagementSchema
  extends Omit<IDailyManagement, "id">,
    Document {}

export interface IDepartmentSchema extends Omit<IDepartment, "id">, Document {}

// TODO: DELETE THIS

/**
 * Extends the IDepartement interface with Document.
 */
export interface IDepartementSchema extends IDepartement, Document {}

/**
 * Extends the IAdministratorMember interface with Document.
 */
export interface IAdministratorMemberSchema
  extends IAdministratorMember,
    Document {}

/**
 * Extends the IAdministrator interface with Document.
 */
export interface IAdministratorSchema extends IAdministrator, Document {}

/**
 * Extends the IAddress interface with Document.
 */
export interface IAddressSchema extends IAddress, Document {}

/**
 * Extends the IRegistered interface with Document.
 */
export interface IRegisteredSchema extends IRegistered, Document {}

/**
 * Extends the ICommittee interface with Document.
 */
export interface ICommitteeSchema extends ICommittee, Document {}

/**
 * Extends the IEvent interface with Document and adds timestamp fields.
 */
export interface IAgendaSchema extends Omit<IAgenda, "_id">, Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extends the IContributor interface with Document.
 */
export interface IContributorSchema extends IContributor, Document {}

/**
 * Extends the IProject interface with Document and adds timestamp fields.
 */
export interface IProjectSchema extends Omit<IProject, "_id">, Document {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extends the IPost interface with Document.
 */
export interface IPostSchema extends IPost, Document {}
