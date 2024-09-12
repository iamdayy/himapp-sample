import { QuestionModel } from "~/server/models/QuestionModel";
import { IQuestion } from "~/types";
import type { IQuestionDetailResponse } from "~/types/IResponse";

export default defineEventHandler(
  async (event): Promise<IQuestionDetailResponse> => {
    try {
      const { id } = event.context.params as { id: string };
      const question = await QuestionModel.findById(id);
      if (!question) {
        throw createError({
          statusCode: 404,
          statusMessage: "Question not found",
        });
      }
      return {
        statusCode: 200,
        statusMessage: "Question found",
        data: question as IQuestion,
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }
);
