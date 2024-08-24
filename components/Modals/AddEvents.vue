<script setup lang='ts'>
import type { IEvent } from '~/types';
import type { IProfileResponse } from '~/types/IResponse';
const { $api } = useNuxtApp();
const toast = useToast();
const modal = useModal();
const { data: profile } = useLazyAsyncData(() => $api<IProfileResponse>("/api/profile"));

const emits = defineEmits(['trigger-refresh']);

const newEvent = ref<IEvent>({
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

const addCommittee = () => {
    if (!newEvent.value.committee) {
        newEvent.value.committee = [
            {
                job: "",
                user: ""
            }
        ]
    } else {
        newEvent.value.committee?.push({
            job: "",
            user: ""
        });
    }
}

const deleteCommittee = (i: number) => {
    newEvent.value.committee?.splice(i, 1);
}

const addEvent = async () => {
    try {
        const added = await $api("/api/event", {
            method: "post",
            body: newEvent.value,
        });
        toast.add({ title: "Success add new event at " + new Date(newEvent.value.date).toLocaleDateString() });
        emits('trigger-refresh');
    } catch (error: any) {
        toast.add({ title: "Failed to add new Event" });
    }
}

const getNameFromNIM = (NIM?: number) => {
    return profile.value?.profiles.find((profile) => profile.NIM == NIM)?.fullName;
}
</script>
<template>
    <UModal>
        <UCard>
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 class="text-xl font-semibold dark:text-gray-200">New Event</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div class="text-start">
                <div class="space-y-4">
                    <div class="grid grid-cols-6 gap-6 px-4">
                        <div class="col-span-6">
                            <label for="title"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                            <UInput type="text" name="title" id="title" v-model="newEvent.title" required />
                        </div>
                        <div class="col-span-3">
                            <label for="date" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date
                                & Time</label>
                            <div class="flex items-center justify-between w-full gap-2">
                                <VDatePicker id="date" v-model="newEvent.date" mode="dateTime">
                                    <template #default="{ togglePopover }">
                                        <UButton icon="i-heroicons-calendar" @click="togglePopover" />
                                    </template>
                                </VDatePicker>
                                <span class="font-semibold text-gray-900 text-md dark:text-gray-300">{{ new
                                    Date(newEvent.date).toLocaleDateString() }}</span>
                            </div>
                        </div>
                        <div class="col-span-3">
                            <label for="at"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">At</label>
                            <UInput type="text" name="at" id="at" v-model="newEvent.at" required />
                        </div>
                        <div class="col-span-3">
                            <label for="canSee" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                See</label>
                            <USelect id="canSee" :options="['Admin', 'Departement', 'Internal', 'All', 'External']"
                                v-model="newEvent.canSee" />
                        </div>
                        <div class="col-span-3">
                            <label for="canRegister"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                Register</label>
                            <USelect id="canRegister"
                                :options="['Admin', 'Departement', 'Internal', 'All', 'External', 'No']"
                                v-model="newEvent.canRegister" />
                        </div>
                        <div class="col-span-6">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                            <TipTapEditor id="description" v-model="newEvent.description" />
                        </div>
                        <div class="col-span-6">
                            <label for="committee"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contributors</label>
                            <div id="committee" class="ms-2">
                                <div v-for="committee, i in newEvent.committee" :key="i" class="mb-2">
                                    <div class="flex items-end">
                                        <div class="flex items-center w-full gap-2">
                                            <div class="w-3/4">
                                                <label :for="`${committee.job}-job`"
                                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Job</label>
                                                <UInput :type="`${committee.job}-job`" :name="`${committee.job}-job`"
                                                    :id="`${committee.job}-job`" v-model="newEvent.committee![i].job"
                                                    required />
                                            </div>
                                            <div class="w-1/4">
                                                <label :for="`${committee.job}-profile`"
                                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                                                <UInput :type="`${committee.job}-profile`"
                                                    :name="`${committee.job}-profile`" :id="`${committee.job}-profile`"
                                                    v-model="newEvent.committee![i].user" required />
                                            </div>
                                        </div>
                                        <UButton @click="deleteCommittee(i)" icon="i-heroicons-trash"
                                            class="text-red-500 dark:text-red-500 hover:text-red-400 dark:hover:text-red-400"
                                            variant="link" />
                                    </div>
                                    <label :for="`${committee.job}-profile`"
                                        class="block text-sm font-medium text-gray-900 dark:text-white">{{
                                            getNameFromNIM(newEvent.committee![i].user as number) }}</label>
                                </div>
                                <UButton @click="addCommittee" label="Add Committee" icon="i-heroicons-plus" block
                                    trailing />
                            </div>
                        </div>
                    </div>
                    <UButton type="submit" @click.prevent="addEvent" label="Save" icon="i-heroicons-clipboard" block
                        trailing />
                </div>
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>