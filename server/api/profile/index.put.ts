import { ProfileModel } from "~/server/models/ProfileModel";
import { IProfile } from "~/types";
import { IResponse } from "~/types/IResponse";
/**
 * Handles PUT requests for updating a user profile.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, the profile is not found, or if a system error occurs.
 */
export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const { NIM } = getQuery(event);

    // Ensure the user is authenticated
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }

    // Check if the user is updating their own profile
    if (user.profile.NIM != NIM) {
      throw createError({
        statusCode: 403,
        statusMessage: "Unauthorized: You can only update your own profile",
      });
    }

    // Read the request body containing the updated profile data
    const body = await readBody<IProfile>(event);

    // Find the profile by NIM
    const profile = await ProfileModel.findOne({ NIM });
    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: "Profile not found",
      });
    }

    // Update profile fields
    profile.fullName = body.fullName;
    profile.avatar = body.avatar;
    profile.email = body.email;
    profile.class = body.class;
    profile.citizen = body.citizen;
    profile.semester = body.semester;
    profile.sex = body.sex;
    profile.religion = body.religion;
    profile.phone = body.phone;
    profile.birth = body.birth;

    // Save the updated profile
    await profile.save();

    // Return success message
    return {
      statusCode: 200,
      statusMessage: `Profile ${profile.NIM} updated successfully`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message ||
        "An unexpected error occurred while updating the profile",
    };
  }
});
