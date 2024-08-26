import { ProfileModel } from "~/server/models/ProfileModel";
import { ProjectModel } from "~/server/models/ProjectModel";
import { IProject } from "~/types";

/**
 * Handles POST requests for creating a new project.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, the project is not saved, or if a system error occurs.
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

    // Read the request body containing the project data
    const body = await readBody<IProject>(event);

    // Create a new project instance with mapped contributors
    const project = new ProjectModel({
      ...body,
      contributors: await Promise.all(
        body.contributors?.map(async (contributor) => ({
          profile: await getIdByNim(contributor.profile as number),
          job: contributor.job,
        }))!
      ),
    });

    // Save the new project to the database
    const saved = await project.save();
    if (!saved) {
      return {
        statusCode: 400,
        statusMessage: `Failed to add new Project ${project.title}`,
      };
    }

    // Return success message
    return {
      statusCode: 200,
      statusMessage: `Success to add new Project ${project.title}`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
});

/**
 * Retrieves the profile ID associated with a given NIM (Student ID).
 * @param {number} NIM - The Student ID (NIM).
 * @returns {Promise<unknown>} The profile ID associated with the given NIM.
 * @throws {H3Error} If the profile is not found or if a system error occurs.
 */
const getIdByNim = async (NIM: number): Promise<unknown> => {
  try {
    const profile = await ProfileModel.findOne({ NIM });
    return profile?._id;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
};
