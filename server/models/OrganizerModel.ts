import mongoose, { Schema } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import {
  IDailyManagementSchema,
  IDepartmentSchema,
  IOrganizerSchema,
} from "~/types/ISchemas";
import { ProfileModel } from "./ProfileModel";

const DailyManagementSchema = new Schema<IDailyManagementSchema>({
  position: {
    type: String,
    required: true,
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
    autopopulate: {
      model: ProfileModel,
      select: "NIM avatar fullName email class semester createdAt",
      match: {
        status: "active",
      },
    },
  },
});

const DepartmentSchema = new Schema<IDepartmentSchema>({
  name: {
    type: String,
    required: true,
  },
  coordinator: {
    type: Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
    autopopulate: {
      model: ProfileModel,
      select: "NIM avatar fullName email class semester createdAt",
      match: {
        status: "active",
      },
    },
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      autopopulate: {
        model: ProfileModel,
        select: "NIM avatar fullName email class semester createdAt",
        match: {
          status: "active",
        },
      },
    },
  ],
});

const OrganizerSchema = new Schema<IOrganizerSchema>({
  dailyManagement: [DailyManagementSchema],
  department: [DepartmentSchema],
  period: {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
});

OrganizerSchema.plugin(mongooseAutoPopulate);

export default mongoose.model<IOrganizerSchema>("Organizer", OrganizerSchema);
