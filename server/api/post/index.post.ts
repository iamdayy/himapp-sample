import { Types } from "mongoose";
import { PostModel } from "~/server/models/PostModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IFile } from "~/types";
import { IReqPost } from "~/types/IRequestPost";
import type { IResponse } from "~/types/IResponse";
const config = useRuntimeConfig();

/**
 * Handles POST requests for creating a new post.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, file upload fails, or if a system error occurs.
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

    const BASE_MAINIMAGE_FOLDER = "/uploads/img/posts";
    let imageUrl = "";

    const body = await readBody<IReqPost>(event);
    const mainImage = body.mainImage as IFile;
    if (mainImage.type?.startsWith("image/")) {
      const hashedName = await storeFileLocally(
        mainImage,
        12,
        BASE_MAINIMAGE_FOLDER
      );
      imageUrl = `${BASE_MAINIMAGE_FOLDER}/${hashedName}`;
    } else {
      throw createError({
        statusMessage: "Please upload nothing but images.",
      });
    }

    // Prepare post data
    const newPost = {
      ...body,
      categories: body.categories,
      slug: body.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""),
      mainImage: imageUrl,
      author: (await getIdByNim(user.profile.NIM)) as Types.ObjectId,
    };

    // Create and save the new post
    const post = new PostModel(newPost);
    const saved = await post.save();
    if (!saved) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to add new Post ${post.title}`,
      });
    }

    return {
      statusCode: 200,
      statusMessage: `Success to add new Post ${post.title}`,
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message || "An unexpected error occurred while creating the post",
    };
  }
});

/**
 * Retrieves the user's ID by their NIM (Nomor Induk Mahasiswa).
 * @param {number} NIM - The user's NIM.
 * @returns {Promise<Types.ObjectId | undefined>} The user's ID or undefined if not found.
 * @throws {H3Error} If an error occurs during the database query.
 */
const getIdByNim = async (NIM: number): Promise<Types.ObjectId | undefined> => {
  try {
    const profile = await ProfileModel.findOne({ NIM });
    return profile?._id as Types.ObjectId;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to retrieve user ID by NIM",
    });
  }
};
