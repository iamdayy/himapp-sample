import { ProfileModel } from "~/server/models/ProfileModel";
import { QuestionModel } from "~/server/models/QuestionModel";
import { IProfile } from "~/types";
import type { IResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const questionId = event.context.params?.id;
    const { voteType } = await readBody(event);

    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }

    if (!questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Question ID is required",
      });
    }

    if (!user || !voteType) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID and vote type are required",
      });
    }

    if (voteType !== "upvote" && voteType !== "downvote") {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid vote type",
      });
    }

    const question = await QuestionModel.findById(questionId);

    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: "Question not found",
      });
    }

    // Check if user has already voted
    const existingVoteIndex = question.votes.findIndex(
      (vote) => (vote.user as IProfile).NIM === user.profile.NIM
    );

    if (existingVoteIndex !== -1) {
      // User has already voted, update the vote
      const existingVote = question.votes[existingVoteIndex];
      if (existingVote.voteType === voteType) {
        // Remove vote if it's the same type
        question.votes.splice(existingVoteIndex, 1);
      } else {
        // Change vote type
        existingVote.voteType = voteType;
      }
    } else {
      // Add new vote
      const profile = await ProfileModel.findOne({ NIM: user.profile.NIM });
      question.votes.push({ user: profile?._id as any, voteType });
    }

    // Recalculate total votes
    const upvotes = question.votes.filter(
      (vote) => vote.voteType === "upvote"
    ).length;
    const downvotes = question.votes.filter(
      (vote) => vote.voteType === "downvote"
    ).length;
    question.totalVotes = upvotes - downvotes;

    await question.save();

    return {
      statusCode: 200,
      statusMessage: "Vote recorded successfully",
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      statusMessage: error.message,
    };
  }
});
