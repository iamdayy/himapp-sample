import { EventModel } from "~/server/models/EventModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IReqEvent } from "~/types/IRequestPost";

/**
 * Handles POST requests for creating a new event.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Event>} The newly created event.
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
    const body = await readBody<IReqEvent>(event);

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

    // Create a new event
    const newEvent = new EventModel({
      ...body,
      committee: await Promise.all(committees!),
    });

    // Save the new event
    const savedEvent = await newEvent.save();
    if (!savedEvent) {
      throw createError({
        statusCode: 400,
        message: "Failed to save the event",
      });
    }

    return savedEvent;
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || "An unexpected error occurred",
    });
  }
});
