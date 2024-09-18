import { SortOrder } from "mongoose";
import { ProfileModel } from "~/server/models/ProfileModel";
import { ProjectModel } from "~/server/models/ProjectModel";
import { IReqProjectQuery } from "~/types/IRequestPost";
import { IProjectsResponse } from "~/types/IResponse";

type ISortable = {
  [key: string]: SortOrder;
};

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
export default defineEventHandler(async (event): Promise<IProjectsResponse> => {
  try {
    const { perPage, page, id, showMissed, sort, order } =
      getQuery<IReqProjectQuery>(event);

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
        statusCode: 200,
        statusMessage: "Project fetched",
        data: {
          project: {
            ...project.toJSON(),
            contributors,
          },
        },
      };
    }

    // If no ID is provided, return a list of projects
    const roles: string[] = ["All", "External"];
    const user = event.context.user;
    if (user) {
      if (event.context.organizer) {
        if (!roles.includes("Internal")) {
          roles.push("Internal");
        }
        if (!roles.includes("Admin")) {
          roles.push("Admin");
        }
        if (!roles.includes("Departement")) {
          roles.push("Departement");
        }
      }
    }

    let query: any = {
      canSee: { $in: roles },
      deadline: { $gte: new Date() },
    };
    let sortOpt: ISortable = {};
    if (sort && order) {
      sortOpt = { deadline: order };
    }

    if (showMissed === "true") {
      query.deadline = { $lt: new Date() };
    }

    const projectsLength = await ProjectModel.countDocuments(query);

    const projects = await ProjectModel.find(query)
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage))
      .sort(sortOpt);

    return {
      statusCode: 200,
      statusMessage: "Projects fetched",
      data: {
        projects: projects.map((project) => project.toJSON()),
        length: projectsLength,
      },
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "An unexpected error occurred",
    };
  }
});
