import { Types } from "mongoose";
import { AgendaModel } from "~/server/models/AgendaModel";
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
    // Find the agenda by ID
    const agenda = await AgendaModel.findById(id);
    if (!agenda) {
      throw createError({
        statusCode: 404,
        statusMessage: "Agenda not found",
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

    // Add the user to the agenda's registered list
    agenda.registered?.push({
      profile: me._id as Types.ObjectId,
    });

    // Save the updated agenda
    const saved = await agenda.save();
    if (!saved) {
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to save agenda registration",
      });
    }

    // Return success response
    return {
      status: true,
      statusMessage: `Successfully registered for agenda: ${agenda.title}`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message ||
        "An unexpected error occurred during agenda registration",
    });
  }
});
