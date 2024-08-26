import type { Types } from "mongoose";
import { ProfileModel } from "../models/ProfileModel";

/**
 * Finds a profile by NIM (Nomor Induk Mahasiswa) and returns its ObjectId.
 *
 * @param nim - The NIM to search for.
 * @returns A Promise that resolves to the profile's ObjectId if found, or false otherwise.
 * @throws {Error} If there's an error during the database operation.
 */
export const findProfileByNim = async (
  nim: number
): Promise<Types.ObjectId | false> => {
  try {
    const profile = await ProfileModel.findOne({ NIM: nim });
    if (!profile) {
      return false;
    }
    return profile._id as Types.ObjectId;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
};

/**
 * Finds a profile by its ObjectId and marks it as registered by changing its status to "active".
 *
 * @param id - The ObjectId of the profile to find and mark as registered.
 * @throws {Error} If the profile is not found or cannot be registered, or if there's an error during the database operation.
 */
export const findProfileAndMarkRegister = async (
  id: Types.ObjectId
): Promise<void> => {
  try {
    const profile = await ProfileModel.findById(id);
    if (!profile) {
      throw createError({
        statusCode: 404,
        message: "Profile not found",
      });
    }
    if (profile.status !== "free") {
      throw createError({
        statusCode: 400,
        message: "This profile cannot be registered",
      });
    }
    profile.status = "active";
    await profile.save();
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message:
        error.message || "An error occurred while registering the profile",
    });
  }
};
