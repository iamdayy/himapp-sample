import type { IOrganizerResponse } from "~/types/IResponse";

export const useOrganizer = () => {
  const { data: user, status } = useAuth();
  const organizer = ref<{
    role: string;
    period: { start: Date; end: Date };
  } | null>(null);
  const isOrganizer = ref<boolean>(false);
  const {
    data,
    refresh: refreshOrganizers,
    pending: pendingOrganizers,
  } = useLazyAsyncData("organizers", () =>
    $fetch<IOrganizerResponse>("/api/organizer")
  );
  const fetchData = () => {
    organizer.value = null;
    if (status.value == "authenticated") {
      if (user.value?.member.organizer) {
        isOrganizer.value = true;
        organizer.value = user.value?.member.organizer;
      }
    }
  };
  watchEffect(() => {
    fetchData();
  });
  const organizers = computed(() => data.value?.data);
  return {
    organizer,
    isOrganizer,
    organizers,
    refreshOrganizers,
    pendingOrganizers,
  };
};
