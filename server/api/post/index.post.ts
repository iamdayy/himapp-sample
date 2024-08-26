import fs from "fs";
import { readFiles } from "h3-formidable";
import { firstValues } from "h3-formidable/helpers";
import { Types } from "mongoose";
import path from "path";
import { PostModel } from "~/server/models/PostModel";
import { ProfileModel } from "~/server/models/ProfileModel";

const config = useRuntimeConfig();

/**
 * Handles POST requests for creating a new post.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, file upload fails, or if a system error occurs.
 */
export default defineEventHandler(async (event) => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = await ensureAuth(event);
    if (!user.profile.isAdministrator && !user.profile.isDepartement) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "You must be administrator or departement to use this endpoint",
      });
    }

    const BASE_MAINIMAGE_FOLDER = "img/posts";
    let imageUrl = "";
    let oldPath = "";
    let newPath = "";

    // Parse the multipart form data
    const { fields, files, form } = await readFiles(event);
    const exceptions = [""];
    const single = firstValues(form, fields, exceptions);

    // Handle main image upload
    const mainImage = files.mainImage![0];
    if (mainImage.mimetype?.startsWith("image/")) {
      let imageName =
        Date.now() +
        Math.round(Math.random() * 100000) +
        mainImage.originalFilename!;
      oldPath = mainImage.filepath;
      newPath = `${path.join(config.mount, BASE_MAINIMAGE_FOLDER, imageName)}`;
      fs.copyFileSync(oldPath, newPath);
      imageUrl = `/${BASE_MAINIMAGE_FOLDER}/${imageName}`;
    } else {
      throw createError({
        statusMessage: "Please upload nothing but images.",
      });
    }

    // Prepare post data
    const body = {
      ...single,
      categories: JSON.parse(single.categories as unknown as string),
      slug: (single.title as unknown as string)
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""),
      mainImage: imageUrl,
      author: (await getIdByNim(user.profile.NIM)) as Types.ObjectId,
    };

    // Create and save the new post
    const post = new PostModel(body);
    const saved = await post.save();
    if (!saved) {
      return {
        statusCode: 400,
        statusMessage: `Failed to add new Post ${post.title}`,
      };
    }

    return {
      statusCode: 200,
      statusMessage: `Success to add new Post ${post.title}`,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      message:
        error.message || "An unexpected error occurred while creating the post",
    });
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
