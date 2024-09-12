import { ProfileModel } from "~/server/models/ProfileModel";
import { QuestionModel } from "~/server/models/QuestionModel";
import { IReqQuestion } from "~/types/IRequestPost";
import type { IResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const { title, body, tags, isAnonymous } = await readBody<IReqQuestion>(
      event
    );
    const user = event.context.user;
    const author = await ProfileModel.findOne({ NIM: user.profile.NIM });
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }
    if (!author) {
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to find author",
      });
    }
    const question = await QuestionModel.create({
      title,
      body,
      tags,
      author: isAnonymous ? undefined : author._id,
    });
    if (!question) {
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to create question",
      });
    }
    return {
      statusCode: 201,
      statusMessage: "Question created successfully",
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      statusMessage: error.message,
    };
  }
});
