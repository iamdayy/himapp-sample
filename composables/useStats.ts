export const useStats = () => {
  function calc(num: number) {
    var with2Decimals = num.toString().match(/^-?\d+(?:\.\d{0,2})?/)![0];
    return parseFloat(with2Decimals);
  }
  const { agendasCanMeRegistered, agendasMe } = useAgendas();
  const { ProjectsCanMeRegistered, projectsMe } = useProjects();
  const EventPercentage = computed<number>(() => {
    return calc(
      (agendasMe.value.length! / agendasCanMeRegistered.value?.length!) * 100
    );
  });
  const ProjectPercentage = computed<number>(() => {
    return calc(
      (projectsMe.value.length! / ProjectsCanMeRegistered.value?.length!) * 100
    );
  });
  const all = computed<number>(() => {
    return agendasMe.value.length! + projectsMe.value.length!;
  });
  const allCanMeRegister = computed<number>(() => {
    return (
      agendasCanMeRegistered.value?.length! +
      ProjectsCanMeRegistered.value?.length!
    );
  });
  const allPercentage = computed<number>(() => {
    return calc((all.value / allCanMeRegister.value) * 100);
  });
  return {
    agendasMe,
    projectsMe,
    allCanMeRegister,
    all,
    agendasCanMeRegistered,
    ProjectsCanMeRegistered,
  };
};
