<script setup lang="ts">
import { array, object, string } from 'yup';
import type { IConfig } from "~/types";
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});

useHead({
    title: 'Config'
});

const { data } = await useAsyncData<{ body: IConfig }>(() => $fetch("/api/config"));
const { organizer } = useOrganizer();
const toast = useToast();

const Config = ref<IConfig>(data.value?.body || { dailyManagements: [], departments: [] });
const newDailyManagement = ref('');
const openPopoverAddDailyManagement = ref(false);
const newDepartment = ref('');
const openPopoverAddDepartment = ref(false);
const addDailyManagement = () => {
    Config.value.dailyManagements.push(newDailyManagement.value);
    newDailyManagement.value = '';
    openPopoverAddDailyManagement.value = false;
};
const deleteDailyManagement = (dailyManagement: string) => {
    Config.value.dailyManagements = Config.value.dailyManagements.filter(management => management !== dailyManagement);
};
const addDepartment = () => {
    Config.value.departments.push(newDepartment.value);
    newDepartment.value = '';
    openPopoverAddDepartment.value = false;
};
const deleteDepartment = (department: string) => {
    Config.value.departments = Config.value.departments.filter(department => department !== department);
};

// Responsive design
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 640);
const isTablet = computed(() => width.value >= 640 && width.value < 1024);

// Responsive UI sizes based on screen width
const responsiveUISizes = computed(() => ({
    input: isMobile.value ? 'sm' : 'md',
    button: isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg',
    select: isMobile.value ? 'sm' : 'md',
    card: isMobile.value ? 'p-4' : 'p-6',
    table: {
        th: isMobile.value ? 'px-2 py-1' : 'px-4 py-2',
        td: isMobile.value ? 'px-2 py-1' : 'px-4 py-2'
    },
    form: isMobile.value ? 'p-4' : 'p-6'
}));

const schema = object({
    dailyManagements: array().of(object({
        position: string().required(),
        profile: string().required()
    })),
    departments: array().of(object({
        name: string().required(),
        coordinator: string().required(),
        members: array().of(string()).required()
    }))
});


const onSubmit = async () => {
    try {
        await $fetch('/api/config', {
            method: 'POST',
            body: Config.value
        });
        toast.add({
            title: 'Config updated successfully',
            icon: 'i-heroicons-check-circle',
            color: 'green'
        });
    } catch (error) {
        toast.add({
            title: 'Failed to update config',
            icon: 'i-heroicons-x-circle',
            color: 'red'
        });
    }
};
</script>
<template>
    <div class="items-center justify-center mb-24">
        <div class="mx-auto my-4 text-center">
            <h2 class="text-2xl font-extrabold leading-tight tracking-tight text-gray-600 md:text-4xl dark:text-white">
                Config
            </h2>
        </div>
        <UCard :ui="{ base: 'min-h-full', body: responsiveUISizes.card }">
            <div class="px-2 py-6 md:py-12 md:px-8">
                <UForm :schema="schema" :state="Config" :ui="responsiveUISizes.form" @submit="onSubmit">
                    <div class="flex flex-col gap-4">
                        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Daily Managements</h2>
                        <div class="flex gap-2">
                            <UButton v-for="dailyManagement in Config.dailyManagements" :key="dailyManagement"
                                :label="dailyManagement" size="sm" color="green" variant="solid"
                                :ui="{ variant: { solid: 'bg-green-500 hover:bg-red-600 dark:bg-green-400 dark:hover:bg-red-500' } }"
                                @click="deleteDailyManagement(dailyManagement)"
                                :disabled="!organizer?.role.includes('Ketua') && !organizer?.role.includes('Chairman')" />

                            <UPopover overlay v-model:open="openPopoverAddDailyManagement"
                                :popper="{ strategy: 'absolute', placement: 'bottom', arrow: true }"
                                v-if="organizer?.role.includes('Ketua') || organizer?.role.includes('Chairman')">
                                <UButton icon="i-heroicons-plus" color="green" variant="ghost" />
                                <template #panel>
                                    <div class="flex flex-col gap-2 p-4 min-w-48">
                                        <UInput v-model="newDailyManagement" />
                                        <UButton @click="addDailyManagement" label="Add" color="green" variant="solid"
                                            block />
                                    </div>
                                </template>
                            </UPopover>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4">
                        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Daily Managements</h2>
                        <div class="flex gap-2">
                            <UButton v-for="department in Config.departments" :key="department" :label="department"
                                size="sm" color="green" variant="solid"
                                :ui="{ variant: { solid: 'bg-green-500 hover:bg-red-600 dark:bg-green-400 dark:hover:bg-red-500' } }"
                                @click="deleteDepartment(department)"
                                :disabled="!organizer?.role.includes('Ketua') && !organizer?.role.includes('Chairman')" />
                            <UPopover overlay v-model="openPopoverAddDepartment"
                                :popper="{ strategy: 'absolute', placement: 'bottom', arrow: true }"
                                v-if="organizer?.role.includes('Ketua') || organizer?.role.includes('Chairman')">
                                <UButton icon="i-heroicons-plus" color="green" variant="ghost" />
                                <template #panel>
                                    <div class="flex flex-col gap-2 p-4 min-w-48">
                                        <UInput v-model="newDepartment" />
                                        <UButton @click="addDepartment" label="Add" color="green" variant="solid"
                                            block />
                                    </div>
                                </template>
                            </UPopover>
                        </div>
                    </div>
                </UForm>
            </div>
            <template #footer>
                <UButton @click="onSubmit" label="Save" color="green" variant="solid" block
                    :v-if="organizer?.role.includes('Ketua') || organizer?.role.includes('Chairman')" />
            </template>
        </UCard>
    </div>
</template>