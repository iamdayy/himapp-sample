import fs from "fs";
import { readFiles } from "h3-formidable";
import { firstValues } from "h3-formidable/helpers";
import { Types } from "mongoose";
import path from "path";
import { PostModel } from "~/server/models/PostModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import type { IResponse } from "~/types/IResponse";
const config = useRuntimeConfig();

/**
 * Handles PUT requests for updating an existing post.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, the post is not found, or if a system error occurs.
 */
export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const { slug } = getQuery(event);
    const BASE_MAINIMAGE_FOLDER = "img/posts";
    let imageUrl = "";
    let oldPath = "";
    let newPath = "";

    // Check user authorization
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
    const post = await PostModel.findOne({ slug });
    if (!post) {
      throw createError({
        statusCode: 404,
        message: "Post not found",
      });
    }

    // Parse the multipart form data
    const { fields, files, form } = await readFiles(event);
    const exceptions = [""];
    const single = firstValues(form, fields, exceptions);

    // Handle main image upload
    if (files.mainImage) {
      const mainImage = files.mainImage[0];
      if (mainImage.mimetype?.startsWith("image/")) {
        // Remove old image if it exists
        if (post.mainImage) {
          const exist = fs.existsSync(
            `${path.join(config.mount, post.mainImage)}`
          );
          if (exist) {
            fs.rmSync(`${path.join(config.mount, post.mainImage)}`);
          }
        }
        // Save new image
        let imageName =
          Date.now() +
          Math.round(Math.random() * 100000) +
          mainImage.originalFilename!;
        oldPath = mainImage.filepath;
        newPath = `${path.join(
          config.mount,
          BASE_MAINIMAGE_FOLDER,
          imageName
        )}`;
        fs.copyFileSync(oldPath, newPath);
        imageUrl = `/${BASE_MAINIMAGE_FOLDER}/${imageName}`;
      } else {
        throw createError({
          statusMessage: "Please upload nothing but images.",
        });
      }
    } else {
      imageUrl = post.mainImage;
    }

    // Update post properties
    post.title = single.title as unknown as string;
    post.mainImage = imageUrl;
    post.slug = (single.title as unknown as string)
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    post.categories = JSON.parse(single.categories as unknown as string);
    post.body = single.body as unknown as string;

    // Save the updated post
    const saved = await post.save();

    if (!saved) {
      return {
        statusCode: 400,
        statusMessage: `Failed to save post ${post.title}`,
      };
    }

    return {
      statusCode: 200,
      statusMessage: `Success to save post ${post.title}`,
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message || "An unexpected error occurred while updating the post",
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
