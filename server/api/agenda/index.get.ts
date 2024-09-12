import { AgendaModel } from "~/server/models/AgendaModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IAgendaResponse, IError } from "~/types/IResponse";

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
 * Handles GET requests for agenda data.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Event | Event[]>} The event data or an array of events.
 * @throws {H3Error} If an error occurs during the process.
 */
export default defineEventHandler(
  async (event): Promise<IAgendaResponse | IError> => {
    try {
      const { id } = getQuery(event);
      if (id) {
        // Fetch a single agenda by ID
        const eventData = await AgendaModel.findById(
          id,
          {},
          { autopopulate: false }
        );
        if (!eventData) {
          throw createError({
            statusCode: 404,
            statusMessage: "Agenda not found",
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
          statusCode: 200,
          statusMessage: "Agenda found",
          data: {
            ...eventData.toJSON(),
            committee,
          },
        };
      }

      // Fetch multiple agendas based on user roles
      const roles: string[] = ["All", "External"];
      const auth = checkAuth(event);
      if (auth) {
        const user = event.context.user;
        if (event.context.organizer) {
          if (!roles.includes("Internal")) {
            roles.push("Internal");
          }
          roles.push("Admin");
          roles.push("Departement");
        }
      }
      const events = await AgendaModel.find({ canSee: { $in: roles } });
      if (!events) {
        throw createError({
          statusCode: 400,
          message: "No agendas found",
        });
      }
      return {
        statusCode: 200,
        statusMessage: "Agendas found",
        data: events,
      };
    } catch (error: any) {
      return {
        statusCode: error.statusCode || 500,
        statusMessage:
          error.message ||
          "An unexpected error occurred while fetching agenda data",
      };
    }
  }
);
