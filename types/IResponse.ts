import type {
  IAgenda,
  IConfig,
  INews,
  IOrganizer,
  IPhoto,
  IProfile,
  IProject,
  IQuestion,
  IUser,
} from ".";

export interface IResponse {
  statusCode: number;
  statusMessage: string;
}

/**
 * Interface representing an error response.
 */
export interface IError extends IResponse {
  /** The data of the error. */
  data?: any;
}

/**
 * Interface representing the response for a user registration.
 * Extends the IUser interface to include all user information.
 */
export interface IRegisterResponse {
  /** The status code of the response. */
  statusCode: number;
  /** The status message of the response. */
  statusMessage: string;
  /** The data of the response. */
  data: IUser;
}

export interface IErrorRegisterResponse extends IError {}

export interface IAgendaResponse extends IResponse {
  /** An array of agendas matching the query. */
  data: IAgenda[];
}

export interface IVoteResponse extends IResponse {
  totalVotes?: number;
}

export interface IConfigResponse extends IResponse {
  data: IConfig;
}

export interface IOrganizerResponse extends IResponse {
  data?: IOrganizer[];
}

export interface IPhotoResponse extends IResponse {
  data?: {
    photos: IPhoto[];
    length: number;
  };
}

/**
 * Interface representing the response for a project query.
 * Extends IPaginateResponse to include pagination information.
 */
export interface IProjectsResponse extends IResponse {
  /** An array of projects matching the query. */
  data?: {
    project?: IProject;
    projects?: IProject[];
    length?: number;
  };
}

/**
 * Interface representing the response for a profile query.
 * Extends IPaginateResponse to include pagination information.
 */
export interface IProfileResponse extends IResponse {
  data: {
    /** An array of available filter options. */
    filters: string[];
    /** An array of profiles matching the query. */
    profiles: IProfile[];
    length: number;
  };
}

/**
 * Interface representing the response for a news query.
 * Extends IPaginateResponse to include pagination information.
 */
export interface INewsResponse extends IResponse {
  /** An array of newss matching the query. */
  data?: {
    news?: INews | INews[];
    length: number;
  };
}

export interface ICategoriesResponse extends IResponse {
  data?: {
    categories: {
      title: string;
      description: string;
    }[];
    length: number;
  };
}

export interface IQuestionResponse extends IResponse {
  /** An array of questions matching the query. */
  data?: {
    questions: IQuestion[];
    length: number;
  };
}

export interface ITagsResponse extends IResponse {
  data?: {
    tags: string[];
    length: number;
  };
}

export interface IQuestionDetailResponse extends IResponse {
  /** An array of questions matching the query. */
  data: IQuestion;
}
