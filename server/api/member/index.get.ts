import { SortOrder } from "mongoose";
import { MemberModel } from "~/server/models/MemberModel";
import OrganizerModel from "~/server/models/OrganizerModel";
import { IAgenda, IMember, IOrganizer, IProject } from "~/types";
import { IReqMemberQuery } from "~/types/IRequestPost";

type ISortable = {
  [key: string]: SortOrder;
};

/**
 * Handles GET requests for retrieving user members.
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<Object>} An object containing members, total count, and filters.
 * @throws {H3Error} If the user is not authorized or if a system error occurs.
 */
export default defineEventHandler(async (event) => {
  try {
    let { NIM, perPage, page, order, sort, search, filter, filterBy, deleted } =
      getQuery<IReqMemberQuery>(event);

    // If NIM is provided without pagination, return a single member
    if (NIM && !perPage && !page) {
      const member = await MemberModel.findOne({ NIM });
      return {
        statusCode: 200,
        statusMessage: "Member fetched",
        data: member,
      };
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
    const user = event.context.user;
    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be logged in to access this",
      });
    }

    if (!user.member.organizer) {
      throw createError({
        statusCode: 403,
        statusMessage: "You must be admin / departement to access this",
      });
    }

    // Count total documents matching the query
    const length = await MemberModel.countDocuments(query);

    // Get unique filter values if filterBy is provided
    let filters = null;
    if (filterBy) {
      const members = await MemberModel.find();
      filters = [...new Set(members.map((v) => v[filterBy as keyof IMember]))];
    }

    // Fetch members with populated fields
    const members = await MemberModel.find(query)
      .populate({
        path: "agendas",
        select: "title date at description -_id",
        transform: (doc: IAgenda) => ({
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
        path: "organizersDailyManagement",
        model: OrganizerModel,
        transform: (doc: IOrganizer, id: any) => {
          if (doc) {
            return {
              role: doc.dailyManagement.find(
                (daily) => (daily.member as IMember).id == id
              )?.position,
              period: doc.period,
            };
          }
          return null;
        },
      })
      .populate({
        path: "organizersDepartmentCoordinator",
        model: OrganizerModel,
        transform: (doc: IOrganizer, id: any) => {
          if (doc) {
            return {
              role: "Coordinator Departement",
              period: doc.period,
            };
          }
          return null;
        },
      })
      .populate({
        path: "organizersDepartmentMembers",
        model: OrganizerModel,
        transform: (doc: IOrganizer, id: any) => {
          if (doc) {
            return {
              role: "Member Departement",
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
      statusCode: 200,
      statusMessage: "Members fetched",
      data: {
        members: members.map((member) => {
          return {
            NIM: member.NIM,
            fullName: member.fullName,
            email: member.email,
            avatar: member.avatar,
            class: member.class,
            semester: member.semester,
            enteredYear: member.enteredYear,
            createdAt: member.createdAt,
            status: member.status,
            agendas: member.agendas,
            projects: member.projects,
            organizers: member.organizer,
          };
        }),
        length,
        filters,
      },
    };
  } catch (error: any) {
    return createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.message || "An unexpected error occurred while fetching members",
    });
  }
});
