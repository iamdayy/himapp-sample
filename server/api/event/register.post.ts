import { Types } from "mongoose";
import { EventModel } from "~/server/models/EventModel";
import { ProfileModel } from "~/server/models/ProfileModel";

/**
 * Handles POST requests for registering a user to an event.
 * @param {H3Event} ev - The H3 event object.
 * @returns {Promise<Object>} The result of the registration operation.
 * @throws {H3Error} If an error occurs during the process.
 */
export default defineEventHandler(async (ev) => {
  const { NIM, id } = await readBody(ev);
  try {
    // Find the event by ID
    const event = await EventModel.findById(id);
    if (!event) {
      throw createError({
        statusCode: 404,
        statusMessage: "Event not found",
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

    // Add the user to the event's registered list
    event.registered?.push({
      profile: me._id as Types.ObjectId,
    });

    // Save the updated event
    const saved = await event.save();
    if (!saved) {
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to save event registration",
      });
    }

    // Return success response
    return {
      status: true,
      statusMessage: `Successfully registered for event: ${event.title}`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message ||
        "An unexpected error occurred during event registration",
    });
  }
});
