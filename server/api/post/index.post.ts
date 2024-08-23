import fs from "fs";
import { readFiles } from "h3-formidable";
import { firstValues } from "h3-formidable/helpers";
import { Types } from "mongoose";
import path from "path";
import { PostModel } from "~/server/models/PostModel";
import { ProfileModel } from "~/server/models/ProfileModel";
const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    const user = await ensureAuth(event);
    const BASE_MAINIMAGE_FOLDER = "img/posts";
    let imageUrl = "";
    let oldPath = "";
    let newPath = "";
    if (!user.profile.isAdministrator && !user.profile.isDepartement) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "You must be administrator or departement to use this endpoint",
      });
    }
    const { fields, files, form } = await readFiles(event);
    const exceptions = [""];
    const single = firstValues(form, fields, exceptions);
    const mainImage = files.mainImage![0];
    if (mainImage.mimetype?.startsWith("image/")) {
      let imageName =
        Date.now() +
        Math.round(Math.random() * 100000) +
        mainImage.originalFilename!;
      oldPath = mainImage.filepath;
      newPath = `${path.join(config.mount, BASE_MAINIMAGE_FOLDER, imageName)}`;
      fs.copyFileSync(oldPath, newPath);
      imageUrl = `/${BASE_MAINIMAGE_FOLDER}/${imageName}`;
    } else {
      throw createError({
        statusMessage: "Please upload nothing but images.",
      });
    }
    const body = {
      ...single,
      categories: JSON.parse(single.categories as unknown as string),
      slug: (single.title as unknown as string)
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""),
      mainImage: imageUrl,
      author: (await getIdByNim(user.profile.NIM)) as Types.ObjectId,
    };

    const post = new PostModel(body);
    const saved = await post.save();
    if (!saved) {
      return {
        statusCode: 400,
        statusMessage: `Failed to add new Post ${post.title}`,
      };
    }
    return {
      statusCode: 200,
      statusMessage: `Success to add new Post ${post.title}`,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
});

const getIdByNim = async (NIM: number): Promise<unknown> => {
  try {
    const profile = await ProfileModel.findOne({ NIM });
    return profile?._id;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
};
