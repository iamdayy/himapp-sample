import { EventModel } from "~/server/models/EventModel";

/**
 * Handles PUT requests for updating an existing event.
 * @param {H3Event} ev - The H3 event object.
 * @returns {Promise<Object>} The result of the update operation.
 * @throws {H3Error} If an error occurs during the process.
 */
export default defineEventHandler(async (ev) => {
  try {
    // Ensure the user is authenticated and has the necessary permissions
    const user = await ensureAuth(ev);
    if (!user.profile.isAdministrator && !user.profile.isDepartement) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "You must be administrator or departement to use this endpoint",
      });
    }

    // Get the event ID from the query parameters
    const { id } = getQuery(ev);

    // Read and validate the request body
    const body = await readBody(ev);

    // Find the event by ID
    const event = await EventModel.findById(id);
    if (!event) {
      throw createError({
        statusCode: 404,
        statusMessage: "The event is not found",
      });
    }

    // Update event properties
    event.title = body.title;
    event.at = body.at;
    event.date = body.date;
    event.canSee = body.canSee;
    event.description = body.description;
    event.canRegister = body.canRegister;

    // Save the updated event
    await event.save();

    // Return success response
    return {
      statusCode: 200,
      statusMessage: `Event ${event.title} updated`,
    };
  } catch (error: any) {
    // Handle any errors that occur during the process
    return createError({
      statusCode: error.statusCode || 500,
      message:
        error.message ||
        "An unexpected error occurred while updating the event",
    });
  }
});
