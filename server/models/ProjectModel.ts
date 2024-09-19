import mongoose, { Schema, Types } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import {
  IContributorSchema,
  IProjectSchema,
  IRegisteredSchema,
} from "~/types/ISchemas";

/**
 * Schema for representing a contributor to a project.
 */
const contributorSchema = new Schema<IContributorSchema>({
  member: {
    type: Types.ObjectId,
    required: true,
    ref: "Member",
    autopopulate: {
      select: "NIM avatar fullName email class semester createdAt",
      match: {
        status: "active",
      },
    },
  },
  job: {
    type: String,
    required: true,
  },
});

/**
 * Schema for representing a registered participant in a project.
 */
const registeredSchema = new Schema<IRegisteredSchema>({
  member: {
    type: Types.ObjectId,
    required: true,
    ref: "Member",
    autopopulate: {
      select: "NIM avatar fullName email class semester createdAt",
      match: {
        status: "active",
      },
    },
  },
  task: {
    type: String,
  },
});

/**
 * Schema for representing a project.
 */
const projectSchema = new Schema<IProjectSchema>(
  {
    /**
     * The title of the project.
     */
    title: {
      type: String,
      required: true,
    },
    /**
     * The deadline for the project.
     */
    deadline: {
      type: Date,
      required: true,
    },
    /**
     * A description of the project.
     */
    description: {
      type: String,
      required: true,
    },
    /**
     * Defines who can see the project.
     */
    canSee: {
      type: String,
      default: "All",
      enum: ["Admin", "Departement", "Internal", "All", "External", "No"],
    },
    /**
     * An array of contributors to the project.
     */
    contributors: {
      type: [contributorSchema],
      default: [],
    },
    /**
     * An array of tasks associated with the project.
     */
    tasks: {
      type: [String],
    },
    /**
     * Defines who can register for the project.
     */
    canRegister: {
      type: String,
      default: "No",
      enum: ["Admin", "Departement", "Internal", "All", "External", "No"],
    },
    /**
     * An array of registered participants for the project.
     */
    registered: {
      type: [registeredSchema],
      default: [],
    },
    /**
     * The date when the project was created.
     */
    createdAt: Date,
    /**
     * The date when the project was last updated.
     */
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Enable auto-population for referenced documents
projectSchema.plugin(mongooseAutoPopulate);

/**
 * Mongoose model for the Project collection.
 */
export const ProjectModel = mongoose.model<IProjectSchema>(
  "Project",
  projectSchema
);
