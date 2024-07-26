<script setup lang='ts'>
import type { IProject } from '~/types';
import type { IProfileResponse } from '~/types/IResponse';

const { data } = await useAsyncData(() => $fetch<IProfileResponse>("/api/profile"));
const toast = useToast();
const modal = useModal();
const emit = defineEmits(["triggerRefresh"]);

const AddTaskPopover = ref<boolean>(false);
const newTask = ref<string>('');
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

const getNameFromNIM = (NIM?: number) => {
    return data.value?.profiles.find((profile) => profile.NIM == NIM)?.fullName;
}

const addProject = async () => {
    try {
        const added = await $fetch("/api/project", {
            method: "POST",
            body: project.value
        });
        toast.add({ title: added.statusMessage! });
        modal.close();
        emit("triggerRefresh");
    } catch (error) {
        toast.add({ title: "Failed to add new Projects" });
    }
};


const addContributors = () => {
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

const addNewTask = () => {
    if (newTask.value != '') {
        project.value.tasks?.push(newTask.value);
        AddTaskPopover.value = false;
        newTask.value = '';
    }
}

const deleteTask = (i: number) => {
    project.value.tasks?.splice(i, 1);
}

const deleteContributors = (i: number) => {
    project.value.contributors?.splice(i, 1);
}
</script>
<template>
    <UModal>
        <UCard>
            <template #header>
                <div class="flex w-full justify-between">
                    <h2 class="text-xl font-semibold dark:text-gray-200">New Project</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div class="space-y-6 text-start">
                <div class="grid grid-cols-6 gap-6">
                    <div class="col-span-6 sm:col-span-3">
                        <label for="Title"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                        <UInput type="text" name="Title" id="Title" placeholder="Project 1" v-model="project.title"
                            required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="deadline"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Deadline</label>
                        <div class="flex gap-3 border border-gray-300 rounded-lg shadow-sm dark:border-gray-700">
                            <VDatePicker id="deadline" v-model="project.deadline" mode="date">
                                <template #default="{ togglePopover }">
                                    <UButton @click="togglePopover" icon="i-heroicons-calendar" size="sm"
                                        variant="link" />
                                </template>
                            </VDatePicker>
                            <label class="block my-auto text-sm font-medium text-gray-900 dark:text-white"
                                for="deadline">
                                {{ project.deadline.toLocaleDateString() }}
                            </label>
                        </div>
                    </div>
                    <div class="col-span-6">
                        <label for="description"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <UTextarea id="description" rows="6" v-model="project.description" />
                    </div>
                    <div class="col-span-4">
                        <label for="contributors"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contributors</label>
                        <div id="contributors" class="ms-2">
                            <div v-for="contributors, i in project.contributors" :key="i" class="mb-2">
                                <div class="flex items-end">
                                    <div class="flex items-center w-full gap-2">
                                        <div class="w-1/2">
                                            <label :for="`${contributors.job}-job`"
                                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Job</label>
                                            <UInput :type="`${contributors.job}-job`" :name="`${contributors.job}-job`"
                                                :id="`${contributors.job}-job`" v-model="project.contributors![i].job"
                                                required />
                                        </div>
                                        <div class="w-1/2">
                                            <label :for="`${contributors.job}-profile`"
                                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                                            <UInput :type="`${contributors.job}-profile`"
                                                :name="`${contributors.job}-profile`"
                                                :id="`${contributors.job}-profile`"
                                                v-model="project.contributors![i].profile" required />
                                        </div>
                                    </div>
                                    <UButton @click="deleteContributors(i)" icon="i-heroicons-trash"
                                        class="text-red-500 dark:text-red-500 hover:text-red-400 dark:hover:text-red-400"
                                        variant="link" />
                                </div>
                                <label :for="`${contributors.job}-profile`"
                                    class="block text-sm font-medium text-gray-900 dark:text-white">{{
                                        getNameFromNIM(project.contributors![i].profile as number) }}</label>
                            </div>
                            <UButton @click="addContributors" label="Add Contributor" icon="i-heroicons-plus" block
                                trailing />
                        </div>
                    </div>
                    <div class="col-span-2">
                        <div class="mb-2">
                            <label for="canSee" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                See</label>
                            <USelect id="canSee" :options="['Admin', 'Departement', 'Internal', 'All', 'External']"
                                v-model="project.canSee" />
                        </div>
                        <div class="mb-2">
                            <label for="canRegister"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                Register</label>
                            <USelect id="canRegister"
                                :options="['Admin', 'Departement', 'Internal', 'All', 'External', 'No']"
                                v-model="project.canRegister" />
                        </div>
                        <div class="mb-2">
                            <label for="select-tasks"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tasks</label>
                            <div class="flex flex-wrap gap-2 items-center">
                                <UBadge size="xs" variant="soft" v-for="task, i in project.tasks" :key="i">
                                    {{ task }}
                                    <UButton @click="deleteTask(i)" icon="i-heroicons-x-mark" size="xs"
                                        class="text-red-500 dark:text-red-600 hover:text-red-400 dark:hover:text-red-400"
                                        variant="link" />
                                </UBadge>

                                <UPopover overlay v-model:open="AddTaskPopover"
                                    :popper="{ placement: 'bottom', strategy: 'absolute', arrow: true }">
                                    <UButton icon="i-heroicons-pencil-square" variant="outline" size="xs" />

                                    <template #panel>
                                        <div class="px-3 py-2 min-w-48">
                                            <label for="Task"
                                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Task</label>
                                            <UInput type="text" name="Task" id="Task" placeholder="task..."
                                                v-model="newTask" required />
                                            <UButton type="submit" class="font-semibold my-2" variant="outline" block
                                                @click="addNewTask" label="Add" tralling-icon="i-heroicons-check" />
                                        </div>
                                    </template>
                                </UPopover>
                            </div>
                        </div>
                    </div>
                </div>
                <UButton @click.prevent="addProject" label="Save" icon="i-heroicons-clipboard" block trailing />
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>