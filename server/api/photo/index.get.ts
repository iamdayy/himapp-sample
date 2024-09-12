import { PhotoModel } from "~/server/models/PhotoModel";
import { IPhotoResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IPhotoResponse> => {
  try {
    const photos = await PhotoModel.find();
    return {
      statusCode: 200,
      statusMessage: "Photos fetched",
      data: photos.map((photo) => photo.toObject()),
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    };
  }
});
