import { QuestionModel } from "~/server/models/QuestionModel";
import type { ITagsResponse } from "~/types/IResponse";
export default defineEventHandler(async (event): Promise<ITagsResponse> => {
  try {
    const questions = await QuestionModel.find().select("tags");
    if (!questions) {
      return { statusCode: 404, statusMessage: "No questions found" };
    }
    return {
      statusCode: 200,
      statusMessage: "Tags fetched successfully",
      data: {
        tags: questions.map((question) => question.tags).flat(),
        length: questions.length,
      },
    };
  } catch (error) {
    return { statusCode: 500, statusMessage: "Failed to fetch tags" };
  }
});
