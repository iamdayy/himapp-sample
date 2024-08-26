import mongoose, { Schema } from "mongoose";
import { IAddressSchema, IProfileSchema } from "~/types/ISchemas";
import { EventModel } from "./EventModel";
import { ProjectModel } from "./ProjectModel";
import { UserModel } from "./UserModel";

/**
 * Schema for representing an address.
 */
const AddressSchema = new Schema<IAddressSchema>({
  fullAddress: String,
  village: String,
  district: String,
  city: String,
  province: String,
  country: String,
  zip: Number,
});

/**
 * Schema for representing a user profile.
 */
const profileSchema = new Schema<IProfileSchema>(
  {
    NIM: {
      type: Number,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    class: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    birth: {
      type: {
        place: String,
        date: Date,
      },
      required: true,
    },
    sex: {
      type: String,
      required: true,
      enum: ["female", "male"],
    },
    religion: {
      type: String,
      required: true,
    },
    citizen: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: AddressSchema,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "free", "deleted"],
      default: "free",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
      getters: true,
    },
  }
);

/**
 * Virtual field to get the year when the profile was created.
 */
profileSchema.virtual("enteredYear").get(function (this: IProfileSchema) {
  return new Date(this.createdAt).getFullYear();
});

/**
 * Virtual field to get the projects associated with the profile.
 */
profileSchema.virtual("projects", {
  ref: "Project",
  localField: "_id",
  foreignField: "registered.profile",
  match: {
    deadline: { $gte: new Date() },
  },
});

/**
 * Virtual field to get the events associated with the profile.
 */
profileSchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "registered.profile",
  match: {
    date: { $gte: new Date() },
  },
});

/**
 * Virtual field to check if the profile is an administrator.
 */
profileSchema.virtual("isAdministrator", {
  ref: "Administrator",
  localField: "_id",
  foreignField: "AdministratorMembers.profile",
  justOne: true,
  match: {
    "period.end": { $gte: new Date() },
  },
});

/**
 * Virtual field to check if the profile belongs to a department.
 */
profileSchema.virtual("isDepartement", {
  ref: "Departement",
  localField: "_id",
  foreignField: "profile",
  justOne: true,
  match: {
    "period.end": { $gte: new Date() },
  },
});

// Create a text index for searching profiles
profileSchema.index({ NIM: "text", fullName: "text", email: "text" });

/**
 * Post-save middleware to handle profile deletion.
 * Removes the profile from associated projects, events, and deletes the user.
 */
profileSchema.post("save", async function (next) {
  const profile = this;
  const profileId = this._id;
  if (profile.status == "deleted") {
    await ProjectModel.updateMany(
      {
        $or: [
          { "contributors.profile": profileId },
          { "registered.profile": profileId },
        ],
      },
      {
        $pull: {
          contributors: { profile: profileId },
          registered: { profile: profileId },
        },
      }
    );
    await EventModel.updateMany(
      {
        $or: [
          { "committee.user": profileId },
          { "registered.profile": profileId },
        ],
      },
      {
        $pull: {
          committee: { user: profileId },
          registered: { profile: profileId },
        },
      }
    );
    await UserModel.findOneAndDelete({ profile: profileId });
  }
});

/**
 * Mongoose model for the Profile collection.
 */
export const ProfileModel = mongoose.model<IProfileSchema>(
  "Profile",
  profileSchema
);
