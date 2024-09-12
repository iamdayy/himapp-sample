import { PostModel } from "~/server/models/PostModel";
import { IReqPostQuery } from "~/types/IRequestPost";
import type { IResponse } from "~/types/IResponse";
/**
 * Handles GET requests for publishing a post.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the post is not found, the user is not authorized, or if a system error occurs.
 */
export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    // Get the slug from the query parameters
    const { slug } = getQuery<IReqPostQuery>(event);

    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }
    if (!event.context.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to use this endpoint",
      });
    }

    // Find the post by slug
    const post = await PostModel.findOne({ slug }, {}, { autopopulate: false });
    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }

    // Check if the post is already published
    if (!post.published) {
      // Ensure the user is authenticated and has the necessary permissions
      const user = await ensureAuth(event);
      if (!user.profile.organizer) {
        throw createError({
          statusCode: 403,
          statusMessage: "You must be admin / departement to use this endpoint",
        });
      } else {
        // Publish the post
        post.published = true;
        post.publishedAt = new Date();
        await post.save();
        return {
          statusCode: 200,
          statusMessage: `Post "${post.title}" is published`,
        };
      }
    }

    // Return error if the post is already published
    return {
      statusCode: 400,
      statusMessage: `Post "${post.title}" is already published`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message ||
        "An unexpected error occurred while publishing the post",
    };
  }
});
