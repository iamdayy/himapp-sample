<script setup lang='ts'>
import { useWindowSize } from '@vueuse/core';
import { computed, watch } from 'vue';
import { useProjects } from '~/composables/useProjects';

// Importing necessary functions and components from the useProjects composable
const { page, perPage, projects, totalProjects, refreshProjects } = useProjects();

// Setting default values for pagination
perPage.value = 10;
page.value = 1;

// Watching for changes in the page and perPage values to refresh the projects list
watch([page, perPage], () => {
    refreshProjects();
});

// Defining the headers for the contributors table
const contributorHeaders = [
    {
        key: 'name',
        label: 'Name'
    },
    {
        key: 'job',
        label: 'Job'
    }
];

// Responsive design: track window width using VueUse
const { width: windowWidth } = useWindowSize();

// Compute if the screen is mobile
const isMobile = computed(() => windowWidth.value < 768);

// Compute the number of visible pages for pagination
const visiblePages = computed(() => isMobile.value ? 3 : 5);

// Compute the size for UI components
const uiSize = computed(() => isMobile.value ? 'sm' : 'md');

// Compute the max height for the projects list
const projectsListMaxHeight = computed(() => isMobile.value ? '60vh' : '70vh');

// Compute the class for the projects list container
const projectsListClass = computed(() => `px-2 md:px-3 py-4 md:py-8 overflow-auto max-h-[${projectsListMaxHeight.value}] no-scrollbar`);
</script>

<template>
    <UCard>
        <!-- Card header with responsive title -->
        <template #header>
            <h2 class="text-2xl font-extrabold md:text-4xl dark:text-white">Projects</h2>
        </template>
        <div :class="projectsListClass">
            <ol class="relative border-gray-300 border-s dark:border-orange-700">
                <!-- Accordion component to display the list of projects -->
                <UAccordion :items="projects" :ui="{ wrapper: 'flex flex-col w-full' }">
                    <!-- Template for each project item in the accordion -->
                    <template #default="{ item, open }">
                        <li class="w-full mb-6 md:mb-10 ms-4">
                            <UButton color="gray" variant="link" class="w-full"
                                :ui="{ rounded: 'rounded-md', padding: { sm: 'p-2 md:p-3' } }">
                                <template #leading>
                                    <div
                                        class="absolute w-2 md:w-3 h-2 md:h-3 bg-blue-400 rounded-full mt-1.5 -start-1.5 dark:bg-blue-700 dot">
                                    </div>
                                </template>
                                <div class="w-full text-start">
                                    <!-- Displaying the deadline of the project -->
                                    <time
                                        class="mb-1 text-xs font-normal leading-none text-gray-400 md:text-sm dark:text-gray-500">{{
                                            new Date(item.deadline).toLocaleDateString('id-Id', { dateStyle: 'long' })
                                        }}</time>
                                    <!-- Displaying the title of the project -->
                                    <h3 class="text-base font-semibold text-gray-900 md:text-lg dark:text-white">{{
                                        item.title
                                        }}</h3>
                                    <!-- Displaying the description of the project if it exists -->
                                    <div v-if="item.description && !isMobile"
                                        class="w-full mb-4 text-sm font-normal text-gray-500 md:text-base line-clamp-2 max-h-12 md:max-h-16 dark:text-gray-400">
                                        <TiptapShow :content="item.description" />
                                    </div>
                                </div>
                                <template #trailing>
                                    <UIcon name="i-heroicons-chevron-down-20-solid"
                                        class="w-4 h-4 transition-transform duration-200 transform md:w-5 md:h-5 ms-auto"
                                        :class="[open && 'rotate-180']" />
                                </template>
                            </UButton>
                        </li>
                    </template>
                    <!-- Template for the detailed view of each project item -->
                    <template #item="{ item }">
                        <ul role="list" class="px-2 my-4 space-y-3 md:px-4 md:space-y-5 md:my-7 ms-6 md:ms-8">
                            <!-- Displaying the deadline of the project in full date format -->
                            <li class="flex items-center">
                                <Icon name="solar:calendar-outline"
                                    class="flex-shrink-0 w-3 h-3 text-blue-600 md:w-4 md:h-4 dark:text-blue-500" />
                                <span
                                    class="text-sm font-normal leading-tight text-gray-500 md:text-base dark:text-gray-400 ms-2 md:ms-3">{{
                                        new Date(item?.deadline).toLocaleDateString('id-Id', { dateStyle: 'full' })
                                    }}</span>
                            </li>
                            <!-- Displaying the visibility status of the project -->
                            <li class="flex">
                                <Icon name="solar:eye-outline"
                                    class="flex-shrink-0 w-3 h-3 text-blue-600 md:w-4 md:h-4 dark:text-blue-500" />
                                <span
                                    class="text-sm font-normal leading-tight text-gray-500 md:text-base dark:text-gray-400 ms-2 md:ms-3">{{
                                        item?.canSee }}</span>
                            </li>
                            <!-- Displaying the registration status of the project -->
                            <li class="flex">
                                <Icon name="solar:user-plus-outline"
                                    class="flex-shrink-0 w-3 h-3 text-blue-600 md:w-4 md:h-4 dark:text-blue-500" />
                                <span
                                    class="text-sm font-normal leading-tight text-gray-500 md:text-base dark:text-gray-400 ms-2 md:ms-3">{{
                                        item?.canRegister }}</span>
                            </li>
                            <!-- Displaying the tasks associated with the project -->
                            <li class="flex">
                                <Icon name="solar:pen-new-square-outline"
                                    class="flex-shrink-0 w-3 h-3 text-blue-600 md:w-4 md:h-4 dark:text-blue-500" />
                                <div class="flex flex-wrap gap-1 md:gap-2 ms-2 md:ms-3">
                                    <UBadge v-for="task, i in item.tasks" :key="i" class="text-xs md:text-sm">{{ task }}
                                    </UBadge>
                                </div>
                            </li>
                            <!-- Displaying the detailed description of the project -->
                            <li class="flex">
                                <Icon name="solar:document-outline"
                                    class="flex-shrink-0 w-3 h-3 text-blue-600 md:w-4 md:h-4 dark:text-blue-500" />
                                <div class="text-sm ms-2 md:ms-3 md:text-base">
                                    <TiptapShow :content="item.description" />
                                </div>
                            </li>
                            <!-- Displaying the contributors of the project if they exist -->
                            <li v-if="item.contributors">
                                <span class="flex">
                                    <Icon name="solar:users-group-two-rounded-outline"
                                        class="flex-shrink-0 w-3 h-3 text-blue-600 md:w-4 md:h-4 dark:text-blue-500" />
                                    <span
                                        class="text-sm font-normal leading-tight text-gray-500 md:text-base dark:text-gray-400 ms-2 md:ms-3">
                                        Contributors</span>
                                </span>
                                <div
                                    class="relative my-2 mt-4 overflow-auto md:my-3 md:mt-6 sm:rounded-lg ms-6 md:ms-8 max-h-36 md:max-h-48 no-scrollbar">
                                    <UTable :rows="item.contributors" :columns="contributorHeaders">
                                        <template #name-data="{ row }">
                                            {{ row.member.fullName }}
                                        </template>
                                    </UTable>
                                </div>
                            </li>
                        </ul>
                    </template>
                </UAccordion>
            </ol>
        </div>
        <!-- Responsive pagination controls for navigating through the projects list -->
        <div class="flex justify-between w-full gap-2 my-2 md:gap-0">
            <USelect label="per Page" :options="[5, 10, 20]" v-model="perPage" :size="uiSize" />
            <UPagination :size="uiSize" color="gray" v-model="page" :total="totalProjects"
                :max-visible-pages="visiblePages" :show-last="!isMobile" :show-first="!isMobile"
                :ui="{ wrapper: 'flex items-center gap-1', rounded: '!rounded-full min-w-[32px] justify-center', default: { activeButton: { variant: 'outline' } } }" />
        </div>
    </UCard>
</template>

<style scoped>
@media (max-width: 768px) {
    .UPagination {
        font-size: 0.875rem;
    }
}
</style>