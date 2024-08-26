import { SortOrder } from "mongoose";
import { AdministratorModel } from "~/server/models/AdministratorModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IAdministrator, IEvent, IProfile, IProject } from "~/types";
import { IReqProfileQuery } from "~/types/IRequestPost";

type ISortable = {
  [key: string]: SortOrder;
};

/**
 * Handles GET requests for retrieving user profiles.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing profiles, total count, and filters.
 * @throws {H3Error} If the user is not authorized or if a system error occurs.
 */
export default defineEventHandler(async (event) => {
  try {
    let { NIM, perPage, page, order, sort, search, filter, filterBy, deleted } =
      getQuery<IReqProfileQuery>(event);

    // If NIM is provided without pagination, return a single profile
    if (NIM && !perPage && !page) {
      const profile = await ProfileModel.findOne({ NIM });
      return profile;
    }

    let query: any = {};
    let sortOpt: ISortable = {};

    // Apply filters based on query parameters
    if (deleted == "false") {
      query.status = { $nin: "deleted" };
    }
    if (order && sort) {
      sortOpt[sort] = order as SortOrder;
    }
    if (filter && filterBy) {
      query[filterBy] = filter;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // Ensure user is authenticated and authorized
    const user = await ensureAuth(event);
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to access this",
      });
    }

    if (!user.profile.isDepartement && !user.profile.isAdministrator) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to access this",
      });
    }

    // Count total documents matching the query
    const length = await ProfileModel.countDocuments(query);

    // Get unique filter values if filterBy is provided
    let filters = null;
    if (filterBy) {
      const profiles = await ProfileModel.find();
      filters = [
        ...new Set(profiles.map((v) => v[filterBy as keyof IProfile])),
      ];
    }

    // Fetch profiles with populated fields
    const profiles = await ProfileModel.find(query)
      .populate({
        path: "events",
        select: "title date at description -_id",
        transform: (doc: IEvent) => ({
          title: doc.title,
          date: doc.date,
          at: doc.at,
          description: doc.description,
        }),
      })
      .populate({
        path: "projects",
        select: "title deadline description -_id",
        transform: (doc: IProject) => ({
          title: doc.title,
          deadline: doc.deadline,
          description: doc.description,
        }),
      })
      .populate({
        path: "isDepartement",
        select: "departement period -_id",
        options: { autopopulate: false },
      })
      .populate({
        path: "isAdministrator",
        model: AdministratorModel,
        transform: (doc: IAdministrator, id) => {
          if (doc) {
            return {
              role: doc.AdministratorMembers.find(
                (adm) => (adm.profile as IProfile).id == id
              )?.role,
              period: doc.period,
            };
          }
          return null;
        },
      })
      .select(
        "NIM avatar fullName email class semester enteredYear createdAt status"
      )
      .sort(sortOpt)
      .skip((Number(page) - 1) * Number(perPage))
      .limit(Number(perPage));

    return {
      profiles,
      length,
      filters,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      message:
        error.message || "An unexpected error occurred while fetching profiles",
    });
  }
});
