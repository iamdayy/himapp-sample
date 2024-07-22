import formidable from "formidable";
import fs from "fs";
import { IncomingMessage } from "http";
import path from "path";
import { ProfileModel } from "~/server/models/ProfileModel";
const config = useRuntimeConfig();

const getAvatar = (req: IncomingMessage): Promise<string> => {
  const BASE_AVATAR_FOLDER = "img/avatars";
  let imageUrl = "";
  let oldPath = "";
  let newPath = "";

  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      if (!files.avatar) {
        reject({
          status: "error",
          statusMessage: "Please upload a photo with name photo in the form",
        });
        return;
      }
      if (files.avatar[0].mimetype?.startsWith("image/")) {
        let imageName =
          Date.now() +
          Math.round(Math.random() * 100000) +
          files.avatar[0].originalFilename!;
        oldPath = files.avatar[0].filepath;
        newPath = `${path.join(
          config.public.mount,
          BASE_AVATAR_FOLDER,
          imageName
        )}`;
        imageUrl = `/${BASE_AVATAR_FOLDER}/${imageName}`;
        fs.copyFileSync(oldPath, newPath);
        resolve(imageUrl);
        return;
      } else {
        reject({
          statusMessage: "Please upload nothing but images.",
        });
        return;
      }
    });
  });
};

export default defineEventHandler(async (event) => {
  try {
    const user = await ensureAuth(event);
    const { NIM } = getQuery(event);
    if (user.profile.NIM != NIM) {
      throw createError({
        statusCode: 403,
        statusMessage: "Who are you ? it's not your profile!!!",
      });
    }
    const profile = await ProfileModel.findOne({ NIM });
    if (!profile) {
      throw createError({
        statusCode: 404,
        message: "Profile not found",
      });
    }
    if (profile.avatar) {
      const exist = fs.existsSync(
        `${path.join(config.public.mount, profile.avatar)}`
      );
      if (exist) {
        fs.rmSync(`${path.join(config.public.mount, profile.avatar)}`);
      }
    }
    const avatar = await getAvatar(event.node.req);
    profile.avatar = avatar;
    await profile.save();
    return {
      statusCode: 200,
      statusMessage: `Avatar ${profile.NIM} updated`,
      avatar,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
});
