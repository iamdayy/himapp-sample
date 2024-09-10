import { AnswerModel } from "~/server/models/AnswerModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { QuestionModel } from "~/server/models/QuestionModel";

export default defineEventHandler(async (event) => {
  try {
    const questionId = event.context.params?.id;
    const { content, isAccepted, isAnonymous } = await readBody<{
      content: string;
      isAccepted: boolean;
      isAnonymous: boolean;
    }>(event);

    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }

    const author = await ProfileModel.findOne({ NIM: user.profile.NIM });
    if (!author) {
      throw createError({
        statusCode: 404,
        statusMessage: "Author not found",
      });
    }

    if (!questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Question ID is required",
      });
    }

    if (!content) {
      throw createError({
        statusCode: 400,
        statusMessage: "Content is required",
      });
    }

    const question = await QuestionModel.findById(questionId);

    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: "Question not found",
      });
    }

    const answer = await AnswerModel.findById(event.context.params?.answerId);

    if (!answer) {
      throw createError({
        statusCode: 404,
        statusMessage: "Answer not found",
      });
    }

    answer.body = content;
    answer.isAccepted = isAccepted;
    answer.author = isAnonymous ? null : (author._id as any);
    await answer.save();

    return {
      statusCode: 200,
      statusMessage: "Answer updated successfully",
      answer: answer,
    };
  } catch (error) {
    console.error("Error updating answer:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
