import { SortOrder } from "mongoose";
import { QuestionModel } from "~/server/models/QuestionModel";
import { IReqQuestionQuery } from "~/types/IRequestPost";

type ISortable = {
  [key: string]: SortOrder;
};

export default defineEventHandler(async (event) => {
  try {
    const { page, perPage, order, sort, tags, search, answered, unanswered } =
      getQuery<IReqQuestionQuery>(event);
    let query: any = {};
    let sortOpt: ISortable = {};
    if (order && sort) {
      sortOpt[sort] = order as SortOrder;
    }
    if (tags) {
      query.tags = { $in: tags };
    }
    if (search) {
      query.$text = { $search: search };
    }
    if (answered === "true") {
      query.answers = { $exists: true };
    }
    if (unanswered === "true") {
      query.answers = { $exists: false };
    }
    console.log(query);
    const length = await QuestionModel.countDocuments(query);
    const questions = await QuestionModel.find(query)
      .sort(sortOpt)
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));
    return {
      statusCode: 200,
      statusMessage: "Questions fetched successfully",
      data: questions,
      length,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
