import fs from "fs";
import { Types } from "mongoose";
import path from "path";
import { NewsModel } from "~/server/models/NewsModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IFile } from "~/types";
import { IReqNews } from "~/types/IRequestPost";
import type { IResponse } from "~/types/IResponse";
const config = useRuntimeConfig();

/**
 * Handles PUT requests for updating an existing news.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, the news is not found, or if a system error occurs.
 */
export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const { slug } = getQuery(event);
    const BASE_MAINIMAGE_FOLDER = "/uploads/img/newss";
    let imageUrl = "";

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

    // Find the news by slug
    const news = await NewsModel.findOne({ slug });
    if (!news) {
      throw createError({
        statusCode: 404,
        message: "News not found",
      });
    }

    const body = await readBody<IReqNews>(event);
    const mainImage = body.mainImage as IFile;
    // Handle main image upload
    if (typeof mainImage === "object") {
      if (mainImage.type?.startsWith("image/")) {
        // Remove old image if it exists
        if (news.mainImage) {
          const imagePath = path.join(
            config.storageDir,
            news.mainImage as string
          );
          if (fs.existsSync(imagePath)) {
            deleteFile(news.mainImage as string);
          }
        }
        // Save new image
        const hasedImage = await storeFileLocally(
          mainImage,
          12,
          BASE_MAINIMAGE_FOLDER
        );
        imageUrl = `/${BASE_MAINIMAGE_FOLDER}/${hasedImage}`;
      } else {
        throw createError({
          statusMessage: "Please upload nothing but images.",
        });
      }
    } else {
      imageUrl = news.mainImage as string;
    }

    // Update news properties
    news.title = body.title;
    news.mainImage = imageUrl;
    news.slug = body.title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    news.category = body.category;
    news.tags = body.tags;
    news.body = body.body;

    // Save the updated news
    const saved = await news.save();

    if (!saved) {
      return {
        statusCode: 400,
        statusMessage: `Failed to save news ${news.title}`,
      };
    }

    return {
      statusCode: 200,
      statusMessage: `Success to save news ${news.title}`,
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message || "An unexpected error occurred while updating the news",
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
