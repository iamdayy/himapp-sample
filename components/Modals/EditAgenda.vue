<script setup lang='ts'>
import type { PropType } from 'vue';
import type { IAgenda, IMember } from '~/types';
import type { IMemberResponse, IResponse } from '~/types/IResponse';

// Fetch user member data
const { data: member } = await useAsyncData(() => $api<IMemberResponse>("/api/member"));

const { $api } = useNuxtApp();
const toast = useToast();
const modal = useModal();

// Define props
const props = defineProps({
    agenda: {
        type: Object as PropType<IAgenda>,
        required: true
    },
});

// Define emits
const emits = defineEmits(['trigger-refresh']);

// Create a reactive reference to the agenda
const Agenda = ref<IAgenda>(props.agenda);

/**
 * Add a new committee member to the agenda
 */
const addCommittee = () => {
    if (!Agenda.value.committee) {
        Agenda.value.committee = [{ job: "", user: "" }];
    } else {
        Agenda.value.committee.push({ job: "", user: "" });
    }
};

/**
 * Remove a committee member from the agenda
 * @param {number} i - Index of the committee member to remove
 */
const deleteCommittee = (i: number) => {
    Agenda.value.committee?.splice(i, 1);
};

/**
 * Save the edited agenda
 */
const addAgenda = async () => {
    try {
        const edited = await $api<IResponse>("/api/agenda", {
            method: "put",
            body: Agenda.value,
            query: { id: Agenda.value._id }
        });
        toast.add({ title: edited.statusMessage });
        emits('trigger-refresh');
        modal.close();
    } catch (error: any) {
        toast.add({ title: error.response.data.statusMessage, color: 'red' });
    }
};

/**
 * Get the full name of a user from their NIM
 * @param {number} NIM - The NIM of the user
 * @returns {string | undefined} The full name of the user
 */
const getNameFromNIM = (NIM?: number) => {
    return member.value?.data?.members.find((member) => member.NIM == NIM)?.fullName;
};

// Responsive design setup
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 640);
const isTablet = computed(() => width.value >= 640 && width.value < 1024);

/**
 * Responsive UI sizes for components
 */
const responsiveUISizes = computed(() => ({
    input: isMobile.value ? 'sm' : 'md',
    button: isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg',
}));
</script>

<template>
    <UModal :fullscreen="isMobile">
        <UCard :ui="{ background: 'bg-gray-200 dark:bg-gray-800' }">
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 class="text-xl font-semibold dark:text-gray-200">Edit Event {{ Agenda.title }}</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div class="text-start">
                <div class="space-y-4">
                    <div class="grid grid-cols-1 gap-4 px-4 md:grid-cols-6 md:gap-6">
                        <div class="col-span-full">
                            <label for="title"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                            <UInput type="text" name="title" id="title" v-model="Agenda.title" required
                                :size="responsiveUISizes.input" />
                        </div>
                        <div class="col-span-full md:col-span-3">
                            <label for="date" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date
                                & Time</label>
                            <div class="flex items-center justify-between w-full gap-2">
                                <VDatePicker id="date" v-model="Agenda.date" mode="dateTime">
                                    <template #default="{ togglePopover }">
                                        <UButton icon="i-heroicons-calendar" :size="responsiveUISizes.button"
                                            @click="togglePopover" />
                                    </template>
                                </VDatePicker>
                                <span class="text-gray-900 dark:text-gray-300">
                                    {{ new Date(Agenda.date).toLocaleDateString() }}
                                </span>
                            </div>
                        </div>
                        <div class="col-span-full md:col-span-3">
                            <label for="at"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">At</label>
                            <UInput type="text" name="at" id="at" v-model="Agenda.at" required
                                :size="responsiveUISizes.input" />
                        </div>
                        <div class="col-span-full md:col-span-3">
                            <label for="canSee" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                See</label>
                            <USelect id="canSee" :options="['Admin', 'Departement', 'Internal', 'All', 'External']"
                                v-model="Agenda.canSee" required :size="responsiveUISizes.input" />
                        </div>
                        <div class="col-span-full md:col-span-3">
                            <label for="canRegister"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                Register</label>
                            <USelect id="canRegister"
                                :options="['Admin', 'Departement', 'Internal', 'All', 'External', 'No']"
                                v-model="Agenda.canRegister" required :size="responsiveUISizes.input" />
                        </div>
                        <div class="col-span-full">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                            <TipTapEditor id="description" v-model="Agenda.description" />
                        </div>
                        <div class="col-span-full">
                            <label for="committee"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contributors</label>
                            <div id="committee" class="ms-2">
                                <div v-for="(committee, i) in Agenda.committee" :key="i" class="mb-4">
                                    <div class="flex flex-col gap-2 md:flex-row md:items-center">
                                        <div class="w-full md:w-3/4">
                                            <label :for="`${committee.job}-job`"
                                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Job</label>
                                            <UInput :type="`${committee.job}-job`" :name="`${committee.job}-job`"
                                                :id="`${committee.job}-job`" v-model="Agenda.committee![i].job" required
                                                :size="responsiveUISizes.input" />
                                        </div>
                                        <div class="w-full md:w-1/4">
                                            <label :for="`${committee.job}-member`"
                                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                                            <UInput type="number" :name="`${committee.job}-member`"
                                                :id="`${committee.job}-member`" v-model="Agenda.committee![i].user"
                                                :value="(Agenda.committee![i].user as IMember).NIM" required
                                                :size="responsiveUISizes.input" />
                                        </div>
                                        <UButton @click="deleteCommittee(i)" icon="i-heroicons-trash"
                                            class="text-red-500 dark:text-red-500 hover:text-red-400 dark:hover:text-red-400"
                                            variant="link" :size="responsiveUISizes.button" />
                                    </div>
                                    <label :for="`${committee.job}-member`"
                                        class="block text-sm font-medium text-gray-900 dark:text-white">{{
                                            getNameFromNIM(Agenda.committee![i].user as number) }}</label>
                                </div>
                                <UButton @click="addCommittee" label="Add Committee" icon="i-heroicons-plus" block
                                    trailing :size="responsiveUISizes.button" />
                            </div>
                        </div>
                    </div>
                    <UButton type="submit" @click.prevent="addAgenda" label="Save" icon="i-heroicons-clipboard" block
                        trailing :size="responsiveUISizes.button" />
                </div>
            </div>
        </UCard>
    </UModal>
</template>

<style scoped>
@media (max-width: 640px) {
    .grid {
        gap: 1rem;
    }
}
</style>