<script setup lang='ts'>
import { ModalsAddProject, ModalsEditProject, ModalsRegisteredUsers, USelect } from '#components';
import type { IProfile, IProject } from '~/types';

const { isAdmin } = useRole(["Secretary", "viceSecretary", "Chairman"]);
const { isDept } = useDept();
const { data: user } = useAuth();
const toast = useToast();
const Modal = useModal();
const { page, perPage, projects, totalProjects, refreshProjects } = useProjects()
page.value = 1;
perPage.value = 10;
const { canMeRegister } = useCanMeRegister();

const RegisterPopover = ref<boolean>(false);
const selectedRegistered = ref<Array<any>>([]);
const Project = ref<IProject>();
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

            const projectsNow = projs![0];
            return projectsNow;
        }
    },
    set(newVal) {
        Project.value = newVal;
    }
});
const registerForm = ref({
    NIM: user.value?.profile.NIM,
    task: "",
    id: ""
});
const pickDetail = (id: string) => {
    const index = projects.value?.findIndex((project) => project._id === id);
    project.value = projects.value![index!];
}

const isMeRegistered = (project: IProject) => {
    const nim = user.value?.profile.NIM;
    const found = project.registered?.find((registered) => (registered.profile as IProfile).NIM == nim);
    if (!found) {
        return false;
    } else {
        return true;
    }
}
const register = async (id: string) => {
    registerForm.value.id = id;
    try {
        const response = await $fetch("/api/project/register", {
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


const registeredModal = () => {
    Modal.open(ModalsRegisteredUsers, {
        registered: Project.value?.registered,
        onChangeCheckItem(val) {
            selectedRegistered.value = val
        }
    })
}

const AddModal = () => {
    Modal.open(ModalsAddProject, {
        "onTriggerRefresh"() {
            refreshProjects();
        }
    })
}
const EditModal = () => {
    Modal.open(ModalsEditProject, {
        Project: Project.value,
        "onTriggerRefresh"() {
            refreshProjects();
        }
    })
}

useHead({
    title: "Projects | Himatika"
});
watch(page, () => {
    refreshProjects();
})
watch(perPage, () => {
    refreshProjects();
})
definePageMeta({
    middleware: "auth",
    layout: 'dashboard'
});
</script>
<template>
    <div class="items-center justify-center pb-24">
        <div class="mx-auto text-center">
            <h2 class="text-4xl font-extrabold leading-tight tracking-tight text-gray-600 dark:text-white">
                Project
            </h2>
        </div>
        <UCard class="mt-6">
            <div class="flex flex-row-reverse justify-between px-8 gap-8 items-center">
                <UButton label="Add Project" class="text-xl text-gray-700 font-semibold dark:text-gray-700"
                    @click="AddModal" v-if="isAdmin || isDept" icon="i-heroicons-plus" trailing />
            </div>
            <div class="flex flex-col w-full gap-3 px-8 py-12 md:flex-row">
                <div
                    class="mx-auto shadow-lg rounded-lg w-full md:w-2/5 px-3 max-h-[60vh] overflow-y-auto border border-gray-400 bg-gray-100 py-4 dark:bg-gray-800">
                    <UInput icon="i-heroicons-magnifying-glass-20-solid" color="white" size="lg" class="w-full"
                        placeholder="Search..." />
                    <button v-for="project, i in projects" :key="i" @click="pickDetail(project._id as string)"
                        class="relative inline-flex items-center w-full px-4 py-2 text-lg font-semibold border-b border-gray-200 rounded-t-lg hover:bg-gray-100 hover:text-blue-700 focus:border-blue-700 focus:z-10 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white dark:focus:text-white">
                        {{ project.title }} | <span class="font-light text-md ms-2">{{ new
                            Date(project.deadline).toDateString() }}</span>
                    </button>
                    <div class="flex w-full justify-between my-2">
                        <USelect label="per Page" :options="[5, 10, 20]" v-model="perPage" />
                        <UPagination size="sm" color="gray" v-model="page" :total="totalProjects" show-last
                            show-first />
                    </div>
                </div>
                <div class="w-full px-8 py-4 bg-gray-100 border border-gray-400 rounded-lg shadow-lg dark:bg-gray-800">
                    <h5 v-if="!project"
                        class="my-24 mb-4 text-3xl font-semibold text-center text-yellow-300 dark:text-yellow-200">No
                        Project
                        Selected</h5>
                    <div v-else>
                        <div class="flex justify-between w-full">
                            <h5 class="mb-4 text-2xl font-medium text-gray-500 dark:text-gray-400">{{ project?.title }}
                            </h5>
                            <UButton icon="i-heroicons-pencil-square" variant="link" @click="EditModal"
                                v-if="isAdmin || isDept" />
                        </div>
                        <ul role="list" class="space-y-5 my-7">
                            <li class="flex items-center">
                                <Icon name="solar:calendar-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        new Date(project?.deadline!).toDateString() }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:eye-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        project?.canSee }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:user-plus-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        project?.canRegister }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:pen-new-square-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <div class="flex flex-wrap gap-2 ms-3">
                                    <span v-for="task, i in project?.tasks" :key="i" id="badge-dismiss-default"
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
                                        project?.description }}</span>
                            </li>
                            <li v-if="project?.contributors">
                                <span class="flex">
                                    <Icon name="solar:users-group-two-rounded-outline"
                                        class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                    <span
                                        class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">
                                        Contributors</span>
                                </span>
                                <div class="relative my-3 mt-6 overflow-auto sm:rounded-lg ms-8 max-h-[40vh]">
                                    <table
                                        class="w-full text-sm text-left text-gray-500 bg-gray-100 rtl:text-right dark:text-gray-400 dark:bg-gray-700">
                                        <tbody>
                                            <tr v-for="event, i in project?.contributors">
                                                <td class="px-6 py-4 border-gray-200 border-e dark:border-gray-600">
                                                    {{ (event.profile as IProfile).fullName }}
                                                </td>
                                                <td class="px-6 py-4 border-gray-200 border-e dark:border-gray-600">
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
                            <li v-if="project?.registered">
                                <UButton label="Registered"
                                    class="mx-auto text-xl text-gray-700 font-semibold dark:text-gray-700" block
                                    @click="registeredModal" v-if="isAdmin || isDept" />
                            </li>
                        </ul>
                        <UPopover overlay v-model:open="RegisterPopover"
                            :popper="{ strategy: 'absolute', placement: 'bottom', arrow: true }"
                            v-if="canMeRegister(project.canRegister, project.deadline) && !isMeRegistered(project)">
                            <UButton type="submit" class="text-2xl my-3 font-semibold" variant="outline" block
                                label="Register This" />

                            <template #panel>
                                <div class="p-4">
                                    <USelect color="gray" variant="outline" :options="project.tasks" />
                                    <UButton type="submit" class="text-2xl my-3 font-semibold" variant="outline" block
                                        @click="register(project?._id as string)" label="Accept"
                                        tralling-icon="i-heroicons-check" />
                                </div>
                            </template>
                        </UPopover>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>
<style scoped></style>