import { ProfileModel } from "~/server/models/ProfileModel";
import { IResponse } from "~/types/IResponse";

/**
 * Handles DELETE requests for marking a user profile as deleted.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, the profile is not found, or if a system error occurs.
 */
export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    // Ensure the user is authenticated
    const { NIM } = getQuery(event);
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }

    // Check if the user has permission to delete the profile
    if (user.profile.NIM != NIM && !event.context.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "Unauthorized: You can only delete your own profile or must be an administrator/department.",
      });
    }

    // Find the profile by NIM
    const profile = await ProfileModel.findOne({ NIM });
    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: "Profile not found",
      });
    }

    // Mark the profile as deleted
    profile.status = "deleted";
    await profile.save();

    return {
      statusCode: 200,
      statusMessage: `Profile ${profile.NIM} has been marked as deleted`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message ||
        "An unexpected error occurred while deleting the profile",
    };
  }
});
