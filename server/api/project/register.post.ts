import { Types } from "mongoose";
import { ProfileModel } from "~/server/models/ProfileModel";
import { ProjectModel } from "~/server/models/ProjectModel";
import type { IResponse } from "~/types/IResponse";
/**
 * Handles POST requests for registering a user to a project.
 * @param {H3Event} ev - The H3 event object.
 * @returns {Promise<Object>} An object containing the status and message of the operation.
 * @throws {H3Error} If the project is not found, the registration fails, or if a system error occurs.
 */
export default defineEventHandler(async (ev): Promise<IResponse> => {
  try {
    // Read the request body
    const { NIM, id, task } = await readBody(ev);

    // Ensure the user is authenticated
    const user = ev.context.user;
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }

    // Find the project by ID
    const project = await ProjectModel.findById(id);
    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "Project not found",
      });
    }

    // Find the user profile by NIM
    const me = await ProfileModel.findOne({ NIM });
    if (!me) {
      throw createError({
        statusCode: 404,
        statusMessage: "User profile not found",
      });
    }

    // Add the user to the project's registered list
    project.registered?.push({
      profile: me._id as Types.ObjectId,
      task,
    });

    // Save the updated project
    const saved = await project.save();
    if (!saved) {
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to save project registration",
      });
    }

    // Return success message
    return {
      statusCode: 200,
      statusMessage: `Successfully registered for project: ${project.title}`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage ||
        "An unexpected error occurred during project registration",
    };
  }
});
