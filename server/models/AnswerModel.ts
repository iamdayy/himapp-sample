import { Schema, model } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { IAnswerSchema } from "~/types/ISchemas";

const answerSchema = new Schema<IAnswerSchema>(
  {
    body: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: false,
      autopopulate: true,
    },
    votes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "Member",
          required: false,
          autopopulate: true,
        },
        voteType: {
          type: String,
          enum: ["upvote", "downvote"],
          required: true,
        },
      },
    ],
    totalVotes: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

answerSchema.plugin(mongooseAutoPopulate);

export const AnswerModel = model<IAnswerSchema>("Answer", answerSchema);
