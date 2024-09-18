import type { Document } from "mongoose";
import type {
  IAddress,
  IAgenda,
  IAnswer,
  IComment,
  ICommittee,
  IConfig,
  IContributor,
  IDailyManagement,
  IDepartment,
  IForm,
  INews,
  IOrganizer,
  IPhoto,
  IProfile,
  IProject,
  IQuestion,
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
 * Extends the IConfig interface with Document and adds timestamp fields.
 */
export interface IConfigSchema extends IConfig, Document {
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

export interface IOrganizerSchema extends Omit<IOrganizer, "_id">, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailyManagementSchema
  extends Omit<IDailyManagement, "id">,
    Document {}

export interface IDepartmentSchema extends Omit<IDepartment, "id">, Document {}

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
 * Extends the INews interface with Document.
 */
export interface INewsSchema extends INews, Document {
  findRelated: (limit?: number) => Promise<INews[]>;
}

export interface IPhotoSchema extends Omit<IPhoto, "_id">, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestionSchema extends Omit<IQuestion, "_id">, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnswerSchema extends Omit<IAnswer, "_id">, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentSchema extends Omit<IComment, "_id">, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IFormSchema extends Omit<IForm, "_id">, Document {
  createdAt: Date;
  updatedAt: Date;
}
