import { ProfileModel } from "~/server/models/ProfileModel";

export default defineEventHandler(async (event) => {
  try {
    const user = await ensureAuth(event);
    const { NIM } = getQuery(event);

    if (
      user.profile.NIM != NIM &&
      !user.profile.isAdministrator &&
      !user.profile.isDepartement
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: "Who are you ? it's not your profile!!!",
      });
    }
    const profile = await ProfileModel.findOne({ NIM });
    if (!profile) {
      throw createError({
        statusCode: 404,
        message: "Profile not found",
      });
    }
    profile.status = "deleted";
    await profile.save();
    return {
      statusCode: 200,
      statusMessage: `Profile ${profile.NIM} updated`,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
});
