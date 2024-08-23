import { PostModel } from "~/server/models/PostModel";
import { IReqPostQuery } from "~/types/IRequestPost";

export default defineEventHandler(async (event) => {
  try {
    const { slug } = getQuery<IReqPostQuery>(event);
    const post = await PostModel.findOne({ slug }, {}, { autopopulate: false });
    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }
    if (!post.published) {
      const user = await ensureAuth(event);
      if (!user.profile.isAdministrator && !user.profile.isDepartement) {
        throw createError({
          statusCode: 403,
          statusMessage:
            "You must be administrator or departement to use this endpoint",
        });
      } else {
        post.published = true;
        post.publishedAt = new Date();
        await post.save();
        return {
          statusCode: 200,
          statusMessage: `Post ${post.title} is published`,
        };
      }
    }
    return {
      statusCode: 400,
      statusMessage: `Post ${post.title} already published`,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
});
