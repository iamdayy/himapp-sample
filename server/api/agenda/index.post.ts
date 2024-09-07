import { AgendaModel } from "~/server/models/AgendaModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IReqAgenda } from "~/types/IRequestPost";

/**
 * Handles POST requests for creating a new event.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Event>} The newly created event.
 * @throws {H3Error} If an error occurs during the process.
 */
export default defineEventHandler(async (event) => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = event.context.auth;
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

    // Read and validate the request body
    const body = await readBody<IReqAgenda>(event);

    // Process committee members
    const committees = body.committee?.map(async (committee) => {
      try {
        const profile = await ProfileModel.findOne({ NIM: committee.user });
        if (!profile) {
          throw createError({
            statusCode: 400,
            message: "User not found in the committee",
          });
        }
        return {
          job: committee.job,
          user: profile._id,
        };
      } catch (error: any) {
        throw createError({
          statusCode: error.statusCode,
          message: error.message,
        });
      }
    });

    // Create a new agenda
    const newAgenda = new AgendaModel({
      ...body,
      committee: await Promise.all(committees!),
    });

    // Save the new agenda
    const savedAgenda = await newAgenda.save();
    if (!savedAgenda) {
      throw createError({
        statusCode: 400,
        message: "Failed to save the agenda",
      });
    }

    return savedAgenda;
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || "An unexpected error occurred",
    });
  }
});
