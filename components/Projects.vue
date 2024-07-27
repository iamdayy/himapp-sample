<script setup lang='ts'>
import type { IProfile } from '~/types';

const { page, perPage, projects, totalProjects, refreshProjects } = useProjects();
perPage.value = 10;
page.value = 1;
watch(page, () => {
    refreshProjects();
})
watch(perPage, () => {
    refreshProjects();
})
</script>
<template>
    <UCard>
        <template #header>
            <h2 class="text-4xl font-extrabold dark:text-white">Events</h2>
        </template>
        <div class="px-3 py-8 overflow-auto max-h-[70vh] no-scrollbar">
            <ol class="relative border-gray-300 border-s dark:border-orange-700">
                <UAccordion :items="projects" :ui="{ wrapper: 'flex flex-col w-full' }">
                    <template #default="{ item, index, open }">
                        <li class="mb-10 ms-4 w-full">
                            <UButton color="gray" variant="ghost" class="w-full"
                                :ui="{ rounded: 'rounded-md', padding: { sm: 'p-3' } }">
                                <template #leading>
                                    <div
                                        class="absolute w-3 h-3 bg-blue-400 rounded-full mt-1.5 -start-1.5 dark:bg-blue-700 dot">
                                    </div>
                                </template>
                                <div class="text-start">
                                    <time
                                        class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{{
                                            item.date
                                        }}</time>
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{
                                        item.title
                                        }}</h3>
                                    <p v-if="item.description"
                                        class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                                        {{ item.description }}
                                    </p>
                                </div>
                                <template #trailing>
                                    <UIcon name="i-heroicons-chevron-right-20-solid"
                                        class="w-5 h-5 ms-auto transform transition-transform duration-200"
                                        :class="[open && 'rotate-90']" />
                                </template>
                            </UButton>
                        </li>
                    </template>
                    <template #item="{ item }">
                        <ul role="list" class="px-4 space-y-5 my-7">
                            <li class="flex items-center">
                                <Icon name="solar:calendar-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        new Date(item?.deadline).toDateString() }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:eye-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        item?.canSee }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:user-plus-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        item?.canRegister }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:pen-new-square-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <div class="flex flex-wrap gap-2 ms-3">
                                    <span v-for="task, i in item.tasks" :key="i" id="badge-dismiss-default"
                                        class="inline-flex items-center px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded me-2 dark:bg-blue-900 dark:text-blue-300">
                                        {{ task }}
                                    </span>
                                </div>
                            </li>
                            <li class="flex">
                                <Icon name="solar:document-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        item?.description }}</span>
                            </li>
                            <li v-if="item.contributors">
                                <span class="flex">
                                    <Icon name="solar:users-group-two-rounded-outline"
                                        class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                    <span
                                        class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">
                                        Contributors</span>
                                </span>
                                <div class="relative my-3 mt-6 overflow-auto sm:rounded-lg ms-8 max-h-48 no-scrollbar">
                                    <table
                                        class="w-full text-sm text-left text-gray-500 bg-gray-100 rtl:text-right dark:text-gray-400">
                                        <tbody>
                                            <tr v-for="event, i in item.contributors">
                                                <td class="px-6 py-4 border-gray-200 border-e">
                                                    {{ (event.profile as IProfile).fullName }}
                                                </td>
                                                <td class="px-6 py-4 border-gray-200 border-e">
                                                    as
                                                </td>
                                                <td class="px-6 py-4">
                                                    {{ event.job }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </li>
                        </ul>
                    </template>
                </UAccordion>
            </ol>
        </div>
        <div class="flex w-full justify-between my-2">
            <USelect label="per Page" :options="[5, 10, 20]" v-model="perPage" />
            <UPagination size="sm" color="gray" v-model="page" :total="totalProjects" show-last show-first />
        </div>
    </UCard>
</template>
<style scoped></style>