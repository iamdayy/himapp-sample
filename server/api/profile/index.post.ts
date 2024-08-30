import { ProfileModel } from "~/server/models/ProfileModel";
import type { IReqProfile } from "~/types/IRequestPost";

/**
 * Handles POST requests for creating a new user profile.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, the profile is not saved, or if a system error occurs.
 */
export default defineEventHandler(async (event) => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = await ensureAuth(event);
    if (!user.profile.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to use this endpoint",
      });
    }

    // Read the request body containing the profile data
    const body = await readBody<IReqProfile>(event);

    // Create a new profile instance and save it to the database
    const profile = new ProfileModel(body);
    const saved = await profile.save();

    // Check if the profile was successfully saved
    if (!saved) {
      throw createError({
        statusCode: 500,
        message: "Failed to save the profile data",
      });
    }

    // Return success message with the saved profile's NIM
    return {
      statusCode: 200,
      statusMessage: `Profile ${profile.NIM} successfully saved!`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return createError({
      statusCode: error.statusCode || 500,
      message:
        error.message ||
        "An unexpected error occurred while saving the profile",
    });
  }
});
