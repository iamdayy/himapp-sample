<script setup lang="ts">
import type { IOrganizer } from '~/types';

const modal = useModal();
const { $api } = useNuxtApp();
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

const departementsTabs = computed(() => {
    return organizer.value.department.map((department) => {
        return {
            slot: 'departement',
            label: department.name,
        }
    })
})

const organizer = ref<IOrganizer>({
    dailyManagement: [
        {
            position: '',
            profile: 0,
        }
    ],
    department: [
        {
            name: 'New Departement',
            coordinator: 0,
            members: [0],
        }
    ],
    period: {
        start: new Date(),
        end: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
    }
});

const addDailyManager = () => {
    organizer.value.dailyManagement.push({
        position: '',
        profile: 0,
    });
}

const removeDailyManager = (i: number) => {
    organizer.value.dailyManagement.splice(i, 1);
}

const addDepartement = (i: number) => {
    organizer.value.department.push({
        name: 'New Departement',
        coordinator: 0,
        members: [],
    });
}

const deleteDepartement = (i: number) => {
    organizer.value.department.splice(i, 1);
}

const addMember = (i: number) => {
    (organizer.value.department[i].members as number[]).push(21060202001);
}

const deleteMember = (i: number) => {
    organizer.value.department[i].members.splice(i, 1);
}

const addOrganizer = async () => {
    const added = await $api('/api/organizer', {
        method: 'POST',
        body: organizer.value,
    });
    console.log(added);
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
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
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
                            <div class="col-span-5">
                                <label for="Position"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position</label>
                                <UInput type="text" name="Position" id="Position" placeholder="Leader, Secretary, etc."
                                    required v-model="organizer.dailyManagement[i].position" class="w-full" />
                            </div>
                            <div class="col-span-5">
                                <label for="NIM"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                                <UInput type="text" name="NIM" id="NIM" placeholder="21060202001" required
                                    v-model="organizer.dailyManagement[i].profile" class="w-full" />
                            </div>
                            <div class="flex items-end justify-center col-span-1">
                                <UButton @click="removeDailyManager(i)" icon="i-heroicons-minus" color="red"
                                    variant="outline" size="sm" :padded="false" class="mb-2"
                                    :disabled="organizer.dailyManagement.length === 1">
                                </UButton>
                            </div>
                        </div>
                        <UButton @click="addDailyManager" block icon="i-heroicons-plus" color="gray" variant="outline"
                            size="sm" class="mt-2">
                        </UButton>
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
                                    <div class="col-span-12">
                                        <UButton @click="deleteDepartement(index)" block icon="i-heroicons-minus"
                                            variant="solid" size="sm" color="red" class="mt-2"
                                            :disabled="organizer.department.length === 1">
                                        </UButton>
                                    </div>
                                </div>
                                <UButton @click="addDepartement(index)" block variant="solid" size="sm" color="gray"
                                    label="Add New Departement" class="mt-2">
                                    <template #trailing>
                                        <UIcon name="i-heroicons-plus" />
                                    </template>
                                </UButton>
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
</template>
