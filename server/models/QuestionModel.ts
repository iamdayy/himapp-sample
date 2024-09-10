import { Schema, model } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { IQuestionSchema } from "~/types/ISchemas";

const questionSchema = new Schema<IQuestionSchema>(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        required: true,
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
      autopopulate: {
        select: "NIM fullName avatar class semester enteredYear",
      },
    },
    votes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "Profile",
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
    answers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
        autopopulate: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ title: "text", tags: "text", body: "text" });
questionSchema.plugin(mongooseAutoPopulate);

export const QuestionModel = model("Question", questionSchema);
