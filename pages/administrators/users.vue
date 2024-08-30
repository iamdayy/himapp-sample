<script setup lang='ts'>
import { ModalsAddProfile, ModalsConfirmation, ModalsEditProfile } from '#components';
import type { IProfileResponse } from '~/types/IResponse';

/**
 * Page metadata configuration
 */
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});

/**
 * Set page title
 */
useHead({
    title: 'Users'
});

const { $api } = useNuxtApp();

/**
 * User role and department hooks
 */
const { isOrganizer } = useOrganizer();

/**
 * Modal and toast hooks
 */
const modal = useModal();
const toast = useToast();

/**
 * Responsive design
 */
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 640);
const isTablet = computed(() => width.value >= 640 && width.value < 1024);

/**
 * Responsive UI sizes based on screen width
 */
const responsiveUISizes = computed(() => ({
    input: isMobile.value ? 'sm' : 'md',
    button: isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg',
    select: isMobile.value ? 'sm' : 'md',
}));

/**
 * Table columns configuration
 */
const columns = [
    { key: 'id', label: '#' },
    { key: 'avatar', label: 'Avatar' },
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'NIM', label: 'NIM' },
    { key: 'email', label: 'Email' },
    { key: 'class', label: 'Class', sortable: true },
    { key: 'enteredYear', label: 'Generation', sortable: true },
    { key: 'semester', label: 'Semester', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'position', label: 'Position' },
    { key: 'actions', label: 'Actions', sortable: false }
];

const selectedColumns = ref(columns);
const columnsTable = computed(() => columns.filter((column) => selectedColumns.value.includes(column)));

/**
 * Selected rows management
 */
const selectedRows = ref<any[]>([]);

/**
 * Handle row selection
 * @param {any} row - The row to be selected or deselected
 */
function select(row: any) {
    const index = selectedRows.value.findIndex((item: { id: any; }) => item.id === row.id);
    if (index === -1) {
        selectedRows.value.push(row);
    } else {
        selectedRows.value.splice(index, 1);
    }
}

/**
 * Filterable options for the table
 */
const filterable = [
    { key: 'class', label: 'Class', value: "class" },
    { key: 'semester', label: 'Semester', value: "semester" },
    { key: 'status', label: 'Status', value: "status" },
];

/**
 * Search and filter state
 */
const search = ref('');
const filterBy = ref<{ value: "enteredYear" | "class" | "semester", label: string } | null>(null);
const filter = ref<string[]>([]);
const deleted = ref<boolean>(false);

/**
 * Reset all filters
 */
const resetFilters = () => {
    search.value = '';
    filter.value = [];
    filterBy.value = null;
};

/**
 * Pagination and sorting state
 */
const sort = ref({ column: 'createdAt', direction: 'asc' as const });
const page = ref(1);
const pageCount = ref(10);

/**
 * Fetch data from API
 */
const { data, pending, refresh } = await useLazyAsyncData<IProfileResponse>('users', () => $api<IProfileResponse>('/api/profile', {
    query: {
        search: search.value,
        page: page.value,
        perPage: pageCount.value,
        sort: sort.value.column,
        order: sort.value.direction,
        filterBy: filterBy.value?.value,
        filter: filter.value,
        deleted: deleted.value
    }
}), {
    default: () => ({
        profiles: [],
        filters: [],
        length: 0
    }),
    watch: [page, search, pageCount, sort, filter, filterBy, deleted]
});

/**
 * Computed properties for pagination
 */
const pageTotal = computed(() => data.value.length);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
const pageCountOptions = computed(() => {
    const baseOptions = [5, 10, 20, 50, 100];
    const filteredOptions = baseOptions.filter((option) => option <= pageTotal.value);

    if (isMobile.value && filteredOptions.length > 3) {
        return filteredOptions.slice(0, 3);
    }

    return filteredOptions;
});

/**
 * Delete a member
 * @param {number} NIM - The NIM of the member to delete
 */
const deleteMember = async (NIM: number) => {
    try {
        const deleted = await $api('/api/profile', {
            method: 'delete',
            query: { NIM }
        });
        toast.add({ title: deleted.statusMessage });
    } catch (error: any) {
        toast.add({ title: error.statusMessage });
    }
};

/**
 * Generate Excel file for export
 */
const generateXlsx = async () => {
    try {
        let toExcel = selectedRows.value;
        if (selectedRows.value.length == 0) {
            toExcel = (await $api<IProfileResponse>('/api/profile')).profiles;
        }
        const response = await $fetch<Blob>('/api/sheet/export', {
            method: "post",
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
            body: {
                title: "exported-" + toExcel.length,
                data: toExcel
            }
        });
        const blob = response;
        if (!blob) return;

        const title = `exported-${toExcel.length}-data-${new Date()}`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${title}-${new Date()}.xlsx`);
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error generating Excel file:', error);
    }
};

/**
 * Watch for changes in search and filter to reset page
 */
watch([search, filter], () => {
    page.value = 1;
});

/**
 * Open add modal
 */
const addModal = () => {
    modal.open(ModalsAddProfile, {
        onTriggerRefresh() {
            refresh();
        }
    });
};

/**
 * Open edit modal
 * @param {number} NIM - The NIM of the member to edit
 */
const editModal = (NIM: number) => {
    modal.open(ModalsEditProfile, { NIM });
};

/**
 * Open delete confirmation modal
 * @param {number} NIM - The NIM of the member to delete
 */
const deleteModal = (NIM: number) => {
    modal.open(ModalsConfirmation, {
        title: "Confirm delete",
        body: "Really to delete member with NIM " + NIM + "?",
        onConfirm() {
            deleteMember(NIM).then(() => { modal.close(); refresh(); });
        }
    });
};

/**
 * Generate dropdown items for each row
 * @param {any} row - The row data
 * @returns {Array} Array of dropdown items
 */
const items = (row: any) => [
    [{
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => editModal(row.NIM)
    }],
    [{
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        disabled: row.status == 'deleted',
        click: () => deleteModal(row.NIM)
    }]
];

/**
 * Get color for status badge
 * @param {string} status - The status of the user
 * @returns {string} Color for the badge
 */
const colorbadge = (status: "active" | "inactive" | "free" | "deleted") => {
    switch (status) {
        case "active": return "emerald";
        case "inactive": return "orange";
        case "free": return "primary";
        case "deleted": return "red";
    }
};
</script>
<template>
    <div class="items-center justify-center mb-24">
        <div class="mx-auto text-center">
            <h2 class="text-2xl font-extrabold leading-tight tracking-tight text-gray-600 md:text-4xl dark:text-white">
                Users
            </h2>
        </div>
        <UCard class="px-4 mt-6 md:px-8">
            <template #header>
                <UButton label="New" :size="responsiveUISizes.button" :ui="{ rounded: 'rounded-full' }"
                    v-if="isOrganizer" block @click="addModal" />
                <UButton label="Import" :size="responsiveUISizes.button" :ui="{ rounded: 'rounded-full' }"
                    class="mx-auto my-3" v-if="isOrganizer" to="/administrators/import" />
            </template>
            <div class="w-full py-3">
                <!-- Filters -->
                <div class="flex flex-col items-center justify-between gap-3 px-4 py-3 md:flex-row">
                    <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..."
                        :size="responsiveUISizes.input" class="w-full md:w-auto" />
                    <div class="flex flex-col w-full gap-3 md:flex-row md:w-auto">
                        <USelectMenu v-model="filterBy" :options="filterable" placeholder="Filter By"
                            :size="responsiveUISizes.select" class="w-full md:w-40" />
                        <USelectMenu v-model="filter" :options="data.filters" multiple
                            :placeholder="filterBy?.label || 'none'" :disabled="!filterBy"
                            :size="responsiveUISizes.select" class="w-full md:w-40" />
                    </div>
                </div>

                <!-- Header and Action buttons -->
                <div class="flex flex-col items-center justify-between w-full gap-3 px-4 py-3 md:flex-row">
                    <div class="flex items-center gap-1.5">
                        <span class="text-sm leading-5">Rows per page:</span>
                        <USelect v-model="pageCount" :options="pageCountOptions" class="w-20 me-2"
                            :size="responsiveUISizes.select" />
                    </div>

                    <div class="flex flex-wrap gap-1.5 items-center justify-center md:justify-end">
                        <UButton v-if="selectedRows.length > 1" icon="i-heroicons-arrow-down-tray" trailing color="gray"
                            :size="responsiveUISizes.button" @click="generateXlsx">
                            Export Selected
                        </UButton>
                        <UButton v-else icon="i-heroicons-arrow-down-tray" trailing color="gray"
                            :size="responsiveUISizes.button" @click="generateXlsx">
                            Export All
                        </UButton>

                        <USelectMenu v-model="selectedColumns" :options="columns" multiple>
                            <UButton icon="i-heroicons-view-columns" color="gray" :size="responsiveUISizes.button">
                                Columns
                            </UButton>
                        </USelectMenu>

                        <UButton icon="i-heroicons-funnel" color="gray" :size="responsiveUISizes.button"
                            :disabled="search === '' && filter.length === 0" @click="resetFilters">
                            Reset
                        </UButton>

                        <UButton icon="i-heroicons-arrow-path" color="gray" :size="responsiveUISizes.button"
                            @click="refresh" :loading="pending">
                            Refresh
                        </UButton>
                        <div class="flex items-center">
                            <p class="text-sm font-light me-2">Show deleted</p>
                            <UToggle v-model="deleted" :loading="pending" />
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <UTable v-model="selectedRows" v-model:sort="sort" :rows="data.profiles" :columns="columnsTable"
                        :loading="pending" sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down"
                        sort-mode="manual" class="w-full" :ui="{ default: { checkbox: { color: 'gray' } } }"
                        @select="select">
                        <template #id-data="{ index }">
                            <span>{{ index + 1 }}</span>
                        </template>

                        <template #avatar-data="{ row }">
                            <NuxtImg :src="row.avatar || '/img/profile-blank.png'" width="24" height="24"
                                class="object-cover rounded-full max-w-8 aspect-square" />
                        </template>

                        <template #position-data="{ row }">
                            <div v-if="row.isAdministrator" class="text-center">
                                <p>PH</p>
                                <p>{{ row.isAdministrator.role }}</p>
                                <p>{{ `${new Date(row.isAdministrator.period.start).getFullYear()}-${new
                                    Date(row.isAdministrator.period.end).getFullYear()}` }}</p>
                            </div>
                        </template>
                        <template #status-data="{ row }">
                            <UBadge size="xs" :label="row.status" :color="colorbadge(row.status)" variant="subtle" />
                        </template>

                        <template #actions-data="{ row }">
                            <UDropdown :items="items(row)" :popper="{ arrow: true, strategy: 'absolute' }">
                                <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal"
                                    :size="responsiveUISizes.button" />
                            </UDropdown>
                        </template>
                    </UTable>
                </div>
            </div>
            <!-- Number of rows & Pagination -->
            <template #footer>
                <div class="flex flex-col flex-wrap items-center justify-between gap-3 md:flex-row">
                    <div>
                        <span class="text-sm leading-5">
                            Showing
                            <span class="font-medium">{{ pageFrom }}</span>
                            to
                            <span class="font-medium">{{ pageTo }}</span>
                            of
                            <span class="font-medium">{{ pageTotal }}</span>
                            results
                        </span>
                    </div>

                    <UPagination v-model="page" :page-count="pageCount" :total="pageTotal"
                        :ui="{ wrapper: 'flex items-center gap-1', rounded: '!rounded-full min-w-[32px] justify-center', default: { activeButton: { variant: 'outline' } } }" />
                </div>
            </template>
        </UCard>
    </div>
</template>
<style scoped></style>