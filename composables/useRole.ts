import type { IPeriod } from "~/types";

export const useRole = (canAccess?: string[]) => {
  const { data: user, status } = useAuth();
  const role = ref<string | null>(null);
  const period = ref<IPeriod | null>(null);
  const isAdmin = ref<boolean>(false);
  const fetchData = () => {
    role.value = null;
    if (status.value == "authenticated") {
      const NIM = user.value?.profile.NIM;
      const isAdministrator = user.value?.profile.isAdministrator;
      if (!isAdministrator) {
        role.value = "Member";
      }
      if (isAdministrator) {
        role.value = isAdministrator.role;
        isAdmin.value = true;
        period.value = isAdministrator.period!;
      }
    }
  };
  watchEffect(() => {
    fetchData();
  });
  const access = computed(() => canAccess?.includes(role.value!)!);
  return {
    role,
    access,
    isAdmin,
    period,
  };
};
