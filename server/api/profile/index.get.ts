import { SortOrder } from "mongoose";
import { AdministratorModel } from "~/server/models/AdministratorModel";
import { ProfileModel } from "~/server/models/ProfileModel";
import { IAdministrator, IEvent, IProfile, IProject } from "~/types";
import { IReqProfileQuery } from "~/types/IRequestPost";

type ISortable = {
  [key: string]: SortOrder;
};

export default defineEventHandler(async (event) => {
  try {
    let { NIM, perPage, page, order, sort, search, filter, filterBy, deleted } =
      getQuery<IReqProfileQuery>(event);
    if (NIM && !perPage && !page) {
      const profile = await ProfileModel.findOne({ NIM });
      return profile;
    }

    let query = {};
    let sortOpt = {};
    if (deleted == "false") {
      query = {
        ...query,
        status: { $nin: "deleted" },
      };
    }
    if (order && sort) {
      sortOpt = { [sort]: order };
    }
    if (filter && filterBy) {
      query = {
        ...query,
        [filterBy]: filter,
      };
    }
    if (search) {
      query = {
        ...query,
        $text: {
          $search: search,
        },
      };
    }

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
    const length = await ProfileModel.countDocuments(query);
    let filters = null;
    if (filterBy) {
      const profiles = await ProfileModel.find();
      filters = [
        ...new Set(profiles.map((v) => (filterBy ? v[filterBy] : null))),
      ];
    }

    const profiles = await ProfileModel.find(query)
      .populate({
        path: "events",
        select: "title date at description -_id",
        transform: (doc: IEvent, id) => ({
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
      .skip((page - 1) * perPage)
      .limit(perPage);
    return {
      profiles,
      length,
      filters,
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode,
      message: error.message,
    });
  }
});
