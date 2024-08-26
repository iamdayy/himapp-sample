import fs from "fs";
import { readFiles } from "h3-formidable";
import path from "path";
import { ProfileModel } from "~/server/models/ProfileModel";

const config = useRuntimeConfig();

/**
 * Handles PUT requests for updating a user's avatar.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code, message, and updated avatar URL.
 * @throws {H3Error} If the user is not authorized, the profile is not found, or if a system error occurs.
 */
export default defineEventHandler(async (event) => {
  try {
    const { files } = await readFiles(event);
    const { NIM } = getQuery(event);
    const avatarFile = files.avatar![0];
    const BASE_AVATAR_FOLDER = "img/avatars";
    let imageUrl = "";
    let oldPath = "";
    let newPath = "";

    // Ensure the user is authenticated and authorized
    const user = await ensureAuth(event);
    if (user.profile.NIM != NIM) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "Unauthorized: You can only update your own profile avatar",
      });
    }

    // Find the user's profile
    const profile = await ProfileModel.findOne({ NIM });
    if (!profile) {
      throw createError({
        statusCode: 404,
        message: "Profile not found",
      });
    }

    // Remove old avatar if it exists
    if (profile.avatar) {
      const oldAvatarPath = path.join(config.mount, profile.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.rmSync(oldAvatarPath);
      }
    }

    // Process and save the new avatar
    if (avatarFile.mimetype?.startsWith("image/")) {
      const imageName = `${Date.now()}_${Math.round(
        Math.random() * 100000
      )}_${avatarFile.originalFilename!}`;
      oldPath = avatarFile.filepath;
      newPath = path.join(config.mount, BASE_AVATAR_FOLDER, imageName);
      fs.copyFileSync(oldPath, newPath);
      imageUrl = `/${BASE_AVATAR_FOLDER}/${imageName}`;
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid file type: Please upload an image file",
      });
    }

    // Update the profile with the new avatar URL
    profile.avatar = imageUrl;
    await profile.save();

    return {
      statusCode: 200,
      statusMessage: `Avatar for user ${profile.NIM} updated successfully`,
      avatar: profile.avatar,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      message:
        error.message ||
        "An unexpected error occurred while updating the avatar",
    });
  }
});
