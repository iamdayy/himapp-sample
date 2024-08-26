import { EventModel } from "~/server/models/EventModel";

/**
 * Handles DELETE requests for removing an event.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<boolean>} True if the event was successfully deleted.
 * @throws {H3Error} If the event is not found or if a system error occurs.
 */
export default defineEventHandler(async (event) => {
  try {
    // Get the event ID from the route parameters
    const id = getRouterParam(event, "id");

    // Attempt to find and delete the event
    const deleted = await EventModel.findByIdAndDelete(id);

    // If the event wasn't found, throw an error
    if (!deleted) {
      throw createError({
        statusCode: 404,
        message: "Event not found or already deleted",
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
        "An unexpected error occurred while deleting the event",
    });
  }
});
