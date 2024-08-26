import { ProfileModel } from "~/server/models/ProfileModel";
import { IProfile } from "~/types";

/**
 * Handles POST requests for batch creation of user profiles.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, no data is saved, or if a system error occurs.
 */
export default defineEventHandler(async (event) => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = await ensureAuth(event);
    if (!user.profile.isAdministrator && !user.profile.isDepartement) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "You must be administrator or department to use this endpoint",
      });
    }

    // Read the request body containing an array of profile data
    const body = await readBody<IProfile[]>(event);

    // Attempt to insert multiple profiles into the database
    const saved = await ProfileModel.collection.insertMany(body);

    // Check if any profiles were actually inserted
    if (saved.insertedCount === 0) {
      throw createError({
        statusCode: 500,
        message: "No data was saved",
      });
    }

    // Return success message with the number of inserted profiles
    return {
      statusCode: 200,
      statusMessage: `Successfully saved ${saved.insertedCount} new college profiles`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return createError({
      statusCode: error.statusCode || 500,
      message:
        error.message || "An unexpected error occurred while saving profiles",
    });
  }
});
