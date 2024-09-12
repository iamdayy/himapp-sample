import type { IAgenda } from "~/types";
import type { IAgendaResponse } from "~/types/IResponse";

export const useAgendas = () => {
  const { $api } = useNuxtApp();
  const { canMeRegister } = useCanMeRegister();
  const {
    data,
    refresh: refreshAgendas,
    pending: pendingAgendas,
  } = useLazyAsyncData("agendas", () => $api<IAgendaResponse>("/api/agenda"));
  const { data: user } = useAuth();
  const agendasMe = computed<IAgenda[]>(() => {
    return user.value?.profile.agendas;
  });
  const agendasCanMeRegistered = computed<IAgenda[] | undefined>(() => {
    return data.value?.data.filter((agenda) =>
      canMeRegister(agenda.canRegister, agenda.date)
    );
  });
  const agendas = computed<IAgenda[] | undefined>(() => {
    return data.value?.data;
  });
  return {
    agendas,
    agendasMe,
    agendasCanMeRegistered,
    refreshAgendas,
    pendingAgendas,
  };
};
