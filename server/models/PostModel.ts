import mongoose, { Model, Schema, Types } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { IPostSchema } from "~/types/ISchemas";

const PostSchema = new Schema<IPostSchema>(
  {
    title: { type: String, required: true },
    mainImage: { type: String, required: true },
    body: {
      type: String,
      required: true,
    },
    slug: { type: String, required: true, unique: true }, // Slug harus unik
    categories: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    author: {
      type: Types.ObjectId,
      required: true,
      ref: "Profile",
      autopopulate: true,
    },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);
PostSchema.plugin(mongooseAutoPopulate);

// Virtual field untuk related posts
// Kita perlu menentukan logika untuk mencari related posts berdasarkan kategori atau kriteria lain
PostSchema.virtual("relatedPosts", {
  ref: "Post",
  localField: "categories.title", // Contoh: Menggunakan judul kategori untuk mencari related posts
  foreignField: "categories.title",
});

export const PostModel: Model<IPostSchema> = mongoose.model<IPostSchema>(
  "Post",
  PostSchema
);
