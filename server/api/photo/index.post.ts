import fs from "fs";
import { readFiles } from "h3-formidable";
import { firstValues } from "h3-formidable/helpers";
import path from "path";
import { PhotoModel } from "~/server/models/PhotoModel";
const config = useRuntimeConfig();
export default defineEventHandler(async (event) => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = event.context.auth;
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
    const { fields, files, form } = await readFiles(event);
    const exceptions = [""];
    const single = firstValues(form, fields, exceptions);

    const BASE_PHOTO_FOLDER = "img/photos";
    let imageUrl = "";
    let oldPath = "";
    let newPath = "";

    // Handle main image upload
    const mainImage = files.mainImage![0];
    if (mainImage.mimetype?.startsWith("image/")) {
      let imageName =
        Date.now() +
        Math.round(Math.random() * 100000) +
        mainImage.originalFilename!;
      oldPath = mainImage.filepath;
      newPath = `${path.join(config.mount, BASE_PHOTO_FOLDER, imageName)}`;
      fs.copyFileSync(oldPath, newPath);
      imageUrl = `/${BASE_PHOTO_FOLDER}/${imageName}`;
    } else {
      throw createError({
        statusMessage: "Please upload nothing but images.",
      });
    }

    const body = {
      ...single,
      image: imageUrl,
    };
    const photo = await PhotoModel.create(body);
    if (!photo) {
      throw createError({
        statusMessage: "Failed to add new photo",
      });
    }
    return {
      statusCode: 200,
      statusMessage: "Photo added successfully",
      photo,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
