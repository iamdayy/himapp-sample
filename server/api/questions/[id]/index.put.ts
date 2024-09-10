import { QuestionModel } from "~/server/models/QuestionModel";
import { IProfile } from "~/types";
import { IReqQuestion } from "~/types/IRequestPost";
export default defineEventHandler(async (event) => {
  try {
    const { id } = event.context.params as { id: string };
    const { title, body, tags, isAnonymous } = await readBody<IReqQuestion>(
      event
    );
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
        statusMessage: "You are not authorized to update this question",
      });
    }
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(id, {
      title,
      body,
      tags,
      author: isAnonymous ? undefined : user._id,
    });
    if (!updatedQuestion) {
      throw createError({
        statusCode: 404,
        statusMessage: "Question not found",
      });
    }
    return {
      statusCode: 200,
      statusMessage: "Question updated successfully",
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
