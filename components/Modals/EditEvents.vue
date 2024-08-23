<script setup lang='ts'>
import type { PropType } from 'vue';
import type { IEvent, IProfile } from '~/types';
import type { IProfileResponse } from '~/types/IResponse';

const { data: profile } = await useAsyncData(() => $api<IProfileResponse>("/api/profile"));

const toast = useToast();

const modal = useModal();

const props = defineProps({
    event: {
        type: Object as PropType<IEvent>,
        required: true
    },
})

const emits = defineEmits(['trigger-refresh']);

const Event = ref<IEvent>(props.event);

const addCommittee = () => {
    if (!Event.value.committee) {
        Event.value.committee = [
            {
                job: "",
                user: ""
            }
        ]
    } else {
        Event.value.committee?.push({
            job: "",
            user: ""
        });
    }
}

const deleteCommittee = (i: number) => {
    Event.value.committee?.splice(i, 1);
}

const addEvent = async () => {
    try {
        const edited = await $api("/api/event", {
            method: "put",
            body: Event.value,
            query: {
                id: Event.value._id
            }
        });
        toast.add({ title: "Success edit new event at " + new Date(Event.value.date).toLocaleDateString() });
        emits('trigger-refresh');
        modal.close();
    } catch (error: any) {
        toast.add({ title: "Failed to edit new Event" });
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
                    <h2 class="text-xl font-semibold dark:text-gray-200">Edit Event {{ Event.title }}</h2>
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
                            <UInput type="text" name="title" id="title" v-model="Event.title" required />
                        </div>
                        <div class="col-span-3">
                            <label for="date" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date
                                & Time</label>
                            <VDatePicker id="date" v-model="Event.date" mode="dateTime">
                                <template #default="{ togglePopover }">
                                    <button class="px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md"
                                        @click="togglePopover">
                                        Select date
                                    </button>
                                </template>
                            </VDatePicker>
                        </div>
                        <div class="col-span-3">
                            <label for="at"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">At</label>
                            <UInput type="at" name="at" id="at" v-model="Event.at" required />
                        </div>
                        <div class="col-span-3">
                            <label for="canSee" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                See</label>
                            <USelect id="canSee" :options="['Admin', 'Departement', 'Internal', 'All', 'External']"
                                v-model="Event.canSee" required />
                        </div>
                        <div class="col-span-3">
                            <label for="canRegister"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Can
                                Register</label>
                            <USelect id="canRegister"
                                :options="['Admin', 'Departement', 'Internal', 'All', 'External', 'No']"
                                v-model="Event.canRegister" required />
                        </div>
                        <div class="col-span-6">
                            <label for="description"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                            <TipTapEditor id="description" v-model="Event.description" />
                        </div>
                        <div class="col-span-6">
                            <label for="committee"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contributors</label>
                            <div id="committee" class="ms-2">
                                <div v-for="committee, i in Event.committee" :key="i" class="mb-2">
                                    <div class="flex">
                                        <div class="flex items-center w-full gap-2">
                                            <div class="w-3/4">
                                                <label :for="`${committee.job}-job`"
                                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Job</label>
                                                <UInput :type="`${committee.job}-job`" :name="`${committee.job}-job`"
                                                    :id="`${committee.job}-job`" v-model="Event.committee![i].job"
                                                    required />
                                            </div>
                                            <div class="w-1/4">
                                                <label :for="`${committee.job}-profile`"
                                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                                                <UInput type="number" :name="`${committee.job}-profile`"
                                                    :id="`${committee.job}-profile`" v-model="Event.committee![i].user"
                                                    :value="(Event.committee![i].user as IProfile).NIM" required />
                                            </div>
                                        </div>
                                        <UButton @click="deleteCommittee(i)" icon="i-heroicons-trash"
                                            class="text-red-500 dark:text-red-500 hover:text-red-400 dark:hover:text-red-400"
                                            variant="link" />
                                    </div>
                                    <label :for="`${committee.job}-profile`"
                                        class="block text-sm font-medium text-gray-900 dark:text-white">{{
                                            getNameFromNIM(Event.committee![i].user as number) }}</label>
                                </div>
                                <UButton @click="addCommittee" label="Add Committee" icon="i-heroicons-plus" block
                                    trailing />
                            </div>
                        </div>
                    </div>
                    <UButton type="submit" @click.prevent="addEvent" labe="Save" icon="i-heroicons-clipboard" block
                        trailing />
                </div>
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>