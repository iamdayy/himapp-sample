import { MemberModel } from "~/server/models/MemberModel";
import OrganizerModel from "~/server/models/OrganizerModel";
import type { IOrganizerResponse } from "~/types/IResponse";

export default defineEventHandler(
  async (event): Promise<IOrganizerResponse> => {
    try {
      const query = getQuery<{ NIM?: number }>(event);
      if (query.NIM) {
        const id = await getIdByNim(query.NIM as number);
        const organizer = await OrganizerModel.findOne({
          $or: [
            { "dailyManagement.member": id },
            { "department.coordinator": id },
            { "department.members.member": id },
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
    const member = await MemberModel.findOne({ NIM });
    if (!member) {
      throw createError({
        statusCode: 404,
        message: `Member not found for NIM: ${NIM}`,
      });
    }
    return member._id;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message:
        error.message ||
        `An error occurred while fetching member for NIM: ${NIM}`,
    });
  }
};
