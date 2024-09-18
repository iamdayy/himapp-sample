import { NewsModel } from "~/server/models/NewsModel";
import type { ICategoriesResponse } from "~/types/IResponse";
export default defineEventHandler(
  async (event): Promise<ICategoriesResponse> => {
    try {
      const categories = await NewsModel.find().distinct("category");
      if (!categories) {
        return {
          statusCode: 404,
          statusMessage: "No categories found",
        };
      }
      return {
        statusCode: 200,
        statusMessage: "Categories fetched successfully",
        data: {
          categories: categories,
          length: categories.length,
        },
      };
    } catch (error) {
      return {
        statusCode: 500,
        statusMessage: "Failed to fetch categories",
      };
    }
  }
);
