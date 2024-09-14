import OrganizerModel from "~/server/models/OrganizerModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IFile, IOrganizer, IProfile } from "~/types";
import { IResponse } from "~/types/IResponse";

export default defineEventHandler(async (event): Promise<IResponse> => {
  try {
    const BASE_AVATAR_FOLDER = "/uploads/img/avatar";
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "You must be logged in to use this endpoint",
      });
    }
    if (!event.context.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to use this endpoint",
      });
    }
    const isChairman = (
      event.context.organizer as IOrganizer
    ).dailyManagement.some(
      (daily) =>
        (daily.profile as IProfile).NIM === user.profile.NIM &&
        ["Ketua", "Chairman", "Leader"].includes(daily.position)
    );

    if (!isChairman) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be chairman to use this endpoint",
      });
    }
    const isOneMonthToEndPeriod =
      new Date(event.context.organizer.period.end).getTime() -
        1000 * 60 * 60 * 24 * 30 <=
      Date.now();

    if (!isOneMonthToEndPeriod) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "You must be one month to end period to use this endpoint",
      });
    }

    const body = await readBody<IOrganizer>(event);

    const councilPromises = body.council.map(async (council) => {
      const image = council.image as IFile;
      if (image.type?.startsWith("image/")) {
        const hashedName = await storeFileLocally(
          image,
          12,
          BASE_AVATAR_FOLDER
        );
        council.image = `${BASE_AVATAR_FOLDER}/${hashedName}`;
      }
      return {
        position: council.position,
        name: council.name,
        image: council.image,
      };
    });

    const advisorImage = body.advisor.image as IFile;
    let imageUrlAdvisor = "";
    if (advisorImage.type?.startsWith("image/")) {
      const hashedName = await storeFileLocally(
        advisorImage,
        12,
        BASE_AVATAR_FOLDER
      );
      imageUrlAdvisor = `${BASE_AVATAR_FOLDER}/${hashedName}`;
    }
    const advisor = {
      position: body.advisor.position,
      name: body.advisor.name,
      image: imageUrlAdvisor,
    };

    const considerationBoardPromises = body.considerationBoard.map(
      async (profile) => {
        return await getProfileIdByNim(profile as number);
      }
    );

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

    const [dailyManagement, department, considerationBoard, council] =
      await Promise.all([
        Promise.all(dailyManagementPromises),
        Promise.all(departmentPromises),
        Promise.all(considerationBoardPromises),
        Promise.all(councilPromises),
      ]);
    const organizer = await OrganizerModel.create({
      council,
      advisor,
      considerationBoard,
      dailyManagement,
      department,
      period: body.period,
    });
    if (!organizer) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create organizer.",
      });
    }

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
