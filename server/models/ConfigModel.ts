import mongoose from "mongoose";
import type { IConfigSchema } from "~/types/ISchemas";

const configSchema = new mongoose.Schema<IConfigSchema>({
  dailyManagements: { type: [String], required: true },
  departments: { type: [String], required: true },
});

export const ConfigModel = mongoose.model<IConfigSchema>(
  "Config",
  configSchema
);
