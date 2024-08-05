import mongoose, { Schema } from "mongoose";
import { IAddressSchema, IProfileSchema } from "~/types/ISchemas";
import { EventModel } from "./EventModel";
import { ProjectModel } from "./ProjectModel";
import { UserModel } from "./UserModel";
const AddressSchema = new Schema<IAddressSchema>({
  fullAddress: String,
  village: String,
  district: String,
  city: String,
  province: String,
  country: String,
  zip: Number,
});

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

profileSchema.virtual("enteredYear").get(function (this: IProfileSchema) {
  return new Date(this.createdAt).getFullYear();
});
profileSchema.virtual("projects", {
  ref: "Project",
  localField: "_id",
  foreignField: "registered.profile",
  match: {
    deadline: { $gte: new Date() },
  },
});
profileSchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "registered.profile",
  match: {
    date: { $gte: new Date() },
  },
});
profileSchema.virtual("isAdministrator", {
  ref: "Administrator",
  localField: "_id",
  foreignField: "AdministratorMembers.profile",
  justOne: true,
  match: {
    "period.end": { $gte: new Date() },
  },
});
profileSchema.virtual("isDepartement", {
  ref: "Departement",
  localField: "_id",
  foreignField: "profile",
  justOne: true,
  match: {
    "period.end": { $gte: new Date() },
  },
});

profileSchema.index({ NIM: "text", fullName: "text", email: "text" });

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

export const ProfileModel = mongoose.model<IProfileSchema>(
  "Profile",
  profileSchema
);
