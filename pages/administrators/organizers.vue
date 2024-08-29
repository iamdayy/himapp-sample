<script lang="ts" setup>
import { ModalsAddOrganizer } from "#components";
import type { IOrganizer, IProfile } from "~/types";

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
});


const { isAdmin } = useRole();
const { isDept } = useDept();
const modal = useModal();
const { $api } = useNuxtApp();

const { data, error } = useLazyAsyncData<{ organizers: IOrganizer[] }>("organizers", () => $api("/api/organizer"));

const periods = computed(() => {
    if (data.value) {
        return data.value.organizers.map((organizer) => `${new Date(organizer.period.start).getFullYear()} - ${new Date(organizer.period.end).getFullYear()}`);
    }
    return [];
});
const selectedPeriod = ref(periods.value[0] || "");
const organizer = computed(() => {
    if (data.value?.organizers) {
        return data.value.organizers.find((organizer) => new Date(organizer.period.start).getFullYear() === Number(selectedPeriod.value.split(" - ")[0]) && new Date(organizer.period.end).getFullYear() === Number(selectedPeriod.value.split(" - ")[1]));
    }
    return null;
});
/**
 * Responsive design
 */
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 640);
const isTablet = computed(() => width.value >= 640 && width.value < 1024);


const addModal = () => {
    modal.open(ModalsAddOrganizer)
}

const items = [
    {
        label: "Daily Management",
        icon: "i-heroicons-user-group",
        slot: "dailyManager",
    },
    {
        label: "Department",
        icon: "i-heroicons-user-group",
        slot: "departments",
    }
]

const departementsTabs = computed(() => {
    if (organizer.value) {
        return organizer.value?.department.map((department) => {
            return {
                slot: 'department',
                label: department.name,
            }
        })
    }
    return []
})
/**
 * Responsive UI sizes based on screen width
 */
const responsiveUISizes = computed(() => ({
    input: isMobile.value ? 'sm' : 'md',
    button: isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg',
    select: isMobile.value ? 'sm' : 'md',
}));
</script>
<template>
    <div class="items-center justify-center mb-24">
        <div class="mx-auto text-center">
            <h2 class="text-2xl font-extrabold leading-tight tracking-tight text-gray-600 md:text-4xl dark:text-white">
                Organizers
            </h2>
        </div>
        <UCard class="px-4 mt-6 md:px-8">
            <template #header>
                <div class="flex justify-between w-full">
                    <UButton label="New" :size="responsiveUISizes.button" :ui="{ rounded: 'rounded-full' }"
                        v-if="isAdmin || isDept" @click="addModal" />
                    <USelect v-model="selectedPeriod" :options="periods" />
                </div>
            </template>
            <UTabs :items="items">
                <template #dailyManager="{ item, index }">
                    <div class="grid w-full grid-cols-3 gap-4 py-3">
                        <ProfileCard v-for="dailyManager in organizer?.dailyManagement"
                            :profile="(dailyManager.profile as IProfile)" :subtitle="dailyManager.position" />
                    </div>
                </template>
                <template #departments="{ item }">
                    <UTabs :items="departementsTabs">
                        <template #department="{ item, index }">
                            <ProfileCard v-if="organizer?.department[index].coordinator"
                                :profile="(organizer?.department[index].coordinator as IProfile)" subtitle="Coordinator"
                                class="mt-8" />
                            <div class="grid w-full grid-cols-3 gap-4 py-3 mt-8">
                                <ProfileCard v-for="member in organizer?.department[index].members"
                                    :profile="(member as IProfile)" subtitle="Member" />
                            </div>
                        </template>
                    </UTabs>
                </template>
            </UTabs>
        </UCard>
    </div>
</template>
