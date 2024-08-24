import type { IProject } from "~/types";
import type { IProjectResponse } from "~/types/IResponse";

export const useProjects = () => {
  const { $api } = useNuxtApp();
  const page = ref<number>(1);
  const perPage = ref<number>(10);
  const { canMeRegister } = useCanMeRegister();
  const { data: user } = useAuth();
  const { data, refresh: refreshProjects } = useLazyAsyncData(() =>
    $api<IProjectResponse>("/api/project", {
      query: {
        page: page.value,
        perPage: perPage.value,
      },
    })
  );
  const projects = computed<IProject[] | undefined>(() => {
    return data.value?.projects;
  });
  const totalProjects = computed<number | undefined>(() => {
    return data.value?.length;
  });
  const projectsMe = computed<IProject[]>(() => {
    return user.value?.profile.projects;
  });
  const ProjectsCanMeRegistered = computed<IProject[] | undefined>(() => {
    return data.value?.projects.filter((Project) =>
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
  };
};
