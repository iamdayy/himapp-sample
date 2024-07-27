<script setup lang='ts'>
import type { IRegistered } from '~/types';
const modal = useModal()
const selectedRegistered = ref<IRegistered[]>([]);
const page = ref(1)
const pageCount = 5


const columns = [
    {
        label: "Avatar",
        key: "avatar"
    },
    {
        label: "Full Name",
        key: "fullName",
        sortable: true
    },
    {
        label: "NIM",
        key: "NIM"
    },
    {
        label: "Email",
        key: "email"
    },
    {
        label: "Class",
        key: "class",
        sortable: true
    },
    {
        label: "Generation",
        key: "createdAt",
        sortable: true
    },
    {
        label: "Semester",
        key: "semester",
        sortable: true
    },
]
const props = defineProps({
    registered: {
        type: Array as PropType<IRegistered[]>,
    }
});

const emit = defineEmits(['changeCheckItem']);
const flattenData = (obj: Object) => {
    return Object.assign(
        {},
        Object.fromEntries(
            Object.values(obj)
                .filter((x) => typeof x === "object")
                .map((x) => Object.entries(x))
                .flat(1)
        ),
        Object.fromEntries(
            Object.entries(obj).filter(([, x]) => typeof x !== "object")
        )
    );
}

watch(selectedRegistered, () => {
    emit('changeCheckItem', selectedRegistered);
})
const generateXlsx = async () => {
    const excel = new Excel<IRegistered[]>('registered-event');
    await excel.generate(props.registered!);
    excel.download();
}


const rows = computed(() => {
    return props.registered?.slice((page.value - 1) * pageCount, (page.value) * pageCount)
})
</script>
<template>
    <UModal :ui="{ width: 'sm:max-w-4xl' }">
        <UCard>
            <template #header>
                <div class="flex w-full justify-between">
                    <h2 class="text-xl font-semibold dark:text-gray-200">Registered</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div>
                <UTable v-model="selectedRegistered" :columns="columns" :rows="rows?.map(v => flattenData(v))">
                    <template #createdAt-data="{ row }">
                        <span>{{ new Date(row.createdAt).getFullYear() }}</span>
                    </template>
                    <template #avatar-data="{ row }">
                        <UAvatar :src="row.avatar" />
                    </template>
                </UTable>
                <div class="flex w-full justify-between my-2">
                    <USelect label="per Page" :options="[5, 10, 20]" v-model="pageCount" />
                    <UPagination size="sm" color="gray" v-model="page" :page-count="pageCount"
                        :total="registered?.length" show-last show-first />
                </div>
                <UButton label="Export" block @click="generateXlsx" />
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>