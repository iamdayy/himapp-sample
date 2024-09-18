<script setup lang='ts'>
import type { IAgenda } from '~/types';
import type { IProfileResponse, IResponse } from '~/types/IResponse';

// Access Nuxt app instance and utilities
const { $api } = useNuxtApp();
const toast = useToast();
const modal = useModal();

// Fetch user profile data
const { data: profile } = useLazyAsyncData(() => $api<IProfileResponse>("/api/profile"));

// Define emits for parent component communication
const emits = defineEmits(['trigger-refresh']);

// Initialize new event object with default values
const newAgenda = ref<IAgenda>({
    title: "",
    date: new Date(),
    at: "",
    description: "",
    canSee: "All",
    committee: [
        {
            job: "chief",
            user: ""
        }
    ],
    canRegister: "No"
});

/**
 * Add a new committee member to the event
 */
const addCommittee = () => {
    if (!newAgenda.value.committee) {
        newAgenda.value.committee = [
            {
                job: "",
                user: ""
            }
        ]
    } else {
        newAgenda.value.committee?.push({
            job: "",
            user: ""
        });
    }
}

/**
 * Remove a committee member from the event
 * @param {number} i - Index of the committee member to remove
 */
const deleteCommittee = (i: number) => {
    newAgenda.value.committee?.splice(i, 1);
}

/**
 * Add a new event to the database
 */
const addAgenda = async () => {
    try {
        const added = await $api<IResponse>("/api/agenda", {
            method: "post",
            body: newAgenda.value,
        });
        toast.add({ title: added.statusMessage });
        emits('trigger-refresh');
        modal.close();
    } catch (error: any) {
        toast.add({ title: error.response.data.statusMessage, color: 'red' });
    }
}

/**
 * Get the full name of a user from their NIM (Student ID Number)
 * @param {number} NIM - Student ID Number
 * @returns {string|undefined} - Full name of the user
 */
const getNameFromNIM = (NIM?: number) => {
    return profile.value?.data?.profiles.find((profile) => profile.NIM == NIM)?.fullName;
}

/**
 * Responsive design setup
 */
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
const isTablet = computed(() => width.value >= 768 && width.value < 1024);

/**
 * Responsive UI sizes for components
 */
const responsiveUISizes = computed(() => ({
    button: isMobile.value ? 'xs' : isTablet.value ? 'sm' : 'md',
    input: isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg',
}))

/**
 * Responsive classes for UI elements
 */
const responsiveClasses = computed(() => ({
    label: isMobile.value ? 'text-xs' : isTablet.value ? 'text-sm' : 'text-base',
    input: isMobile.value ? 'text-xs' : isTablet.value ? 'text-sm' : 'text-base',
    gridCols: isMobile.value ? 'grid-cols-1' : isTablet.value ? 'grid-cols-2' : 'grid-cols-6',
}))

</script>

<template>
    <UModal :fullscreen="isMobile">

        <UCard :ui="{ background: 'bg-gray-200 dark:bg-gray-800' }">
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 :class="[responsiveClasses.label, 'font-semibold dark:text-gray-200']">New Agenda</h2>
                    <UButton icon="i-heroicons-x-mark" :size="responsiveUISizes.button" :padded="false" variant="link"
                        color="gray" @click="modal.close" />
                </div>
            </template>
            <div class="text-start">
                <div class="space-y-4">
                    <div :class="['grid gap-4 px-4', responsiveClasses.gridCols]">
                        <div class="col-span-full">
                            <label for="title"
                                :class="[responsiveClasses.label, 'block mb-2 font-medium text-gray-900 dark:text-white']">Title</label>
                            <UInput type="text" name="title" id="title" v-model="newAgenda.title"
                                :size="responsiveUISizes.input" required />
                        </div>
                        <div :class="[isMobile ? 'col-span-full' : 'col-span-3']">
                            <label for="date"
                                :class="[responsiveClasses.label, 'block mb-2 font-medium text-gray-900 dark:text-white']">Date
                                & Time</label>
                            <div class="flex items-center justify-between w-full gap-2">
                                <VDatePicker id="date" v-model="newAgenda.date" mode="dateTime">
                                    <template #default="{ togglePopover }">
                                        <UButton icon="i-heroicons-calendar" :size="responsiveUISizes.button"
                                            @click="togglePopover" />
                                    </template>
                                </VDatePicker>
                                <span :class="[responsiveClasses.input, 'text-gray-900 dark:text-gray-300']">
                                    {{ new Date(newAgenda.date).toLocaleDateString() }}
                                </span>
                            </div>
                        </div>
                        <div :class="[isMobile ? 'col-span-full' : 'col-span-3']">
                            <label for="at"
                                :class="[responsiveClasses.label, 'block mb-2 font-medium text-gray-900 dark:text-white']">At</label>
                            <UInput type="text" name="at" id="at" v-model="newAgenda.at" :size="responsiveUISizes.input"
                                required />
                        </div>
                        <div :class="[isMobile ? 'col-span-full' : 'col-span-3']">
                            <label for="canSee"
                                :class="[responsiveClasses.label, 'block mb-2 font-medium text-gray-900 dark:text-white']">Can
                                See</label>
                            <USelect id="canSee" :options="['Admin', 'Departement', 'Internal', 'All', 'External']"
                                v-model="newAgenda.canSee" :size="responsiveUISizes.input" />
                        </div>
                        <div :class="[isMobile ? 'col-span-full' : 'col-span-3']">
                            <label for="canRegister"
                                :class="[responsiveClasses.label, 'block mb-2 font-medium text-gray-900 dark:text-white']">Can
                                Register</label>
                            <USelect id="canRegister"
                                :options="['Admin', 'Departement', 'Internal', 'All', 'External', 'No']"
                                v-model="newAgenda.canRegister" :size="responsiveUISizes.input" />
                        </div>
                        <div class="col-span-full">
                            <label for="description"
                                :class="[responsiveClasses.label, 'block mb-2 font-medium text-gray-900 dark:text-white']">Description</label>
                            <TipTapEditor id="description" v-model="newAgenda.description" />
                        </div>
                        <div class="col-span-full">
                            <label for="committee"
                                :class="[responsiveClasses.label, 'block mb-2 font-medium text-gray-900 dark:text-white']">Committee</label>
                            <div id="committee" class="ms-2">
                                <div v-for="committee, i in newAgenda.committee" :key="i" class="mb-2">
                                    <div class="flex flex-col items-end gap-2 sm:flex-row">
                                        <div class="flex flex-col items-center w-full gap-2 sm:flex-row">
                                            <div class="w-full sm:w-3/4">
                                                <label :for="`${committee.job}-job`"
                                                    :class="[responsiveClasses.label, 'block mb-2 font-medium text-gray-900 dark:text-white']">Job</label>
                                                <UInput :type="`${committee.job}-job`" :name="`${committee.job}-job`"
                                                    :id="`${committee.job}-job`" v-model="newAgenda.committee![i].job"
                                                    :size="responsiveUISizes.input" required />
                                            </div>
                                            <div class="w-full sm:w-1/4">
                                                <label :for="`${committee.job}-profile`"
                                                    :class="[responsiveClasses.label, 'block mb-2 font-medium text-gray-900 dark:text-white']">NIM</label>
                                                <UInput type="number" :name="`${committee.job}-profile`"
                                                    :id="`${committee.job}-profile`"
                                                    v-model="newAgenda.committee![i].user"
                                                    :size="responsiveUISizes.input" required />
                                            </div>
                                        </div>
                                        <UButton @click="deleteCommittee(i)" icon="i-heroicons-trash"
                                            class="text-red-500 dark:text-red-500 hover:text-red-400 dark:hover:text-red-400"
                                            :size="responsiveUISizes.button" variant="link" />
                                    </div>
                                    <label :for="`${committee.job}-profile`"
                                        :class="[responsiveClasses.label, 'block font-medium text-gray-900 dark:text-white']">
                                        {{ getNameFromNIM(newAgenda.committee![i].user as number) }}
                                    </label>
                                </div>
                                <UButton @click="addCommittee" label="Add Committee" icon="i-heroicons-plus" block
                                    :size="responsiveUISizes.button" trailing />
                            </div>
                        </div>
                    </div>
                    <UButton type="submit" @click.prevent="addAgenda" label="Save" icon="i-heroicons-clipboard" block
                        :size="responsiveUISizes.button" trailing />
                </div>
            </div>
        </UCard>
    </UModal>
</template>

<style scoped>
@media (max-width: 640px) {
    .grid {
        grid-template-columns: 1fr;
    }
}
</style>