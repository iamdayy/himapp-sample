import { PostModel } from "~/server/models/PostModel";
import { IReqPostQuery } from "~/types/IRequestPost";
import type { IPostResponse } from "~/types/IResponse";
/**
 * Handles GET requests for retrieving posts.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} The post data or an array of posts with total count.
 * @throws {H3Error} If an error occurs during the process.
 */
export default defineEventHandler(async (event): Promise<IPostResponse> => {
  try {
    const { perPage, page, slug, sort, order } = getQuery<IReqPostQuery>(event);

    // If a slug is provided, fetch a single post
    if (slug) {
      const post = await PostModel.findOne({ slug }, {});
      if (!post) {
        throw createError({
          statusCode: 404,
          statusMessage: "Post not found",
        });
      }
      return {
        statusCode: 200,
        statusMessage: "Post fetched",
        data: post.toJSON(),
      };
    }

    // Set up query for multiple posts
    let query: any = {
      published: true,
    };
    let sortOpt = {};

    // Apply sorting if provided
    if (order && sort) {
      sortOpt = { [sort]: order };
    }

    // Check user authentication and permissions
    const user = event.context.user;
    if (user) {
      if (event.context.organizer) {
        // Administrators and department users can see all posts
        query = {};
      }
    }

    // Count total number of posts matching the query
    const postsLength = await PostModel.countDocuments(query);

    // Fetch posts with pagination and sorting
    const posts = await PostModel.find(query)
      .skip((page - 1) * perPage)
      .sort(sortOpt)
      .limit(perPage);

    // Return posts and total count
    return {
      statusCode: 200,
      statusMessage: "Posts fetched",
      data: {
        posts,
        length: postsLength,
      },
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message || "An unexpected error occurred while fetching posts",
    };
  }
});
