import { PostModel } from "~/server/models/PostModel";
import { IReqPostQuery } from "~/types/IRequestPost";

export default defineEventHandler(async (event) => {
  try {
    const { perPage, page, slug, sort, order } = getQuery<IReqPostQuery>(event);
    if (slug) {
      const post = await PostModel.findOne({ slug }, {});
      if (!post) {
        throw createError({
          statusCode: 404,
          statusMessage: "Post not found",
        });
      }

      return post.toJSON();
    }
    let query: any = {
      published: true,
    };
    let sortOpt = {};
    if (order && sort) {
      sortOpt = { [sort]: order };
    }
    const auth = checkAuth(event);
    if (auth) {
      const user = await ensureAuth(event);
      if (user.profile.isAdministrator || user.profile.isDepartement) {
        query = {};
      }
    }

    const postsLength = await PostModel.countDocuments(query);
    const posts = await PostModel.find(query)
      .skip((page - 1) * perPage)
      .sort(sortOpt)
      .limit(perPage);
    return {
      posts,
      length: postsLength,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
});
