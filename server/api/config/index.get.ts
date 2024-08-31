import { ConfigModel } from "~/server/models/ConfigModel";

export default defineEventHandler(async (event) => {
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
      body: lastConfigItem,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
