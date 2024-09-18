import mongoose, { Model, Schema, Types } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { INewsSchema } from "~/types/ISchemas";

/**
 * Schema definition for the News model.
 */
const NewsSchema = new Schema<INewsSchema>(
  {
    /**
     * The title of the news.
     */
    title: { type: String, required: true },

    /**
     * The URL of the main image for the news.
     */
    mainImage: { type: String, required: true },

    /**
     * The main content of the news.
     */
    body: {
      type: String,
      required: true,
    },

    /**
     * A unique URL-friendly version of the news title.
     */
    slug: { type: String, required: true, unique: true },

    /**
     * An array of categories the news belongs to.
     */
    category: {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },

    /**
     * Reference to the author's profile.
     */
    author: {
      type: Types.ObjectId,
      required: true,
      ref: "Profile",
      autopopulate: {
        select: "fullName avatar",
      },
    },

    /**
     * An array of tags for the news.
     */
    tags: {
      type: [String],
      required: true,
    },

    /**
     * Indicates whether the news is published or not.
     */
    published: { type: Boolean, default: false },

    /**
     * The date when the news was published.
     */
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Enable auto-population for referenced documents
NewsSchema.plugin(mongooseAutoPopulate);
NewsSchema.index({ title: "text" });

// // Virtual field for related news
// NewsSchema.virtual("related", {
//   ref: "News",
//   justOne: false,
//   options: { limit: 3 },
//   // s
// });

// Ensure virtuals are included when converting document to JSON
NewsSchema.set("toJSON", { virtuals: true });
NewsSchema.set("toObject", { virtuals: true });

// Metode instance untuk mencari berita terkait
NewsSchema.methods.findRelated = async function (limit = 3) {
  return this.model("News")
    .find({
      _id: { $ne: this._id },
      published: true,
      $or: [{ tags: { $in: this.tags } }, { title: this.title }],
    })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select("title slug");
};

/**
 * Mongoose model for the News collection.
 */
export const NewsModel: Model<INewsSchema> = mongoose.model<INewsSchema>(
  "News",
  NewsSchema
);
