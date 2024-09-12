import OrganizerModel from "~/server/models/OrganizerModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import type { IOrganizerResponse } from "~/types/IResponse";

export default defineEventHandler(
  async (event): Promise<IOrganizerResponse> => {
    try {
      const query = getQuery<{ NIM?: number }>(event);
      if (query.NIM) {
        const id = await getIdByNim(query.NIM as number);
        const organizer = await OrganizerModel.findOne({
          $or: [
            { "dailyManagement.profile": id },
            { "department.coordinator": id },
            { "department.members.profile": id },
          ],
        });
        return {
          statusCode: 200,
          statusMessage: "Organizer fetched successfully.",
          data: organizer ? organizer.toObject() : undefined,
        };
      }
      const organizers = await OrganizerModel.find();
      return {
        statusCode: 200,
        statusMessage: "Organizer fetched successfully.",
        data: organizers.map((organizer) => organizer.toObject()),
      };
    } catch (error: any) {
      return {
        statusCode: error.statusCode || 500,
        statusMessage: error.message || "Internal server error.",
      };
    }
  }
);

const getIdByNim = async (NIM: number): Promise<unknown> => {
  try {
    const profile = await ProfileModel.findOne({ NIM });
    if (!profile) {
      throw createError({
        statusCode: 404,
        message: `Profile not found for NIM: ${NIM}`,
      });
    }
    return profile._id;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message:
        error.message ||
        `An error occurred while fetching profile for NIM: ${NIM}`,
    });
  }
};
