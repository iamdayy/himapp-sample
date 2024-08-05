import { seedProfile } from "~/server/dev/faker/ProfileFaker";

export default defineEventHandler(async (ev) => {
  try {
    seedProfile();
    return "Ok";
  } catch (error) {
    return error;
  }
});
