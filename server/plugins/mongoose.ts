import mongoose from "mongoose";
const config = useRuntimeConfig();
export default defineNitroPlugin(async () => {
  try {
    await mongoose.connect(config.mongodb_uri, {
      dbName: config.dbName,
      user: config.mongodb_username,
      pass: config.mongodb_password,
      authSource: config.dbName,
    });
    console.log("DB connection established.");
  } catch (err) {
    console.error("DB connection failed.", err);
  }
});
