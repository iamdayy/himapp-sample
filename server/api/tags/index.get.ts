import { QuestionModel } from "~/server/models/QuestionModel";

export default defineEventHandler(async (event) => {
  try {
    const questions = await QuestionModel.find().select("tags");
    if (!questions) {
      return { status: 404, statusMessage: "No questions found", data: [] };
    }
    return {
      status: 200,
      statusMessage: "Tags fetched successfully",
      data: questions.map((question) => question.tags).flat(),
    };
  } catch (error) {
    console.error(error);
    return { status: 500, statusMessage: "Failed to fetch tags", data: [] };
  }
});
