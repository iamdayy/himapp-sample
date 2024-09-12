import { AnswerModel } from "~/server/models/AnswerModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IProfile } from "~/types";
import { IVoteResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IVoteResponse> => {
  try {
    const answerId = event.context.params?.id;
    const { voteType } = await readBody(event);

    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }

    if (!answerId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Answer ID is required",
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

    const answer = await AnswerModel.findById(answerId);

    if (!answer) {
      throw createError({
        statusCode: 404,
        statusMessage: "Answer not found",
      });
    }

    // Check if user has already voted
    const existingVoteIndex = answer.votes.findIndex(
      (vote) => (vote.user as IProfile).NIM === user.profile.NIM
    );

    if (existingVoteIndex !== -1) {
      // User has already voted, update the vote
      const existingVote = answer.votes[existingVoteIndex];
      if (existingVote.voteType === voteType) {
        // Remove vote if it's the same type
        answer.votes.splice(existingVoteIndex, 1);
      } else {
        // Change vote type
        existingVote.voteType = voteType;
      }
    } else {
      const profile = await ProfileModel.findOne({ NIM: user.profile.NIM });
      // Add new vote
      answer.votes.push({ user: profile?._id as any, voteType });
    }

    // Recalculate total votes
    const upvotes = answer.votes.filter(
      (vote) => vote.voteType === "upvote"
    ).length;
    const downvotes = answer.votes.filter(
      (vote) => vote.voteType === "downvote"
    ).length;
    answer.totalVotes = upvotes - downvotes;

    await answer.save();

    return {
      statusCode: 200,
      statusMessage: "Vote recorded successfully",
      totalVotes: answer.totalVotes,
    };
  } catch (error) {
    console.error("Error voting on answer:", error);
    return {
      statusCode: 500,
      statusMessage: "Internal server error",
    };
  }
});
