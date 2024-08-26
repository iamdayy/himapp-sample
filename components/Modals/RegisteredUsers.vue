<script setup lang='ts'>
import type { IRegistered } from '~/types';

/**
 * Modal instance for controlling the modal visibility
 */
const modal = useModal()

/**
 * Ref to store selected registered users
 */
const selectedRegistered = ref<IRegistered[]>([]);

/**
 * Current page number for pagination
 */
const page = ref(1)

/**
 * Number of items per page
 */
const pageCount = ref(5)

/**
 * Window size composable for responsive design
 */
const { width } = useWindowSize()

/**
 * Computed property to determine if the screen is mobile size
 */
const isMobile = computed(() => width.value < 640)

/**
 * Computed property to determine if the screen is tablet size
 */
const isTablet = computed(() => width.value >= 640 && width.value < 1024)

/**
 * Computed property for responsive table columns
 */
const columns = computed(() => [
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
        key: "email",
        hidden: isMobile.value
    },
    {
        label: "Class",
        key: "class",
        sortable: true,
        hidden: isMobile.value
    },
    {
        label: "Generation",
        key: "createdAt",
        sortable: true,
        hidden: isMobile.value || isTablet.value
    },
    {
        label: "Semester",
        key: "semester",
        sortable: true,
        hidden: isMobile.value || isTablet.value
    },
])

/**
 * Props definition for the component
 */
const props = defineProps({
    registered: {
        type: Array as PropType<IRegistered[]>,
        required: true,
    }
});

/**
 * Emits definition for the component
 */
const emit = defineEmits(['changeCheckItem']);

/**
 * Flattens a nested object structure
 * @param {Object} obj - The object to flatten
 * @returns {Object} Flattened object
 */
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

/**
 * Watch for changes in selectedRegistered and emit the change
 */
watch(selectedRegistered, () => {
    emit('changeCheckItem', selectedRegistered);
})

/**
 * Generates and downloads an XLSX file of registered users
 */
const generateXlsx = async () => {
    try {
        const response = await $fetch<Blob>('/api/sheet/export', {
            method: "post",
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
            body: {
                title: "Registered-User",
                data: selectedRegistered.value || props.registered
            }
        })
        const blob = response;
        if (!blob) {
            return
        }
        const title = `Registered-users-${new Date()}`
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
            `${title}-${new Date()}.xlsx`);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error generating XLSX:', error);
    }
}

/**
 * Computed property to get the current page of rows
 */
const rows = computed(() => {
    return props.registered?.slice((page.value - 1) * pageCount.value, (page.value) * pageCount.value)
})

/**
 * Computed property for responsive UI sizes
 */
const responsiveUISizes = computed(() => ({
    button: isMobile.value ? 'xs' : isTablet.value ? 'sm' : 'md',
    select: isMobile.value ? 'xs' : 'sm',
    pagination: isMobile.value ? 'xs' : 'sm',
}))
</script>
<template>
    <UModal :ui="{ width: 'sm:max-w-4xl' }" :fullscreen="isMobile">
        <UCard>
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <h2 class="text-xl font-semibold dark:text-gray-200">Registered</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray" @click="modal.close"
                        :size="responsiveUISizes.button" />
                </div>
            </template>
            <div class="space-y-4">
                <UTable v-model="selectedRegistered" :columns="columns" :rows="rows?.map(v => flattenData(v))"
                    responsive>
                    <template #createdAt-data="{ row }">
                        <span>{{ new Date(row.createdAt).getFullYear() }}</span>
                    </template>
                    <template #avatar-data="{ row }">
                        <UAvatar :src="row.avatar" size="sm" />
                    </template>
                </UTable>
                <div class="flex flex-col items-center justify-between w-full gap-4 sm:flex-row">
                    <USelect label="per Page" :options="[5, 10, 20]" v-model="pageCount"
                        :size="responsiveUISizes.select" />
                    <UPagination :size="responsiveUISizes.pagination" color="gray" v-model="page"
                        :page-count="Math.ceil((props.registered?.length || 0) / pageCount)"
                        :total="props.registered?.length" show-last show-first />
                </div>
                <UButton label="Export" block @click="generateXlsx" :size="responsiveUISizes.button" />
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>