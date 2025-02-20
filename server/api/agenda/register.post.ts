import { Types } from "mongoose";
import { AgendaModel } from "~/server/models/AgendaModel";
import { MemberModel } from "~/server/models/MemberModel";
import { IError, IResponse } from "~/types/IResponse";
/**
 * Handles POST requests for registering a user to an event.
 * @param {H3Event} ev - The H3 event object.
 * @returns {Promise<Object>} The result of the registration operation.
 * @throws {H3Error} If an error occurs during the process.s
 */
export default defineEventHandler(async (ev): Promise<IResponse | IError> => {
  const { NIM, id } = await readBody(ev);
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = ev.context.user;
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }
    // Find the agenda by ID
    const agenda = await AgendaModel.findById(id);
    if (!agenda) {
      throw createError({
        statusCode: 404,
        statusMessage: "Agenda not found",
      });
    }

    // Find the user member by NIM
    const me = await MemberModel.findOne({ NIM });
    if (!me) {
      throw createError({
        statusCode: 404,
        statusMessage: "User member not found",
      });
    }

    // Add the user to the agenda's registered list
    agenda.registered?.push({
      member: me._id as Types.ObjectId,
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
      statusCode: 200,
      statusMessage: `Successfully registered for agenda: ${agenda.title}`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message ||
        "An unexpected error occurred during agenda registration",
    };
  }
});
