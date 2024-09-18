<script setup lang='ts'>
import { ModalsAddProject, ModalsEditProject, ModalsRegisteredUsers, UButton, UCard, UInput, UPagination, UPopover, USelect, UTable } from '#components';
import type { IProfile, IProject } from '~/types';

/**
 * Composables for role and department checks
 */
const { isOrganizer } = useOrganizer();

/**
 * User authentication and toast notifications
 */
const { data: user } = useAuth();
const toast = useToast();
const { $api } = useNuxtApp();

/**
 * Modal and project management
 */
const Modal = useModal();
const { page, perPage, projects, totalProjects, refreshProjects, sort, order, showMissed } = useProjects();

/**
 * Utility composable
 */
const { canMeRegister } = useCanMeRegister();

/**
 * Reactive references for UI state
 */
const RegisterPopover = ref<boolean>(false);
const selectedRegistered = ref<Array<any>>([]);
const Project = ref<IProject>();

/**
 * Computed property for the current project
 */
const project = computed<IProject | undefined>({
    get() {
        if (Project.value) {
            return Project.value;
        }
        if (projects.value) {
            const parseDate = (date: string) => new Date(date.replace(/(\d{2})\/(\d{2})\/(\d{4})/g, '$2/$1/$3'));
            const diff = (date: any, now: Date) => Math.abs(parseDate(date).getTime() - now.getTime());

            const projs = projects.value?.sort(({ deadline: date1 }, { deadline: date2 }) => {
                const diff1 = diff(date1, new Date);
                const diff2 = diff(date2, new Date);
                if (diff1 < 0) return 1;
                if (diff2 < 0) return -1;
                return diff1 - diff2;
            });

            return projs![0];
        }
    },
    set(newVal) {
        Project.value = newVal;
    }
});

/**
 * Form data for project registration
 */
const registerForm = ref({
    NIM: user.value?.profile.NIM,
    task: "",
    id: ""
});

/**
 * Function to select a project for detailed view
 * @param {string} id - The ID of the selected project
 */
const pickDetail = (id: string) => {
    const index = projects.value?.findIndex((project) => project._id === id);
    project.value = projects.value![index!];
}

/**
 * Check if the current user is registered for a project
 * @param {IProject} project - The project to check
 * @returns {boolean} - True if user is registered, false otherwise
 */
const isMeRegistered = (project: IProject): boolean => {
    const nim = user.value?.profile.NIM;
    const found = project.registered?.find((registered) => (registered.profile as IProfile).NIM == nim);
    return !!found;
}

/**
 * Register the current user for a project
 * @param {string} id - The ID of the project to register for
 */
const register = async (id: string) => {
    registerForm.value.id = id;
    try {
        const response = await $api("/api/project/register", {
            method: "post",
            body: registerForm.value
        });
        refreshProjects();
        RegisterPopover.value = false;
        toast.add({ title: response.statusMessage! });
    } catch (error: any) {
        toast.add({ title: "Failed to register " + Project.value?.title });
    }
}

/**
 * Open the modal for registered users
 */
const registeredModal = () => {
    Modal.open(ModalsRegisteredUsers, {
        registered: Project.value?.registered!,
        onChangeCheckItem(val) {
            selectedRegistered.value = val
        }
    })
}

/**
 * Open the modal for adding a new project
 */
const AddModal = () => {
    Modal.open(ModalsAddProject, {
        "onTriggerRefresh"() {
            refreshProjects();
        }
    })
}

/**
 * Open the modal for editing an existing project
 */
const EditModal = () => {
    Modal.open(ModalsEditProject, {
        Project: project.value,
        "onTriggerRefresh"() {
            refreshProjects();
        }
    })
}

/**
 * Responsive design utilities
 */
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

/**
 * Headers for the contributors table
 */
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

/**
 * Page metadata
 */
useHead({
    title: "Projects"
});

/**
 * Computed properties for pagination
 */
const pageTotal = computed(() => projects.value?.length || 0);
const pageFrom = computed(() => (page.value - 1) * perPage.value + 1);
const pageTo = computed(() => Math.min(page.value * perPage.value, pageTotal.value));
const pageCountOptions = computed(() => {
    const baseOptions = [5, 10, 20, 50, 100];
    const filteredOptions = baseOptions.filter((option) => option <= pageTotal.value);

    if (isMobile.value && filteredOptions.length > 3) {
        return filteredOptions.slice(0, 3);
    }

    return filteredOptions;
});

/**
 * Page meta for layout and middleware
 */
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});

/**
 * Responsive classes for UI elements
 */
const responsiveClasses = computed(() => ({
    projectTitle: isMobile.value ? 'text-lg' : 'text-xl md:text-2xl',
    icon: isMobile.value ? 'w-4 h-4' : 'w-5 h-5',
    listItem: isMobile.value ? 'text-sm' : 'text-base',
}))

/**
 * Responsive UI sizes for components
 */
const responsiveUISizes = computed(() => ({
    button: isMobile.value ? 'sm' : 'md',
    input: isMobile.value ? 'sm' : 'lg',
}))

/**
 * Computed property for visible pages in pagination
 */
const visiblePages = computed(() => isMobile.value ? 3 : 5)
</script>
<template>
    <div class="items-center justify-center mb-24">
        <UCard class="px-8 mt-6">
            <template #header>
                <div class="flex justify-between">
                    <h1 class="text-2xl font-bold text-gray-600 dark:text-white">Project</h1>
                    <UButton label="New" :size="responsiveUISizes.button" :ui="{ rounded: 'rounded-full' }"
                        @click="AddModal" v-if="isOrganizer" />
                </div>

            </template>
            <div class="flex flex-col w-full gap-3 px-4 py-6 md:px-8 md:py-12 md:flex-row">
                <div
                    class="w-full px-3 py-4 mx-auto rounded-lg shadow-lg md:w-2/5 bg-gray-100/15 dark:bg-gray-800/15 backdrop-blur-sm">
                    <div class="flex justify-between">
                        <UInput icon="i-heroicons-magnifying-glass-20-solid" color="white"
                            :size="responsiveUISizes.input" class="w-full" placeholder="Search..." />
                        <UButton :icon="order === 'asc' ? 'i-heroicons-arrow-down' : 'i-heroicons-arrow-up'"
                            variant="link" :size="responsiveUISizes.button"
                            @click="order = order === 'asc' ? 'desc' : 'asc'" />
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Missed</span>
                            <UToggle v-model="showMissed" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                        <UButton v-for="project, i in projects" :key="i" @click="pickDetail(project._id as string)"
                            variant="link" color="gray"
                            class="relative inline-flex items-center w-full px-2 py-2 text-sm font-semibold truncate md:text-lg md:px-4">
                            {{ project.title }} | <span class="text-xs font-light md:text-md ms-2">{{ new
                                Date(project.deadline).toLocaleDateString('id-Id', { dateStyle: 'full' }) }}</span>
                        </UButton>
                    </div>
                    <!-- Responsive pagination controls for navigating through the projects list -->
                    <div class="flex items-center justify-between gap-2 my-2 md:gap-0">
                        <USelect label="per Page" :options="pageCountOptions" v-model="perPage"
                            :size="responsiveUISizes.button" />
                        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {{ pageFrom }} - {{ pageTo }} of {{ totalProjects }}
                        </span>
                        <UPagination :size="responsiveUISizes.button" color="gray" v-model="page" :total="totalProjects"
                            :max="visiblePages" :show-last="!isMobile" :show-first="!isMobile" />
                    </div>
                </div>
                <div
                    class="w-full px-4 py-4 mt-4 rounded-lg shadow-lg bg-gray-100/15 md:px-8 dark:bg-gray-800/15 backdrop-blur-sm md:mt-0">
                    <h5 v-if="!project"
                        class="my-12 mb-4 text-2xl font-semibold text-center text-yellow-300 md:my-24 md:text-3xl dark:text-yellow-200">
                        No
                        Project
                        Selected</h5>
                    <div v-else>
                        <div class="flex justify-between w-full">
                            <h5
                                :class="['font-medium text-gray-500 dark:text-gray-400', responsiveClasses.projectTitle]">
                                {{ project?.title }}
                            </h5>
                            <UButton icon="i-heroicons-pencil-square" variant="link" @click="EditModal"
                                v-if="isOrganizer" :size="responsiveUISizes.button" />
                        </div>
                        <ul role="list" class="my-5 space-y-3">
                            <li class="flex items-center">
                                <UIcon name="i-heroicons-calendar"
                                    :class="['flex-shrink-0 text-blue-600 dark:text-blue-500', responsiveClasses.icon]" />
                                <span
                                    :class="['font-normal leading-tight text-gray-500 dark:text-gray-400 ms-2', responsiveClasses.listItem]">
                                    {{ new Date(project?.deadline!).toLocaleDateString('id-Id', { dateStyle: 'full' })
                                    }}
                                </span>
                            </li>
                            <li class="flex items-center">
                                <UIcon name="i-heroicons-eye"
                                    :class="['flex-shrink-0 text-blue-600 dark:text-blue-500', responsiveClasses.icon]" />
                                <span
                                    :class="['font-normal leading-tight text-gray-500 dark:text-gray-400 ms-2', responsiveClasses.listItem]">
                                    {{ project?.canSee }}
                                </span>
                            </li>
                            <li class="flex items-center">
                                <UIcon name="i-heroicons-user-plus"
                                    :class="['flex-shrink-0 text-blue-600 dark:text-blue-500', responsiveClasses.icon]" />
                                <span
                                    :class="['font-normal leading-tight text-gray-500 dark:text-gray-400 ms-2', responsiveClasses.listItem]">
                                    {{ project?.canRegister }}
                                </span>
                            </li>
                            <li class="flex items-center">
                                <UIcon name="i-heroicons-pencil-square"
                                    :class="['flex-shrink-0 text-blue-600 dark:text-blue-500', responsiveClasses.icon]" />
                                <div class="flex flex-wrap gap-2 ms-2">
                                    <UBadge v-for="task, i in project?.tasks" :key="i" id="badge-dismiss-default"
                                        class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded md:text-sm me-2 dark:bg-blue-900 dark:text-blue-300">
                                        {{ task }}
                                    </UBadge>
                                </div>
                            </li>
                            <li class="flex items-center">
                                <UIcon name="i-heroicons-document-text"
                                    :class="['flex-shrink-0 text-blue-600 dark:text-blue-500', responsiveClasses.icon]" />
                                <span
                                    :class="['font-normal leading-tight text-gray-500 dark:text-gray-400 ms-2', responsiveClasses.listItem]">
                                    <TiptapShow :content="project.description" />
                                </span>
                            </li>
                            <li v-if="project?.contributors">
                                <span class="flex items-center">
                                    <UIcon name="i-heroicons-user-group"
                                        :class="['flex-shrink-0 text-blue-600 dark:text-blue-500', responsiveClasses.icon]" />
                                    <span
                                        :class="['font-normal leading-tight text-gray-500 dark:text-gray-400 ms-2', responsiveClasses.listItem]">
                                        Contributors
                                    </span>
                                </span>
                                <div class="relative my-2 mt-4 overflow-auto sm:rounded-lg ms-6 max-h-36 md:max-h-48">
                                    <UTable :columns="contributorHeaders" :rows="project?.contributors"
                                        :ui="{ td: { base: responsiveClasses.listItem } }">
                                        <template #name-data="{ row }">
                                            {{ row.profile.fullName }}
                                        </template>
                                    </UTable>
                                </div>
                            </li>

                            <li class="flex justify-between gap-2 mt-4">
                                <UPopover overlay :popper="{ strategy: 'absolute', placement: 'bottom', arrow: true }">
                                    <UButton class="flex-1" color="blue" variant="solid"
                                        :size="responsiveUISizes.button" icon="i-heroicons-user-plus"
                                        :disabled="!canMeRegister(project.canRegister, project.deadline) || isMeRegistered(project)">
                                        Register
                                    </UButton>
                                    <template #panel>
                                        <div class="flex flex-col gap-2 p-2 md:gap-4 md:p-4">
                                            <USelect color="gray" variant="outline" size="sm"
                                                :options="project.tasks" />
                                            <UButton type="submit" variant="outline" block
                                                @click="register(project?._id as string)" label="Accept"
                                                tralling-icon="i-heroicons-check" size="sm" />
                                        </div>
                                    </template>
                                </UPopover>
                                <UButton color="gray" variant="solid" :size="responsiveUISizes.button"
                                    icon="i-heroicons-users"
                                    :disabled="!canMeRegister(project.canRegister, project.deadline) && !isMeRegistered(project) && !isOrganizer"
                                    @click="registeredModal">
                                    Registered
                                </UButton>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>
<style scoped></style>