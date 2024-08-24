import type { IEvent } from "~/types";

export const useEvents = () => {
  const { $api } = useNuxtApp();
  const { canMeRegister } = useCanMeRegister();
  const { data: events, refresh: refreshEvents } = useLazyAsyncData(() =>
    $api<IEvent[]>("/api/event")
  );
  const { data: user } = useAuth();
  const eventsMe = computed<IEvent[]>(() => {
    return user.value?.profile.events;
  });
  const eventsCanMeRegistered = computed<IEvent[] | undefined>(() => {
    return events.value?.filter((event) =>
      canMeRegister(event.canRegister, event.date)
    );
  });
  return {
    events,
    eventsMe,
    eventsCanMeRegistered,
    refreshEvents,
  };
};
