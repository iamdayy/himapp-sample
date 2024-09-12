<script setup lang="ts">
import type { IOrganizer } from '~/types';
import type { IConfigResponse, IOrganizerResponse, IProfileResponse } from '~/types/IResponse';

const modal = useModal();
const { $api } = useNuxtApp();
const toast = useToast();
const items = [
    {
        slot: 'dailyManager',
        label: 'Daily Manager',
    },
    {
        slot: 'departements',
        label: 'Departements',
    }
]

const { data } = await useAsyncData<IConfigResponse>(() => $fetch<IConfigResponse>("/api/config"));
const { data: profileData } = await useAsyncData(() => $fetch<IProfileResponse>("/api/profile"));
const { organizer: org } = useOrganizer();

const emits = defineEmits<{
    (e: 'refreshTrigger'): void
}>();

const dailyManagements = computed(() => {
    if (!data.value) return [];
    return data.value?.data?.dailyManagements.map((management) => {
        return {
            position: management,
            profile: 0,
        }
    })
});

const departements = computed(() => {
    if (!data.value) return [];
    return data.value?.data?.departments.map((department) => {
        return {
            name: department,
            coordinator: 0,
            members: [],
        }
    })
});

const organizer = ref<IOrganizer>({
    dailyManagement: dailyManagements.value,
    department: departements.value,
    period: {
        start: new Date(),
        end: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
    }
});

const departementsTabs = computed(() => {
    return organizer.value.department.map((department) => {
        return {
            slot: 'departement',
            label: department.name,
        }
    })
});

const addMember = (i: number) => {
    (organizer.value.department[i].members as number[]).push(21060202001);
}

const deleteMember = (i: number) => {
    organizer.value.department[i].members.splice(i, 1);
}

const addOrganizer = async () => {
    const added = await $api<IOrganizerResponse>('/api/organizer', {
        method: 'POST',
        body: organizer.value,
    });
    toast.add({
        title: 'Organizer added',
        description: 'Organizer has been added',
        color: 'green',
    });
    modal.close();
    emits('refreshTrigger');
}

/**
 * Get the full name of a user from their NIM
 * @param {number | undefined} NIM - The NIM (Nomor Induk Mahasiswa) of the user
 * @returns {string | undefined} The full name of the user, or undefined if not found
 */
const getNameFromNIM = (NIM?: number): string | undefined => {
    return profileData.value?.data?.profiles.find((profile) => profile.NIM == NIM)?.fullName;
}

watch(() => organizer.value.period.start, (newVal) => {

    organizer.value.period.end = new Date(newVal.getFullYear() + 1, newVal.getMonth(), newVal.getDate());
});

</script>
<template>
    <UModal>
        <UCard>
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 class="text-xl font-semibold dark:text-gray-200">Add Organizer</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray" @click="modal.close"
                        v-if="org?.role.includes('Ketua') || org?.role.includes('Chairman')" />
                </div>
            </template>
            <div class="mb-6 ms-3">
                <label for="Title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Period</label>
                <VDatePicker id="deadline" v-model="organizer.period.start" mode="date">
                    <template #default="{ togglePopover }">
                        <UButton @click="togglePopover" icon="i-heroicons-calendar" variant="outline">
                            <template #trailing>
                                <span class="text-sm font-medium text-gray-900 dark:text-white" for="deadline">
                                    {{ organizer.period.start.getFullYear() }} -
                                    {{ organizer.period.end.getFullYear() }}
                                </span>
                            </template>
                        </UButton>
                    </template>
                </VDatePicker>
            </div>
            <UTabs :items="items">
                <template #dailyManager="{ item }">
                    <UCard>
                        <div class="grid grid-cols-12 gap-2" v-for="(profile, i) in organizer.dailyManagement" :key="i">
                            <div class="col-span-6">
                                <label for="Position"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position</label>
                                <UInput type="text" name="Position" id="Position" placeholder="Leader, Secretary, etc."
                                    required v-model="organizer.dailyManagement[i].position" class="w-full" />
                            </div>
                            <div class="col-span-6">
                                <label for="NIM"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                                <UInput type="text" name="NIM" id="NIM" placeholder="21060202001" required
                                    v-model="organizer.dailyManagement[i].profile" class="w-full" />
                                <label :for="`${organizer.dailyManagement[i].profile}-profile`"
                                    class="block mt-1 text-sm font-medium text-gray-900 dark:text-white">{{
                                        getNameFromNIM(organizer.dailyManagement[i].profile as number)
                                    }}</label>
                            </div>
                        </div>
                    </UCard>
                </template>
                <template #departements="{ item }">
                    <UCard>
                        <UTabs :items="departementsTabs">
                            <template #departement="{ item, index }">
                                <div class="grid grid-cols-12 gap-2 my-2">
                                    <div class="col-span-12">
                                        <label for="Position"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                                        <UInput type="text" name="Position" id="Position"
                                            placeholder="Name of Departement" required
                                            v-model="organizer.department[index].name" class="w-full" />
                                    </div>
                                    <div class="col-span-12">
                                        <label for="Coordinator"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Coordinator</label>
                                        <UInput type="number" name="Coordinator" id="Coordinator"
                                            placeholder="21060202001" required
                                            v-model="organizer.department[index].coordinator" class="w-full" />
                                        <label :for="`${organizer.department[index].coordinator}-profile`"
                                            class="block mt-1 text-sm font-medium text-gray-900 dark:text-white">{{
                                                getNameFromNIM(organizer.department[index].coordinator as number)
                                            }}</label>
                                    </div>
                                    <div class="col-span-12">
                                        <label for="Member"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Members</label>
                                        <div class="grid grid-cols-12 gap-2 p-3"
                                            v-for="(member, i) in organizer.department[index].members" :key="i">
                                            <div class="col-span-11">
                                                <UInput type="number" name="Member" id="Member"
                                                    placeholder="21060202001" required
                                                    v-model="organizer.department[index].members[i]" class="w-full" />
                                                <label :for="`${organizer.department[index].members[i]}-profile`"
                                                    class="block mt-1 text-sm font-medium text-gray-900 dark:text-white">{{
                                                        getNameFromNIM(organizer.department[index].members[i] as number)
                                                    }}</label>
                                            </div>
                                            <div class="flex items-end justify-center col-span-1">
                                                <UButton @click="deleteMember(index)" icon="i-heroicons-minus"
                                                    color="red" variant="outline" size="sm" :padded="false"
                                                    class="mb-2">
                                                </UButton>
                                            </div>
                                        </div>
                                        <UButton @click="addMember(index)" block variant="solid" size="sm" color="gray"
                                            label="Add New Member" class="mt-2">
                                            <template #trailing>
                                                <UIcon name="i-heroicons-plus" />
                                            </template>
                                        </UButton>
                                    </div>
                                </div>
                            </template>
                        </UTabs>
                    </UCard>
                </template>
            </UTabs>
            <template #footer>
                <div class="flex justify-between w-full">
                    <UButton @click="modal.close" label="Cancel" color="gray" variant="outline" />
                    <UButton @click="addOrganizer" label="Save" color="green" variant="solid" />
                </div>
            </template>
        </UCard>
    </UModal>
</template>, IProfileResponse
