import { QuestionModel } from "~/server/models/QuestionModel";
import { IProfile } from "~/types";
import type { IResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const { id } = event.context.params as { id: string };
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }
    const question = await QuestionModel.findById(id);
    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: "Question not found",
      });
    }
    if (
      !question.author ||
      (question.author as IProfile).NIM !== user.profile.NIM
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: "You are not authorized to delete this question",
      });
    }
    await QuestionModel.findByIdAndDelete(id);
    return {
      statusCode: 200,
      statusMessage: "Question deleted successfully",
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      statusMessage: error.message,
    };
  }
});
