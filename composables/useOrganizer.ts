import type { IOrganizer } from "~/types";

export const useOrganizer = () => {
  const { data: user, status } = useAuth();
  const organizer = ref<{
    role: string;
    period: { start: Date; end: Date };
  } | null>(null);
  const isOrganizer = ref<boolean>(false);
  const { data } = useLazyAsyncData(() =>
    $fetch<{ organizers: IOrganizer[] }>("/api/organizer")
  );
  const fetchData = () => {
    organizer.value = null;
    if (status.value == "authenticated") {
      if (user.value?.profile.organizer) {
        isOrganizer.value = true;
        organizer.value = user.value?.profile.organizer;
      }
    }
  };
  watchEffect(() => {
    fetchData();
  });
  return {
    organizer,
    isOrganizer,
    organizers: data.value?.organizers,
  };
};
