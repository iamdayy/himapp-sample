import bcrypt from "bcrypt";
import mongoose, { Model, Schema, Types } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { IAdministrator, IProfile, IUser } from "~/types";
import { IUserSchema } from "~/types/ISchemas";
import { AdministratorModel } from "./AdministratorModel";
import { DepartementModel } from "./DepartementModel";
import { EventModel } from "./EventModel";
import { ProfileModel } from "./ProfileModel";
import { ProjectModel } from "./ProjectModel";

/**
 * Interface for user methods
 */
interface IUserMethods {
  /**
   * Verifies the provided password against the stored hashed password
   * @param fromBody - The password to verify
   * @param fromDb - The hashed password stored in the database
   * @returns A promise that resolves to a boolean indicating whether the password is correct
   */
  verifyPassword: (fromBody: string, fromDb: string) => Promise<boolean>;
}

/**
 * Mongoose model type for User
 */
type IUserModel = Model<IUser, {}, IUserMethods>;

/**
 * Mongoose schema for User
 */
const userSchema = new Schema<IUserSchema, IUserModel, IUserMethods>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  key: {
    type: String,
  },
  profile: {
    type: Types.ObjectId,
    ref: "Profile",
    autopopulate: {
      match: {
        status: "active",
      },
      model: ProfileModel,
      select: "-_id",
      populate: [
        {
          path: "projects",
          model: ProjectModel,
        },
        {
          path: "events",
          model: EventModel,
        },
        {
          path: "isAdministrator",
          model: AdministratorModel,
          transform: (doc: IAdministrator, id: any) => {
            if (doc) {
              return {
                role: doc.AdministratorMembers.find(
                  (adm) => (adm.profile as IProfile).id == id
                )?.role,
                period: doc.period,
              };
            }
          },
        },
        {
          path: "isDepartement",
          model: DepartementModel,
        },
      ],
    },
  },
});

/**
 * Pre-save middleware to hash the user's password before saving
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error: any) {
    return next(error);
  }
});

/**
 * Method to verify the user's password
 */
userSchema.methods.verifyPassword = async (
  fromBody: string,
  fromDb: string
) => {
  try {
    const isMatch = await bcrypt.compare(fromBody, fromDb);
    return isMatch;
  } catch (error) {
    return false;
  }
};

// Apply the mongooseAutoPopulate plugin to the schema
userSchema.plugin(mongooseAutoPopulate);

/**
 * Mongoose model for User
 */
export const UserModel = mongoose.model("User", userSchema);
