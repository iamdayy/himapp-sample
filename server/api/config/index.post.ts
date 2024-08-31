import { ConfigModel } from "~/server/models/ConfigModel";
import type { IConfig } from "~/types";
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<IConfig>(event);
    const config = await ConfigModel.create(body);
    return config;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
