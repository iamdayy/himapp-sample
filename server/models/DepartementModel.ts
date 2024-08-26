import mongoose, { Schema, Types } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { IDepartementSchema } from "~/types/ISchemas";
import { PeriodSchema } from "./AdministratorModel";
import { ProfileModel } from "./ProfileModel";

/**
 * Schema definition for the Departement model.
 */
const departementSchema = new Schema<IDepartementSchema>({
  /**
   * Reference to the associated Profile.
   * Auto-populated with selected fields for active profiles.
   */
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
  /**
   * Name of the department.
   */
  departement: {
    type: String,
    required: true,
  },
  /**
   * Time period associated with the department.
   */
  period: {
    type: PeriodSchema,
    required: true,
  },
});

// Enable auto-population for referenced documents
departementSchema.plugin(mongooseAutoPopulate);

/**
 * Mongoose model for the Departement collection.
 */
export const DepartementModel = mongoose.model<IDepartementSchema>(
  "Departement",
  departementSchema
);
