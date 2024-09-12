import { ConfigModel } from "~/server/models/ConfigModel";
import type { IConfigResponse } from "~/types/IResponse";
export default defineEventHandler(async (event): Promise<IConfigResponse> => {
  try {
    const config = await ConfigModel.find();
    if (config.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "No config found",
      });
    }
    const lastConfigItem = config[config.length - 1];
    return {
      statusCode: 200,
      statusMessage: "Success",
      data: lastConfigItem,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
