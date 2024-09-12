import OrganizerModel from "~/server/models/OrganizerModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IOrganizer } from "~/types";
import { IResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }
    if (!event.context.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to use this endpoint",
      });
    }

    const body = await readBody<IOrganizer>(event);

    const dailyManagementPromises = body.dailyManagement.map(async (daily) => {
      const profileId = await getProfileIdByNim(daily.profile as number);
      return {
        position: daily.position,
        profile: profileId,
      };
    });

    const departmentPromises = body.department.map(async (department) => {
      const profileId = await getProfileIdByNim(
        department.coordinator as number
      );
      const memberPromises = department.members.map(async (member) => {
        return await getProfileIdByNim(member as number);
      });

      return {
        name: department.name,
        coordinator: profileId,
        members: await Promise.all(memberPromises),
      };
    });

    const [dailyManagement, department] = await Promise.all([
      Promise.all(dailyManagementPromises),
      Promise.all(departmentPromises),
    ]);
    const organizer = await OrganizerModel.create({
      dailyManagement,
      department,
      period: body.period,
    });

    return {
      statusCode: 200,
      statusMessage: "Organizer created successfully.",
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal server error.",
    };
  }
});

const getProfileIdByNim = async (NIM: number) => {
  console.log(NIM);

  const profile = await ProfileModel.findOne({ NIM });
  console.log(profile);
  return profile?._id || null;
};
