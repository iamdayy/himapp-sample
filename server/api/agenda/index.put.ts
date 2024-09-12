import { AgendaModel } from "~/server/models/AgendaModel";
import { IError, IResponse } from "~/types/IResponse";
/**
 * Handles PUT requests for updating an existing event.
 * @param {H3Event} ev - The H3 event object.
 * @returns {Promise<Object>} The result of the update operation.
 * @throws {H3Error} If an error occurs during the process.
 */
export default defineEventHandler(async (ev): Promise<IResponse | IError> => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = ev.context.user;
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }
    if (!ev.context.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to use this endpoint",
      });
    }

    // Get the agenda ID from the query parameters
    const { id } = getQuery(ev);

    // Read and validate the request body
    const body = await readBody(ev);

    // Find the agenda by ID
    const agenda = await AgendaModel.findById(id);
    if (!agenda) {
      throw createError({
        statusCode: 404,
        statusMessage: "The agenda is not found",
      });
    }

    // Update agenda properties
    agenda.title = body.title;
    agenda.at = body.at;
    agenda.date = body.date;
    agenda.canSee = body.canSee;
    agenda.description = body.description;
    agenda.canRegister = body.canRegister;

    // Save the updated agenda
    await agenda.save();

    // Return success response
    return {
      statusCode: 200,
      statusMessage: `Agenda ${agenda.title} updated`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return {
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message ||
        "An unexpected error occurred while updating the agenda",
    };
  }
});
