import mongoose, { Schema } from "mongoose";
import { IAddressSchema, IMemberSchema } from "~/types/ISchemas";
import { AgendaModel } from "./AgendaModel";
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
 * Schema for representing a user member.
 */
const memberSchema = new Schema<IMemberSchema>(
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
 * Virtual field to get the year when the member was created.
 */
memberSchema.virtual("enteredYear").get(function (this: IMemberSchema) {
  return new Date(this.createdAt).getFullYear();
});

/**
 * Virtual field to get the projects associated with the member.
 */
memberSchema.virtual("projects", {
  ref: "Project",
  localField: "_id",
  foreignField: "registered.member",
  match: {
    deadline: { $gte: new Date() },
  },
});

/**
 * Virtual field to get the agendas associated with the member.
 */
memberSchema.virtual("agendas", {
  ref: "Agenda",
  localField: "_id",
  foreignField: "registered.member",
  match: {
    date: { $gte: new Date() },
  },
});

// Virtual for dailyManagement
memberSchema.virtual("organizersDailyManagement", {
  ref: "Organizer",
  localField: "_id",
  foreignField: "dailyManagement.member",
  justOne: true,
  match: {
    "period.end": { $gte: new Date() },
  },
});

// Virtual for department coordinator
memberSchema.virtual("organizersDepartmentCoordinator", {
  ref: "Organizer",
  localField: "_id",
  foreignField: "department.coordinator",
  justOne: true,

  match: {
    "period.end": { $gte: new Date() },
  },
});

// Virtual for department members
memberSchema.virtual("organizersDepartmentMembers", {
  ref: "Organizer",
  localField: "_id",
  foreignField: "department.members",
  justOne: true,
  match: {
    "period.end": { $gte: new Date() },
  },
});

// Combine all organizers
memberSchema.virtual("organizer").get(function () {
  return (
    this.organizersDailyManagement ||
    this.organizersDepartmentCoordinator ||
    this.organizersDepartmentMembers
  );
});

// Create a text index for searching members
memberSchema.index({ NIM: "text", fullName: "text", email: "text" });

/**
 * Post-save middleware to handle member deletion.
 * Removes the member from associated projects, events, and deletes the user.
 */
memberSchema.post("save", async function (next) {
  const member = this;
  const memberId = this._id;
  if (member.status == "deleted") {
    await ProjectModel.updateMany(
      {
        $or: [
          { "contributors.member": memberId },
          { "registered.member": memberId },
        ],
      },
      {
        $pull: {
          contributors: { member: memberId },
          registered: { member: memberId },
        },
      }
    );
    await AgendaModel.updateMany(
      {
        $or: [
          { "committee.user": memberId },
          { "registered.member": memberId },
        ],
      },
      {
        $pull: {
          committee: { user: memberId },
          registered: { member: memberId },
        },
      }
    );
    await UserModel.findOneAndDelete({ member: memberId });
  }
});

/**
 * Mongoose model for the Member collection.
 */
export const MemberModel = mongoose.model<IMemberSchema>(
  "Member",
  memberSchema
);
