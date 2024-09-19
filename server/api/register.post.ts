import { UserModel } from "~/server/models/UserModel";
import {
  findMemberAndMarkRegister,
  findMemberByNim,
} from "~/server/utils/findMember";
import { IReqRegister } from "~/types/IRequestPost";
import { IRegisterResponse } from "~/types/IResponse";

/**
 * Handles POST requests for user registration.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<IRegisterResponse>} A promise that resolves to the registered user data.
 * @throws {H3Error} If the NIM is not found or if registration fails.
 */
export default defineEventHandler(async (event): Promise<IRegisterResponse> => {
  try {
    // Read the request body
    const body = await readBody<IReqRegister>(event);

    // Find the member ID associated with the given NIM
    const memberId = await findMemberByNim(body.NIM);
    if (!memberId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Error: Your NIM was not found in our records.",
      });
    }

    // Prepare the user registration form
    const form = {
      ...body,
      member: memberId,
    };

    // Mark the member as registered
    await findMemberAndMarkRegister(memberId);

    // Create a new user instance and save it
    const user = new UserModel(form);
    const registered = await user.save();

    // Check if the user was successfully registered
    if (!registered) {
      throw createError({
        statusCode: 401,
        statusMessage: "Error: Registration failed. Please try again.",
      });
    }

    // Return the registered user data
    return {
      statusCode: 200,
      statusMessage: "Registration successful",
      data: registered,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      statusMessage: "Registration failed",
      data: error,
    };
  }
});
