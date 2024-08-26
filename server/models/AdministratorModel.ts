import { Schema, Types, model } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { IPeriod } from "~/types";
import {
  IAdministratorMemberSchema,
  IAdministratorSchema,
} from "~/types/ISchemas";
import { ProfileModel } from "./ProfileModel";

/**
 * Schema for representing a time period.
 */
export const PeriodSchema = new Schema<IPeriod>({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
});

/**
 * Schema for representing an administrator member.
 */
export const AdministratorMemberSchema = new Schema<IAdministratorMemberSchema>(
  {
    role: {
      type: String,
      required: true,
    },
    profile: {
      type: Types.ObjectId,
      required: true,
      ref: "Profile",
      autopopulate: {
        model: ProfileModel,
        select: "NIM avatar fullName email class semester createdAt",
        match: {
          status: "active",
        },
      },
    },
  }
);

/**
 * Schema for representing an administrator.
 */
const AdministratorSchema = new Schema<IAdministratorSchema>({
  AdministratorMembers: {
    type: [AdministratorMemberSchema],
    required: true,
  },
  period: {
    type: PeriodSchema,
    required: true,
  },
});

// Enable auto-population for referenced documents
AdministratorSchema.plugin(mongooseAutoPopulate);

/**
 * Mongoose model for the Administrator collection.
 */
export const AdministratorModel = model<IAdministratorSchema>(
  "Administrator",
  AdministratorSchema
);
