import { AdministratorModel } from "~/server/models/AdministratorModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IAdministrator, IAdministratorMember } from "~/types";

/**
 * Handles POST requests to create a new administrator period.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} A response object with status code and message.
 * @throws {H3Error} If an error occurs during the process.
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await ensureAuth(event);
    if (!user.profile.isAdministrator && !user.profile.isDepartement) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "You must be administrator or departement to use this endpoint",
      });
    }
    const body = await readBody<IAdministrator>(event);
    await checkExistAdministrator(body.period.start, body.period.end);
    const AdministratorMembers = await Promise.all(
      body.AdministratorMembers.map(
        async (member) =>
          ({
            ...member,
            profile: await getIdByNim(member.profile as number),
          } as IAdministratorMember)
      )
    );
    const administrator = new AdministratorModel({
      period: body.period,
      AdministratorMembers,
    });
    const saved = await administrator.save();
    if (!saved) {
      return {
        statusCode: 400,
        statusMessage: `Failed to add new Administrator Period ${administrator.period.start.getFullYear()} - ${administrator.period.end.getFullYear()}`,
      };
    }
    return {
      statusCode: 200,
      statusMessage: `Success to add new Administrator Period ${administrator.period.start.getFullYear()} - ${administrator.period.end.getFullYear()}`,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
});

/**
 * Retrieves the profile ID associated with a given NIM (Student Identification Number).
 * @param {number} NIM - The Student Identification Number.
 * @returns {Promise<unknown>} The profile ID associated with the NIM.
 * @throws {H3Error} If an error occurs during the database query.
 */
const getIdByNim = async (NIM: number): Promise<unknown> => {
  try {
    const profile = await ProfileModel.findOne({ NIM });
    return profile?._id;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
};

/**
 * Checks if an administrator period already exists for the given date range.
 * @param {Date} start - The start date of the period.
 * @param {Date} end - The end date of the period.
 * @throws {H3Error} If an administrator period already exists within the given date range.
 */
const checkExistAdministrator = async (start: Date, end: Date) => {
  try {
    const administrator = await AdministratorModel.findOne({
      "period.start": { $gte: start },
      "period.end": { $lte: end },
    });
    if (administrator) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot add new administrator before period end",
      });
    }
    return;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
};
