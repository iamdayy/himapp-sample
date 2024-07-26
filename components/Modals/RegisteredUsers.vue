<script setup lang='ts'>
import type { IProfile, IRegistered } from '~/types';
const modal = useModal()
const selectedRegistered = ref<IRegistered[]>([]);
const props = defineProps({
    registered: {
        type: Array as PropType<IRegistered[]>,
    }
});

const emit = defineEmits(['changeCheckItem']);
const checkAll = () => {
    if (selectedRegistered.value.length == props.registered?.length) {
        selectedRegistered.value = [];
    } else {
        selectedRegistered.value = props.registered!;
    }
    emit('changeCheckItem', selectedRegistered);
}

const generateXlxs = async () => {
    const excel = new Excel<IRegistered[]>('registered-event');
    await excel.generate(selectedRegistered.value);
    excel.download();
}
</script>
<template>
    <UModal>
        <UCard>
            <template #header>
                <div class="flex w-full justify-between">
                    <h2 class="text-xl font-semibold dark:text-gray-200">New Event</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div>
                <table class="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="p-4">
                                <div class="flex items-center">
                                    <input id="checkbox-all-search" type="checkbox"
                                        :checked="selectedRegistered.length == registered?.length" @change="checkAll"
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                    <label for="checkbox-all-search" class="sr-only">checkbox</label>
                                </div>
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Name
                            </th>
                            <th scope="col" class="px-6 py-3">
                                NIM
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Class
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            v-for="r, i in registered" :key="i">
                            <td class="w-4 p-4">
                                <div class="flex items-center">
                                    <input id="checkbox-table" type="checkbox" v-model="selectedRegistered" :value="r"
                                        @change="$emit('changeCheckItem', selectedRegistered)"
                                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded checkbox-table focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                    <label for="checkbox-table" class="sr-only">checkbox</label>
                                </div>
                            </td>
                            <th scope="row"
                                class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                                <NuxtImg class="rounded-full"
                                    :src="(r?.profile as IProfile).avatar || '/profile-blank.png'" sizes="40"
                                    alt="Jese image" />
                                <div class="ps-3">
                                    <div class="text-base font-semibold">{{
                                        (r?.profile as IProfile).fullName }}</div>
                                    <div class="font-normal text-gray-500">{{
                                        (r?.profile as IProfile).email
                                    }}</div>
                                </div>
                            </th>
                            <td class="px-6 py-4">
                                {{ (r?.profile as IProfile).NIM }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center">
                                    {{ (r?.profile as IProfile).class }}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot class="px-3 py-4">
                        <UButton @click="generateXlxs" label="Export" block></UButton>
                    </tfoot>
                </table>
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>