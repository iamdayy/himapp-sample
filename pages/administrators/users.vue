<script setup lang='ts'>
import { ModalsAddProfile, ModalsConfirmation, ModalsEditProfile } from '#components';
import type { IProfileResponse } from '~/types/IResponse';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});
useHead({
    title: 'Users'
})

const { isAdmin } = useRole();
const { isDept } = useDept();
const modal = useModal();
const toast = useToast();

// Columns
const columns = [{
    key: 'id',
    label: '#',
},
{
    key: 'avatar',
    label: 'Avatar',
},
{
    key: 'fullName',
    label: 'Full Name',
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
    key: "enteredYear",
    sortable: true
},
{
    label: "Semester",
    key: "semester",
    sortable: true
},
{
    label: "Status",
    key: "status"
},
{
    label: "Position",
    key: "position"
},
{
    key: 'actions',
    label: 'Actions',
    sortable: false
}]

const selectedColumns = ref(columns)
const columnsTable = computed(() => columns.filter((column) => selectedColumns.value.includes(column)))

// Selected Rows
const selectedRows = ref<any[]>([])

function select(row: any) {
    const index = selectedRows.value.findIndex((item: { id: any; }) => item.id === row.id)
    if (index === -1) {
        selectedRows.value.push(row)
    } else {
        selectedRows.value.splice(index, 1)
    }
}


const filterable = [
    {
        key: 'class',
        label: 'Class',
        value: "class"
    },
    {
        key: 'semester',
        label: 'Semester',
        value: "semester"
    },
    {
        key: 'status',
        label: 'Status',
        value: "status"
    },
]
// search & filter
const search = ref('');
const filterBy = ref<{ value: "enteredYear" | "class" | "semester", label: string } | null>(null);
const filter = ref<string[]>([]);
const deleted = ref<boolean>(false)


const resetFilters = () => {
    search.value = ''
    filter.value = [];
    filterBy.value = null
}


// Pagination
const sort = ref({ column: 'createdAt', direction: 'asc' as const });
const page = ref(1);
const pageCount = ref(10);

// Data
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
const pageTotal = computed(() => data.value.length) // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))
const pageCountOptions = computed(() => [10, 20, 50, 100, 200, data.value.length]);

const deleteMember = async (NIM: number) => {
    try {
        const deleted = await $api('/api/profile', {
            method: 'delete',
            query: {
                NIM
            }
        });
        toast.add({ title: deleted.statusMessage })
    } catch (error: any) {
        toast.add({ title: error.statusMessage })
    }
}

// TODO: Generate XLSX
const generateXlsx = async () => {
    try {
        let toExcel = selectedRows.value
        if (selectedRows.value.length == 0) {
            toExcel = (await $api<IProfileResponse>('/api/profile')).profiles
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
        })
        const blob = response;
        if (!blob) {
            return
        }
        const title = `exported-${toExcel.length}-data-${new Date()}`
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',
            `${title}-${new Date()}.xlsx`); // Nama file yang diunduh
        document.body.appendChild(link);
        link.click();
    } catch (error) {

    }
}
watch([search, filter], () => {
    page.value = 1;
});
const addModal = () => {
    modal.open(ModalsAddProfile, {
        onTriggerRefresh() {
            refresh();
        }
    })
}
const editModal = (NIM: number) => {
    modal.open(ModalsEditProfile, {
        NIM
    })
}
const deleteModal = (NIM: number) => {
    modal.open(ModalsConfirmation, {
        title: "Confirm delete",
        body: "Really to delete member with NIM " + NIM + "?",
        onConfirm() {
            deleteMember(NIM).then(() => { modal.close(); refresh() })
        }
    })
}

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
]

const colorbadge = (status: "active" | "inactive" | "free" | "deleted") => {
    switch (status) {
        case "active":
            return "emerald";
            break;
        case "inactive":
            return "orange"
            break;
        case "free":
            return "primary"
            break;
        case "deleted":
            return "red"
    }
}
</script>
<template>
    <div class="items-center justify-center mb-24 ">
        <div class="mx-auto text-center">
            <h2 class="text-4xl font-extrabold leading-tight tracking-tight text-gray-600 dark:text-white">
                Users
            </h2>
        </div>
        <UCard class="px-8 mt-6">
            <template #header>
                <UButton label="New" size="xl" :ui="{ rounded: 'rounded-full' }" v-if="isAdmin || isDept" block
                    @click="addModal" />
                <UButton label="Import" size="xl" :ui="{ rounded: 'rounded-full' }" class="mx-auto my-3"
                    v-if="isAdmin || isDept" to="/administrators/import" />
            </template>
            <div class="w-full py-3">
                <!-- Filters -->
                <div class="flex items-center justify-between gap-3 px-4 py-3">
                    <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Search..." />
                    <div class="flex gap-3">
                        <USelectMenu v-model="filterBy" :options="filterable" placeholder="Filter By" class="w-40" />

                        <USelectMenu v-model="filter" :options="data.filters" multiple
                            :placeholder="filterBy?.label || 'none'" :disabled="!filterBy" class="w-40" />
                    </div>
                </div>

                <!-- Header and Action buttons -->
                <div class="flex justify-between items-center w-full px-4 py-3">
                    <div class="flex items-center gap-1.5">
                        <span class="text-sm leading-5">Rows per page:</span>

                        <USelect v-model="pageCount" :options="pageCountOptions" class="me-2 w-20" size="xs" />
                    </div>

                    <div class="flex gap-1.5 items-center">
                        <UButton v-if="selectedRows.length > 1" icon="i-heroicons-arrow-down-tray" trailing color="gray"
                            size="xs" @click="generateXlsx">
                            Export Selected
                        </UButton>
                        <UButton v-else icon="i-heroicons-arrow-down-tray" trailing color="gray" size="xs"
                            @click="generateXlsx">
                            Export All
                        </UButton>

                        <USelectMenu v-model="selectedColumns" :options="columns" multiple>
                            <UButton icon="i-heroicons-view-columns" color="gray" size="xs">
                                Columns
                            </UButton>
                        </USelectMenu>

                        <UButton icon="i-heroicons-funnel" color="gray" size="xs"
                            :disabled="search === '' && filter.length === 0" @click="resetFilters">
                            Reset
                        </UButton>

                        <UButton icon="i-heroicons-arrow-path" color="gray" size="xs" @click="refresh"
                            :loading="pending">
                            Refresh
                        </UButton>
                        <div class="flex">
                            <p class="text-sm font-light me-2">Show deleted</p>
                            <UToggle v-model="deleted" :loading="pending" />
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <UTable v-model="selectedRows" v-model:sort="sort" :rows="data.profiles" :columns="columnsTable"
                    :loading="pending" sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down"
                    sort-mode="manual" class="w-full" :ui="{ default: { checkbox: { color: 'gray' } } }"
                    @select="select">
                    <template #id-data="{ index }">
                        <span>{{ index + 1 }}</span>
                    </template>

                    <template #avatar-data="{ row }">
                        <UAvatar :src="row.avatar || '/img/profile-blank.png'" />
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
                            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                        </UDropdown>
                    </template>
                </UTable>
            </div>
            <!-- Number of rows & Pagination -->
            <template #footer>
                <div class="flex flex-wrap justify-between items-center">
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