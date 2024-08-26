import mongoose, { Schema, Types } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import {
  ICommitteeSchema,
  IEventSchema,
  IRegisteredSchema,
} from "~/types/ISchemas";

/**
 * Schema for representing a committee member.
 */
const CommitteeSchema = new Schema<ICommitteeSchema>({
  job: {
    type: String,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    required: true,
    ref: "Profile",
    autopopulate: {
      select: "NIM avatar fullName email class semester createdAt",
      match: {
        status: "active",
      },
    },
  },
});

/**
 * Schema for representing a registered participant.
 */
const registeredSchema = new Schema<IRegisteredSchema>({
  profile: {
    type: Types.ObjectId,
    required: true,
    ref: "Profile",
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
 * Schema for representing an event.
 */
const eventSchema = new Schema<IEventSchema>(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    at: {
      type: String,
      required: true,
    },
    canSee: {
      type: String,
      default: "All",
      enum: ["Admin", "Departement", "Internal", "All", "External", "No"],
    },
    description: {
      type: String,
    },
    committee: [CommitteeSchema],
    canRegister: {
      type: String,
      default: "No",
      enum: ["Admin", "Departement", "Internal", "All", "External", "No"],
    },
    registered: [registeredSchema],
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Enable auto-population for referenced documents
eventSchema.plugin(mongooseAutoPopulate);

/**
 * Mongoose model for the Event collection.
 */
export const EventModel = mongoose.model<IEventSchema>("Event", eventSchema);
