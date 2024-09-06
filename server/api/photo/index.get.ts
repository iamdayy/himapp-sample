import { PhotoModel } from "~/server/models/PhotoModel";

export default defineEventHandler(async (event) => {
  try {
    const photos = await PhotoModel.find();
    return photos;
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
