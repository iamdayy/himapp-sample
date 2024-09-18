import type { IProject } from "~/types";
import type { IProjectsResponse } from "~/types/IResponse";

export const useProjects = () => {
  const { $api } = useNuxtApp();
  const page = ref<number>(1);
  const perPage = ref<number>(10);
  const showMissed = ref<boolean>(false);
  const sort = ref<string>("deadline");
  const order = ref<string>("asc");
  const { canMeRegister } = useCanMeRegister();
  const { data: user } = useAuth();
  const { data, refresh: refreshProjects } = useLazyAsyncData(
    "projects",
    () =>
      $api<IProjectsResponse>("/api/project", {
        query: {
          page: page.value,
          perPage: perPage.value,
          showMissed: showMissed.value,
          sort: sort.value,
          order: order.value,
        },
      }),
    { watch: [page, perPage, showMissed, sort, order] }
  );
  const projects = computed<IProject[] | undefined>(() => {
    return data.value?.data?.projects;
  });
  const totalProjects = computed<number | undefined>(() => {
    return data.value?.data?.length;
  });
  const projectsMe = computed<IProject[]>(() => {
    return user.value?.profile.projects;
  });
  const ProjectsCanMeRegistered = computed<IProject[] | undefined>(() => {
    return data.value?.data?.projects?.filter((Project) =>
      canMeRegister(Project.canRegister)
    );
  });
  return {
    projects,
    page,
    perPage,
    totalProjects,
    projectsMe,
    ProjectsCanMeRegistered,
    refreshProjects,
    showMissed,
    sort,
    order,
  };
};
