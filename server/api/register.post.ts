import { UserModel } from "~/server/models/UserModel";
import { IReqRegister } from "~/types/IRequestPost";
import { IRegisterResponse } from "~/types/IResponse";
import {
  findProfileAndMarkRegister,
  findProfileByNim,
} from "../utils/findProfile";

/**
 * Handles POST requests for user registration.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<IRegisterResponse>} A promise that resolves to the registered user data.
 * @throws {H3Error} If the NIM is not found or if registration fails.
 */
export default defineEventHandler(async (event): Promise<IRegisterResponse> => {
  // Read the request body
  const body = await readBody<IReqRegister>(event);

  // Find the profile ID associated with the given NIM
  const profileId = await findProfileByNim(body.NIM);
  if (!profileId) {
    throw createError({
      statusCode: 400,
      message: "Error: Your NIM was not found in our records.",
    });
  }

  // Prepare the user registration form
  const form = {
    ...body,
    profile: profileId,
  };

  // Mark the profile as registered
  await findProfileAndMarkRegister(profileId);

  // Create a new user instance and save it
  const user = new UserModel(form);
  const registered = await user.save();

  // Check if the user was successfully registered
  if (!registered) {
    throw createError({
      statusCode: 401,
      message: "Error: Registration failed. Please try again.",
    });
  }

  // Return the registered user data
  return registered;
});
