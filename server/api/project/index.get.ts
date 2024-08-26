import { ProfileModel } from "~/server/models/ProfileModel";
import { ProjectModel } from "~/server/models/ProjectModel";
import { checkAuth } from "~/server/utils/authHelper";
import { IReqProjectQuery } from "~/types/IRequestPost";

/**
 * Retrieves the NIM (Student ID) from a given profile ID.
 * @param {string} id - The profile ID.
 * @returns {Promise<number>} The NIM of the profile.
 * @throws {H3Error} If the profile is not found or NIM is missing.
 */
const getNimFromID = async (id: string): Promise<number> => {
  const profile = await ProfileModel.findById(id);

  if (!profile?.NIM) {
    throw createError({
      statusCode: 404,
      statusMessage: "Profile not found or NIM is missing",
    });
  }

  return profile.NIM;
};

/**
 * Handles GET requests for retrieving project information.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing project data or a list of projects.
 * @throws {H3Error} If the project is not found or if a system error occurs.
 */
export default defineEventHandler(async (event) => {
  try {
    const { perPage, page, id } = getQuery<IReqProjectQuery>(event);

    // If an ID is provided, return a single project
    if (id) {
      const project = await ProjectModel.findById(
        id,
        {},
        { autopopulate: false }
      );
      if (!project) {
        throw createError({
          statusCode: 404,
          statusMessage: "Project not found",
        });
      }
      const contributors = await Promise.all(
        project?.contributors?.map(async (contributor) => ({
          profile: await getNimFromID(contributor.profile as string),
          job: contributor.job,
        }))!
      );

      return {
        ...project.toJSON(),
        contributors,
      };
    }

    // If no ID is provided, return a list of projects
    const roles: string[] = ["All", "External"];
    const auth = checkAuth(event);
    if (auth) {
      const user = await ensureAuth(event);
      if (user.profile.isAdministrator) {
        if (!roles.includes("Internal")) {
          roles.push("Internal");
        }
        roles.push("Admin");
      }
      if (user.profile.isDepartement) {
        if (!roles.includes("Internal")) {
          roles.push("Internal");
        }
        roles.push("Departement");
      }
    }

    const projectsLength = await ProjectModel.countDocuments({
      canSee: { $in: roles },
    });

    const projects = await ProjectModel.find({
      canSee: { $in: roles },
    })
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    return {
      projects,
      length: projectsLength,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      message: error.message || "An unexpected error occurred",
    });
  }
});
