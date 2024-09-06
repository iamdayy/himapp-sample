import { model, Schema } from "mongoose";
import type { IPhotoSchema } from "~/types/ISchemas";

const photoSchema = new Schema<IPhotoSchema>({
  title: { type: String, required: true },
  image: { type: String, required: true },
});

export const PhotoModel = model<IPhotoSchema>("Photo", photoSchema);
