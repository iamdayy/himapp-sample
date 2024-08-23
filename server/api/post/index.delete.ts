import fs from "fs";
import path from "path";
import { PostModel } from "~/server/models/PostModel";
const config = useRuntimeConfig();
export default defineEventHandler(async (event) => {
  try {
    const user = await ensureAuth(event);
    const { slug } = getQuery(event);

    if (!user.profile.isAdministrator && !user.profile.isDepartement) {
      throw createError({
        statusCode: 403,
        statusMessage: "Who are you ? cannot delete this",
      });
    }
    const post = await PostModel.findOne({ slug });
    if (!post) {
      throw createError({
        statusCode: 404,
        message: "Post not found",
      });
    }
    if (post.mainImage) {
      const exist = fs.existsSync(`${path.join(config.mount, post.mainImage)}`);
      if (exist) {
        fs.rmSync(`${path.join(config.mount, post.mainImage)}`);
      }
    }
    await PostModel.findOneAndDelete({ slug });
    return {
      statusCode: 200,
      statusMessage: `Post ${post.title} deleted`,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
});
