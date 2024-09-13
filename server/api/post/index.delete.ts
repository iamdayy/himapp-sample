import fs from "fs";
import path from "path";
import { PostModel } from "~/server/models/PostModel";
import { IResponse } from "~/types/IResponse";

const config = useRuntimeConfig();

/**
 * Handles DELETE requests for removing a post.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, the post is not found, or if a system error occurs.
 */
export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
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

    // Get the post slug from the query parameters
    const { slug } = getQuery(event);

    // Find the post by slug
    const post = await PostModel.findOne({ slug });
    if (!post) {
      throw createError({
        statusCode: 404,
        message: "Post not found",
      });
    }

    // Delete the associated main image file if it exists
    if (post.mainImage) {
      const imagePath = path.join(config.storageDir, post.mainImage as string);
      if (fs.existsSync(imagePath)) {
        deleteFile(post.mainImage as string);
      }
    }

    // Delete the post from the database
    await PostModel.findOneAndDelete({ slug });

    // Return success response
    return {
      statusCode: 200,
      statusMessage: `Post "${post.title}" successfully deleted`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message || "An unexpected error occurred while deleting the post",
    };
  }
});
