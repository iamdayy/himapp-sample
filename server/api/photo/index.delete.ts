import fs from "fs";
import path from "path";
import { PhotoModel } from "~/server/models/PhotoModel";
const config = useRuntimeConfig();
export default defineEventHandler(async (event) => {
  try {
    const user = await ensureAuth(event);
    if (!user.profile.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to use this endpoint",
      });
    }
    const { id } = getQuery(event);
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "No photo id provided",
      });
    }
    const photo = await PhotoModel.findByIdAndDelete(id);
    if (!photo) {
      throw createError({
        statusCode: 404,
        statusMessage: "Photo not found",
      });
    }
    // Delete the associated main image file if it exists
    if (photo.image) {
      const imagePath = path.join(config.mount, photo.image);
      if (fs.existsSync(imagePath)) {
        fs.rmSync(imagePath);
      }
    }
    return { statusCode: 200, statusMessage: "Photo deleted" };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
