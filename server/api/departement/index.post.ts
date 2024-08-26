import { DepartementModel } from "~/server/models/DepartementModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IDepartement } from "~/types";

/**
 * Handles POST requests for creating a new department entry.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} The result of the operation.
 * @throws {H3Error} If an error occurs during the process.
 */
export default defineEventHandler(async (event) => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = await ensureAuth(event);
    if (!user.profile.isAdministrator && !user.profile.isDepartement) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "You must be administrator or departement to use this endpoint",
      });
    }

    // Read and validate the request body
    const body = await readBody<IDepartement>(event);
    const profileId = await getIdByNim(body.profile as number);

    if (!profileId) {
      throw createError({
        statusCode: 404,
        statusMessage: "Profile not found",
      });
    }

    // Create a new department entry
    const departement = new DepartementModel({
      profile: profileId,
      period: body.period,
      departement: body.departement,
    });

    // Save the new department entry
    const saved = await departement.save();
    if (!saved) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to add new Saved Period ${departement.period.start.getFullYear()} - ${departement.period.end.getFullYear()}`,
      });
    }

    // Return success response
    return {
      statusCode: 200,
      statusMessage: `Success to add new Saved Period ${departement.period.start.getFullYear()} - ${departement.period.end.getFullYear()}`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || "An unexpected error occurred",
    });
  }
});

/**
 * Retrieves the profile ID associated with a given NIM (Student Identification Number).
 * @param {number} NIM - The Student Identification Number.
 * @returns {Promise<unknown | null>} The profile ID associated with the NIM, or null if not found.
 */
const getIdByNim = async (NIM: number): Promise<unknown | null> => {
  try {
    const profile = await ProfileModel.findOne({ NIM });
    return profile?._id || null;
  } catch (error: any) {
    console.error(`Error fetching profile for NIM ${NIM}:`, error);
    return null;
  }
};
