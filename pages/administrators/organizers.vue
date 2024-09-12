<script lang="ts" setup>
import { ModalsAddOrganizer } from "#components";
import type { IProfile } from "~/types";

// Define page metadata for layout and authentication middleware
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
});

useHead({
    title: 'Organizers',
});

// Retrieve organizer status and list of organizers
const { isOrganizer, organizers, refreshOrganizers } = useOrganizer();
const modal = useModal();

/**
 * Compute the periods for the organizers based on their start and end dates.
 * @returns {Array<string>} An array of strings representing the periods.
 */
const periods = computed(() => {
    if (organizers.value) {
        return organizers.value.map((organizer) =>
            `${new Date(organizer.period.start).getFullYear()} - ${new Date(organizer.period.end).getFullYear()}`
        );
    }
    return [];
});

// Reference to the selected period, initialized to the first available period
const selectedPeriod = ref(periods.value[0] || "");

/**
 * Compute the current organizer based on the selected period.
 * @returns {IProfile | null} The current organizer profile or null if not found.
 */
const organizer = computed(() => {
    if (organizers.value) {
        return organizers.value.find((organizer) =>
            new Date(organizer.period.start).getFullYear() === Number(selectedPeriod.value.split(" - ")[0]) &&
            new Date(organizer.period.end).getFullYear() === Number(selectedPeriod.value.split(" - ")[1])
        );
    }
    return null;
});

/**
 * Responsive design: Determine if the device is mobile or tablet based on window size.
 */
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 640);
const isTablet = computed(() => width.value >= 640 && width.value < 1024);

/**
 * Open the modal for adding a new organizer.
 */
const addModal = () => {
    modal.open(ModalsAddOrganizer, {
        onRefreshTrigger: () => {
            refreshOrganizers();
        }
    });
}

// Define the items for the tabs in the UI
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
];

/**
 * Compute the department tabs based on the current organizer.
 * @returns {Array<Object>} An array of department tab items.
 */
const departementsTabs = computed(() => {
    if (organizer.value) {
        return organizer.value?.department.map((department) => {
            return {
                slot: 'department',
                label: department.name,
            }
        });
    }
    return [];
});

/**
 * Responsive UI sizes based on screen width.
 * @returns {Object} An object containing responsive sizes for input, button, and select elements.
 */
const responsiveUISizes = computed(() => ({
    input: isMobile.value ? 'sm' : 'md',
    button: isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg',
    select: isMobile.value ? 'sm' : 'md',
}));
</script>
<template>
    <div class="flex flex-col items-center justify-center mb-24">
        <div class="mx-auto text-center">
            <h2 class="text-2xl font-extrabold leading-tight tracking-tight text-gray-600 md:text-4xl dark:text-white">
                Organizers
            </h2>
        </div>
        <UCard class="w-full px-4 mt-6 md:px-8">
            <template #header>
                <div class="flex flex-col justify-between w-full md:flex-row">
                    <UButton label="New" :size="responsiveUISizes.button" :ui="{ rounded: 'rounded-full' }"
                        v-if="isOrganizer" @click="addModal" />
                    <USelect v-model="selectedPeriod" :options="periods" class="mt-2 md:mt-0" />
                </div>
            </template>
            <UTabs :items="items">
                <template #dailyManager="{ item, index }">
                    <div class="grid w-full grid-cols-1 gap-4 py-3 md:grid-cols-3">
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
                            <div class="grid w-full grid-cols-1 gap-4 py-3 mt-8 md:grid-cols-3">
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
