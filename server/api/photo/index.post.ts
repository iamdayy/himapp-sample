import { PhotoModel } from "~/server/models/PhotoModel";
import { IFile } from "~/types";
import type { IReqPhoto } from "~/types/IRequestPost";
import { IResponse } from "~/types/IResponse";
const config = useRuntimeConfig();
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
    const body = await readBody<IReqPhoto>(event);

    const BASE_PHOTO_FOLDER = "/uploads/img/photos";
    let imageUrl = "";
    const image = body.image as IFile;
    // Handle main image upload
    if (image.type?.startsWith("image/")) {
      const hashedName = await storeFileLocally(image, 12, BASE_PHOTO_FOLDER);
      imageUrl = `${BASE_PHOTO_FOLDER}/${hashedName}`;
    } else {
      throw createError({
        statusMessage: "Please upload nothing but images.",
      });
    }

    const newPhoto = {
      ...body,
      image: imageUrl,
    };
    const photo = await PhotoModel.create(newPhoto);
    if (!photo) {
      throw createError({
        statusMessage: "Failed to add new photo",
      });
    }
    return {
      statusCode: 200,
      statusMessage: "Photo added successfully",
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    };
  }
});
