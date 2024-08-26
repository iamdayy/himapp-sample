import { EventModel } from "~/server/models/EventModel";
import { ProfileModel } from "~/server/models/ProfileModel";

/**
 * Retrieves the NIM (Student Identification Number) associated with a given user ID.
 * @param {string} id - The user ID.
 * @returns {Promise<number>} The NIM associated with the user ID.
 * @throws {H3Error} If the profile is not found or NIM is missing.
 */
const getNimFromID = async (id: string): Promise<number> => {
  const profile = await ProfileModel.findById(id);

  if (!profile?.NIM) {
    throw createError({
      statusCode: 404,
      statusMessage: "Profile not found or NIM is missing",
    });
  }

  return profile.NIM;
};

/**
 * Handles GET requests for event data.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Event | Event[]>} The event data or an array of events.
 * @throws {H3Error} If an error occurs during the process.
 */
export default defineEventHandler(async (event) => {
  try {
    const { id } = getQuery(event);
    if (id) {
      // Fetch a single event by ID
      const eventData = await EventModel.findById(
        id,
        {},
        { autopopulate: false }
      );
      if (!eventData) {
        throw createError({
          statusCode: 404,
          statusMessage: "Event not found",
        });
      }
      // Map committee members to their NIMs
      const committee = await Promise.all(
        eventData?.committee?.map(async (committee) => ({
          user: await getNimFromID(committee.user as string),
          job: committee.job,
        }))!
      );

      return {
        ...eventData.toJSON(),
        committee,
      };
    }

    // Fetch multiple events based on user roles
    const roles: string[] = ["All", "External"];
    const auth = checkAuth(event);
    if (auth) {
      const user = await ensureAuth(event);
      if (user.profile.isAdministrator) {
        if (!roles.includes("Internal")) {
          roles.push("Internal");
        }
        roles.push("Admin");
      }
      if (user.profile.isDepartement) {
        if (!roles.includes("Internal")) {
          roles.push("Internal");
        }
        roles.push("Departement");
      }
    }
    const events = await EventModel.find({ canSee: { $in: roles } });
    if (!events) {
      throw createError({
        statusCode: 400,
        message: "No events found",
      });
    }
    return events;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message:
        error.message ||
        "An unexpected error occurred while fetching event data",
    });
  }
});
