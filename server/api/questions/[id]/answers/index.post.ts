import { AnswerModel } from "~/server/models/AnswerModel";
import { MemberModel } from "~/server/models/MemberModel";
import { QuestionModel } from "~/server/models/QuestionModel";
import type { IResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const questionId = event.context.params?.id;
    const { content, isAnonymous } = await readBody<{
      content: string;
      isAnonymous: boolean;
    }>(event);

    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }
    const author = await MemberModel.findOne({ NIM: user.member.NIM });
    if (!questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Question ID is required",
      });
    }

    if (!content || !author) {
      throw createError({
        statusCode: 400,
        statusMessage: "Content and author ID are required",
      });
    }

    const question = await QuestionModel.findById(questionId);

    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: "Question not found",
      });
    }

    const newAnswer = new AnswerModel({
      body: content,
      author: isAnonymous ? undefined : author._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: [],
      isAccepted: false,
    });

    await newAnswer.save();

    question.answers.push(newAnswer._id as any);
    await question.save();

    return {
      statusCode: 201,
      statusMessage: "Answer added successfully",
    };
  } catch (error) {
    console.error("Error adding answer:", error);
    return {
      statusCode: 500,
      statusMessage: "Internal server error",
    };
  }
});
