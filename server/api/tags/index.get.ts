import { QuestionModel } from "~/server/models/QuestionModel";
import type { ITagsResponse } from "~/types/IResponse";
export default defineEventHandler(async (event): Promise<ITagsResponse> => {
  try {
    const questions = await QuestionModel.find().select("tags");
    if (!questions) {
      return { statusCode: 404, statusMessage: "No questions found", data: [] };
    }
    return {
      statusCode: 200,
      statusMessage: "Tags fetched successfully",
      data: questions.map((question) => question.tags).flat(),
    };
  } catch (error) {
    return { statusCode: 500, statusMessage: "Failed to fetch tags", data: [] };
  }
});
