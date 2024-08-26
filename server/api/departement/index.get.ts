import { DepartementModel } from "~/server/models/DepartementModel";
import { ProfileModel } from "~/server/models/ProfileModel";

/**
 * Handles GET requests for department data.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Departement | Departement[] | H3Error>} The department data or an error.
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    if (query.NIM) {
      const id = await getIdByNim(query.NIM as number);
      const departement = await DepartementModel.findOne({ profile: id });
      return departement;
    }
    const departements = await DepartementModel.find();
    return departements;
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      message:
        error.message || "An error occurred while fetching department data",
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
