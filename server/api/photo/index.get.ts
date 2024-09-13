import { PhotoModel } from "~/server/models/PhotoModel";
import { IPhoto } from "~/types";
import { IPhotoResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IPhotoResponse> => {
  try {
    const { page, perPage } = getQuery<{ page: number; perPage: number }>(
      event
    );
    const total = await PhotoModel.countDocuments();
    const photos = await PhotoModel.find()
      .skip((page - 1) * perPage)
      .limit(perPage);
    return {
      statusCode: 200,
      statusMessage: "Photos fetched",
      data: {
        photos: photos.map((photo) => photo.toObject()) as IPhoto[],
        length: total,
      },
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    };
  }
});
