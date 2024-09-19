import { MemberModel } from "~/server/models/MemberModel";
import { ProjectModel } from "~/server/models/ProjectModel";
import { IProject } from "~/types";
import { IResponse } from "~/types/IResponse";
/**
 * Handles POST requests for creating a new project.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing the status code and message of the operation.
 * @throws {H3Error} If the user is not authorized, the project is not saved, or if a system error occurs.
 */
export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }
    if (!event.context.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to use this endpoint",
      });
    }

    // Read the request body containing the project data
    const body = await readBody<IProject>(event);

    // Create a new project instance with mapped contributors
    const project = new ProjectModel({
      ...body,
      contributors: await Promise.all(
        body.contributors?.map(async (contributor) => ({
          member: await getIdByNim(contributor.member as number),
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
    return {
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "An unexpected error occurred",
    };
  }
});

/**
 * Retrieves the member ID associated with a given NIM (Student ID).
 * @param {number} NIM - The Student ID (NIM).
 * @returns {Promise<unknown>} The member ID associated with the given NIM.
 * @throws {H3Error} If the member is not found or if a system error occurs.
 */
const getIdByNim = async (NIM: number): Promise<unknown> => {
  try {
    const member = await MemberModel.findOne({ NIM });
    return member?._id;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
};
