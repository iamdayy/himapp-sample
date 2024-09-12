<script setup lang='ts'>
import type { IProject } from '~/types';
import type { IProfileResponse, IResponse } from '~/types/IResponse';

// Access Nuxt app instance and utilities
const { $api } = useNuxtApp();
const toast = useToast();
const modal = useModal();

// Fetch user profile data
const { data } = await useAsyncData(() => $fetch<IProfileResponse>("/api/profile"));

// Define emits for parent component communication
const emit = defineEmits(["triggerRefresh"]);

// Initialize UI state
const AddTaskPopover = ref<boolean>(false);
const newTask = ref<string>('');

// Get window size
const windowSize = useWindowSize();

/**
 * Initialize new project object with default values
 * @type {Ref<IProject>}
 */
const project = ref<IProject>({
    title: "",
    deadline: new Date(),
    description: "",
    canSee: "All",
    canRegister: "No",
    registered: [],
    tasks: [],
    contributors: [
        {
            profile: 0,
            job: ""
        }
    ]
});

/**
 * Get the full name of a user from their NIM
 * @param {number | undefined} NIM - The NIM (Nomor Induk Mahasiswa) of the user
 * @returns {string | undefined} The full name of the user, or undefined if not found
 */
const getNameFromNIM = (NIM?: number): string | undefined => {
    return data.value?.data?.profiles.find((profile) => profile.NIM == NIM)?.fullName;
}

/**
 * Add a new project to the database
 * @async
 * @throws {Error} When the API call fails
 */
const addProject = async (): Promise<void> => {
    try {
        const added = await $api<IResponse>("/api/project", {
            method: "POST",
            body: project.value
        });
        toast.add({ title: added.statusMessage! });
        modal.close();
        emit("triggerRefresh");
    } catch (error) {
        toast.add({ title: "Failed to add new Project" });
    }
};

/**
 * Add a new contributor to the project
 */
const addContributors = (): void => {
    if (!project.value.contributors) {
        project.value.contributors = [
            {
                job: "",
                profile: 0
            }
        ]
    } else {
        project.value.contributors?.push({
            job: "",
            profile: 0
        });
    }
}

/**
 * Add a new task to the project
 */
const addNewTask = (): void => {
    if (newTask.value != '') {
        project.value.tasks?.push(newTask.value);
        AddTaskPopover.value = false;
        newTask.value = '';
    }
}

/**
 * Delete a task from the project
 * @param {number} i - The index of the task to delete
 */
const deleteTask = (i: number): void => {
    project.value.tasks?.splice(i, 1);
}

/**
 * Delete a contributor from the project
 * @param {number} i - The index of the contributor to delete
 */
const deleteContributors = (i: number): void => {
    project.value.contributors?.splice(i, 1);
}

/**
 * Compute the layout based on window size
 * @returns {string} The CSS class for layout
 */
const layoutClass = computed(() => {
    return windowSize.width.value < 640 ? 'grid-cols-1' : 'sm:grid-cols-6';
});

/**
 * Compute the button size based on window size
 * @returns {string} The size prop for UButton
 */
const buttonSize = computed(() => {
    return windowSize.width.value < 640 ? 'sm' : 'md';
});

/**
 * Compute the input size based on window size
 * @returns {string} The size prop for UInput
 */
const inputSize = computed(() => {
    return windowSize.width.value < 640 ? 'sm' : 'md';
});
</script>
<template>
    <UModal :fullscreen="windowSize.width.value < 640">
        <UCard :ui="{ background: 'bg-gray-200 dark:bg-gray-800' }">
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 class="text-xl font-semibold dark:text-gray-200">New Project</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray" @click="modal.close"
                        :size="buttonSize" />
                </div>
            </template>
            <div class="space-y-6 text-start">
                <div :class="['grid', 'gap-4', layoutClass]">
                    <div class="col-span-full sm:col-span-3">
                        <label for="Title"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                        <UInput type="text" name="Title" id="Title" placeholder="Project 1" v-model="project.title"
                            required class="w-full" :size="inputSize" />
                    </div>
                    <div class="col-span-full sm:col-span-3">
                        <label for="deadline"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Deadline</label>
                        <div class="flex gap-3 border border-gray-300 rounded-lg shadow-sm dark:border-gray-700">
                            <VDatePicker id="deadline" v-model="project.deadline" mode="date">
                                <template #default="{ togglePopover }">
                                    <UButton @click="togglePopover" icon="i-heroicons-calendar" :size="buttonSize"
                                        variant="link" />
                                </template>
                            </VDatePicker>
                            <label class="block my-auto text-sm font-medium text-gray-900 dark:text-white"
                                for="deadline">
                                {{ project.deadline.toLocaleDateString() }}
                            </label>
                        </div>
                    </div>
                    <div class="col-span-full">
                        <label for="description"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <TipTapEditor id="description" v-model="project.description" class="w-full" />
                    </div>
                    <div class="col-span-full sm:col-span-4">
                        <label for="contributors"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contributors</label>
                        <div id="contributors" class="space-y-4 ms-2">
                            <div v-for="contributors, i in project.contributors" :key="i" class="mb-2">
                                <div class="flex flex-col items-end gap-2 sm:flex-row">
                                    <div class="flex flex-col items-center w-full gap-2 sm:flex-row">
                                        <div class="w-full sm:w-1/2">
                                            <label :for="`${contributors.job}-job`"
                                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Job</label>
                                            <UInput :type="`${contributors.job}-job`" :name="`${contributors.job}-job`"
                                                :id="`${contributors.job}-job`" v-model="project.contributors![i].job"
                                                required class="w-full" :size="inputSize" />
                                        </div>
                                        <div class="w-full sm:w-1/2">
                                            <label :for="`${contributors.job}-profile`"
                                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                                            <UInput :type="`${contributors.job}-profile`"
                                                :name="`${contributors.job}-profile`"
                                                :id="`${contributors.job}-profile`"
                                                v-model="project.contributors![i].profile" required class="w-full"
                                                :size="inputSize" />
                                        </div>
                                    </div>
                                    <UButton @click="deleteContributors(i)" icon="i-heroicons-trash"
                                        class="mt-2 text-red-500 dark:text-red-500 hover:text-red-400 dark:hover:text-red-400 sm:mt-0"
                                        variant="link" :size="buttonSize" />
                                </div>
                                <label :for="`${contributors.job}-profile`"
                                    class="block mt-1 text-sm font-medium text-gray-900 dark:text-white">{{
                                        getNameFromNIM(project.contributors![i].profile as number) }}</label>
                            </div>
                            <UButton @click="addContributors" label="Add Contributor" icon="i-heroicons-plus" block
                                trailing class="w-full" :size="buttonSize" />
                        </div>
                    </div>
                    <div class="space-y-4 col-span-full sm:col-span-2">
                        <div>
                            <label for="canSee" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                See</label>
                            <USelect id="canSee" :options="['Admin', 'Departement', 'Internal', 'All', 'External']"
                                v-model="project.canSee" class="w-full" :size="inputSize" />
                        </div>
                        <div>
                            <label for="canRegister"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                Register</label>
                            <USelect id="canRegister"
                                :options="['Admin', 'Departement', 'Internal', 'All', 'External', 'No']"
                                v-model="project.canRegister" class="w-full" :size="inputSize" />
                        </div>
                        <div>
                            <label for="select-tasks"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tasks</label>
                            <div class="flex flex-wrap items-center gap-2">
                                <UBadge size="xs" variant="soft" v-for="task, i in project.tasks" :key="i">
                                    {{ task }}
                                    <UButton @click="deleteTask(i)" icon="i-heroicons-x-mark" :size="buttonSize"
                                        class="text-red-500 dark:text-red-600 hover:text-red-400 dark:hover:text-red-400"
                                        variant="link" />
                                </UBadge>

                                <UPopover overlay v-model:open="AddTaskPopover"
                                    :popper="{ placement: 'bottom', strategy: 'absolute', arrow: true }">
                                    <UButton icon="i-heroicons-pencil-square" variant="outline" :size="buttonSize" />

                                    <template #panel>
                                        <div class="px-3 py-2 min-w-48">
                                            <label for="Task"
                                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Task</label>
                                            <UInput type="text" name="Task" id="Task" placeholder="task..."
                                                v-model="newTask" required class="w-full" :size="inputSize" />
                                            <UButton type="submit" class="w-full my-2 font-semibold" variant="outline"
                                                block @click="addNewTask" label="Add" tralling-icon="i-heroicons-check"
                                                :size="buttonSize" />
                                        </div>
                                    </template>
                                </UPopover>
                            </div>
                        </div>
                    </div>
                </div>
                <UButton @click.prevent="addProject" label="Save" icon="i-heroicons-clipboard" block trailing
                    class="w-full" :size="buttonSize" />
            </div>
        </UCard>
    </UModal>
</template>
<style scoped>
/* Responsive styles are now handled by the layoutClass, buttonSize, and inputSize computed properties */
</style>