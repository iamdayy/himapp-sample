import mongoose, { Model, Schema, Types } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { IPostSchema } from "~/types/ISchemas";

/**
 * Schema definition for the Post model.
 */
const PostSchema = new Schema<IPostSchema>(
  {
    /**
     * The title of the post.
     */
    title: { type: String, required: true },

    /**
     * The URL of the main image for the post.
     */
    mainImage: { type: String, required: true },

    /**
     * The main content of the post.
     */
    body: {
      type: String,
      required: true,
    },

    /**
     * A unique URL-friendly version of the post title.
     */
    slug: { type: String, required: true, unique: true },

    /**
     * An array of categories the post belongs to.
     */
    categories: [
      {
        /**
         * The title of the category.
         */
        title: { type: String, required: true },

        /**
         * A brief description of the category.
         */
        description: { type: String, required: true },
      },
    ],

    /**
     * Reference to the author's profile.
     */
    author: {
      type: Types.ObjectId,
      required: true,
      ref: "Profile",
      autopopulate: true,
    },

    /**
     * Indicates whether the post is published or not.
     */
    published: { type: Boolean, default: false },

    /**
     * The date when the post was published.
     */
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Enable auto-population for referenced documents
PostSchema.plugin(mongooseAutoPopulate);

// Virtual field for related posts
PostSchema.virtual("relatedPosts", {
  ref: "Post",
  localField: "categories.title",
  foreignField: "categories.title",
  justOne: false,
  options: { limit: 3, sort: { createdAt: -1 } },
});

// Ensure virtuals are included when converting document to JSON
PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

/**
 * Mongoose model for the Post collection.
 */
export const PostModel: Model<IPostSchema> = mongoose.model<IPostSchema>(
  "Post",
  PostSchema
);
