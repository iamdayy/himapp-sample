import { AnswerModel } from "~/server/models/AnswerModel";
import { QuestionModel } from "~/server/models/QuestionModel";
import { IMember } from "~/types";
import type { IResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const questionId = event.context.params?.id;
    const answerId = event.context.params?.answerId;

    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }

    if (!questionId || !answerId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Question ID and Answer ID are required",
      });
    }

    const question = await QuestionModel.findById(questionId);
    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: "Question not found",
      });
    }

    const answer = await AnswerModel.findById(answerId);
    if (!answer) {
      throw createError({
        statusCode: 404,
        statusMessage: "Answer not found",
      });
    }

    if (!answer.author || (answer.author as IMember).NIM !== user.member.NIM) {
      throw createError({
        statusCode: 403,
        statusMessage: "You are not authorized to delete this answer",
      });
    }

    await AnswerModel.findByIdAndDelete(answerId);

    return {
      statusCode: 200,
      statusMessage: "Answer deleted successfully",
    };
  } catch (error) {
    return {
      statusCode: 500,
      statusMessage: "Internal server error",
    };
  }
});
