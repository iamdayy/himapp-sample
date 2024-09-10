import { QuestionModel } from "~/server/models/QuestionModel";

export default defineEventHandler(async (event) => {
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
      data: question,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});
