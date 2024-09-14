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
const selectedPeriod = ref(`${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`);

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
const responsiveClasses = computed(() => ({
    title: isMobile.value ? 'text-xl' : 'text-2xl md:text-4xl',
    subtitle: isMobile.value ? 'text-lg' : 'text-xl md:text-2xl',
}));

// Compute responsive dimensions
const wrapperDimensions = computed(() => ({
    width: isMobile.value ? '220px' : '280px',
    height: isMobile.value ? '380px' : '480px'
}));

const cardDimensions = computed(() => ({
    height: isMobile.value ? '350px' : '450px'
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
            <div>
                <h1
                    class="my-4 text-xl font-bold leading-tight tracking-tight text-center text-gray-600 md:text-3xl dark:text-white">
                    Council
                </h1>
                <div class="grid grid-cols-1 gap-4 py-3 md:grid-cols-2">
                    <div class="mx-auto wrapper" :style="wrapperDimensions" v-for="council in organizer?.council">
                        <div class="card" :style="{ height: cardDimensions.height }">
                            <div class="front" :style="{ height: cardDimensions.height }">
                                <h2 :class="['font-semibold text-gray-200', responsiveClasses.subtitle]">{{
                                    council.position }}</h2>
                                <NuxtImg :src="(council.image as string)" :alt="council.name"
                                    class="object-cover mx-auto my-4 rounded-full max-w-48 aspect-square"
                                    provider="localProvider" />
                                <div class="absolute bottom-16">
                                    <h1
                                        :class="['mb-2 font-semibold text-white -translate-x-14', responsiveClasses.title]">
                                        {{ council.name }}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h1
                    class="my-4 text-xl font-bold leading-tight tracking-tight text-center text-gray-600 md:text-3xl dark:text-white">
                    Advisor
                </h1>
                <div class="mx-auto wrapper" :style="wrapperDimensions">
                    <div class="card" :style="{ height: cardDimensions.height }">
                        <div class="front" :style="{ height: cardDimensions.height }">
                            <h2 :class="['font-semibold text-gray-200', responsiveClasses.subtitle]">{{
                                organizer?.advisor.position }}</h2>
                            <NuxtImg :src="(organizer?.advisor.image as string)" :alt="organizer?.advisor.name"
                                class="object-cover mx-auto my-4 rounded-full max-w-48 aspect-square"
                                provider="localProvider" />
                            <div class="absolute bottom-16">
                                <h1 :class="['mb-2 font-semibold text-white -translate-x-14', responsiveClasses.title]">
                                    {{ organizer?.advisor.name }}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <h1
                        class="my-4 text-xl font-bold leading-tight tracking-tight text-center text-gray-600 md:text-3xl dark:text-white">
                        Consideration Board
                    </h1>
                    <div
                        :class="`grid w-full grid-cols-1 gap-4 py-3 md:grid-cols-${organizer?.considerationBoard.length}`">
                        <ProfileCard v-for="considerationBoard in organizer?.considerationBoard"
                            :profile="(considerationBoard as IProfile)" subtitle="Consideration Board" />
                    </div>
                </div>
            </div>
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
<style scoped>
/* Wrapper for the entire component */
.wrapper {
    perspective: 800px;
    position: relative;
}

/* Main card container */
.card {
    width: 100%;
    position: relative;
    transform-style: preserve-3d;
    transform: translateZ(-140px);
    transition: transform 350ms cubic-bezier(0.390, 0.575, 0.565, 1.000);
    cursor: pointer;
}

/* Common styles for front and back of the card */
.card>div {
    position: absolute;
    width: 100%;
    padding: 34px 21px;
    transition: all 350ms cubic-bezier(0.390, 0.575, 0.565, 1.000);
}

/* Front face of the card */
.front {
    background-image: linear-gradient(180deg, rgb(255 138 76) 0%, rgba(92, 91, 94, 0) 95%);
    transform: rotateY(0deg) translateZ(160px);
    border-radius: 34px 8px 0;
}

/* Responsive styles */
@media (max-width: 768px) {
    .card>div {
        padding: 20px 15px;
    }

    .front,
    .right {
        border-radius: 20px 5px 0;
    }

}
</style>
