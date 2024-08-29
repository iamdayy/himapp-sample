import type { IAgenda } from "~/types";

export const useAgendas = () => {
  const { $api } = useNuxtApp();
  const { canMeRegister } = useCanMeRegister();
  const { data: agendas, refresh: refreshAgendas } = useLazyAsyncData(() =>
    $api<IAgenda[]>("/api/agenda")
  );
  const { data: user } = useAuth();
  const agendasMe = computed<IAgenda[]>(() => {
    return user.value?.profile.agendas;
  });
  const agendasCanMeRegistered = computed<IAgenda[] | undefined>(() => {
    return agendas.value?.filter((agenda) =>
      canMeRegister(agenda.canRegister, agenda.date)
    );
  });
  return {
    agendas,
    agendasMe,
    agendasCanMeRegistered,
    refreshAgendas,
  };
};
