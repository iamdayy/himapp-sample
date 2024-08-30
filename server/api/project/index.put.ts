import { ProfileModel } from "~/server/models/ProfileModel";
import { ProjectModel } from "~/server/models/ProjectModel";
import { IContributor, IProject } from "~/types";

/**
 * Handles PUT requests for updating an existing project.
 * @param {H3Event} ev - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, the project is not found, or if a system error occurs.
 */
export default defineEventHandler(async (ev) => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = await ensureAuth(ev);
    if (!user.profile.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to use this endpoint",
      });
    }

    // Get the project ID from the query parameters
    const { id } = getQuery(ev);

    // Read the request body containing the updated project data
    const body = await readBody<IProject>(ev);

    // Find the project by ID
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "The project is not found",
      });
    }

    // Update project fields
    project.title = body.title;
    project.deadline = body.deadline;
    project.canSee = body.canSee;
    project.description = body.description;
    project.canRegister = body.canRegister;
    project.contributors = (await Promise.all(
      body.contributors?.map(async (contributor) => ({
        profile: await getIdByNim(contributor.profile as number),
        job: contributor.job,
      }))!
    )) as IContributor[];

    // Save the updated project
    await project.save();

    // Return success message
    return {
      statusCode: 200,
      statusMessage: `Project ${project.title} updated`,
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
