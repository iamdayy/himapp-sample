import { AgendaModel } from "~/server/models/AgendaModel";

/**
 * Handles DELETE requests for removing an agenda.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<boolean>} True if the agenda was successfully deleted.
 * @throws {H3Error} If the event is not found or if a system error occurs.
 */
export default defineEventHandler(async (event) => {
  try {
    // Get the agenda ID from the route parameters
    const id = getRouterParam(event, "id");

    // Attempt to find and delete the agenda
    const deleted = await AgendaModel.findByIdAndDelete(id);

    // If the agenda wasn't found, throw an error
    if (!deleted) {
      throw createError({
        statusCode: 404,
        message: "Agenda not found or already deleted",
      });
    }

    // Return true to indicate successful deletion
    return true;
  } catch (error: any) {
    // Handle any errors that occur during the process
    throw createError({
      statusCode: error.statusCode || 500,
      message:
        error.message ||
        "An unexpected error occurred while deleting the agenda",
    });
  }
});
