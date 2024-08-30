import type { TRole } from "~/types";
export const useCanMeRegister = () => {
  const { organizer } = useOrganizer();
  const canMeRegister = (canRegister: TRole, date?: Date) => {
    if (date) {
      if (new Date(date) <= new Date(Date.now())) {
        return false;
      }
    }
    switch (canRegister) {
      case "All":
        return true;
      case "No":
        return false;
      case "Admin":
        if (organizer.value && organizer.value?.role.includes("Department")) {
          return true;
        } else {
          return false;
        }
      case "Departement":
        if (organizer.value && organizer.value?.role.includes("Department")) {
          return true;
        } else {
          return false;
        }
      case "Internal":
        if (organizer.value) {
          return true;
        } else {
          return false;
        }
      case "External":
        if (!organizer.value) {
          return true;
        } else {
          return false;
        }
      default:
        return false;
    }
  };
  return {
    canMeRegister,
  };
};
