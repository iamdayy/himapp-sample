<script setup lang='ts'>
import { ModalsEditMember } from '#components';
import type { IMember } from '~/types';

// Define page metadata
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});

// Set page title
useHead({
    title: "Import"
})

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
    }
}));

// Define table columns
const columns = computed(() => [
    {
        key: 'id',
        label: '#',
    },
    {
        label: "NIM",
        key: "NIM"
    },
    {
        key: 'fullName',
        label: 'Full Name',
    },
    // Additional columns for non-mobile view
    ...(!isMobile.value ? [
        {
            key: 'birth',
            label: 'Birth Date & Place',
        },
        {
            label: "Email",
            key: "email"
        },
        {
            label: "Class",
            key: "class",
        },
        {
            label: "Semester",
            key: "semester",
        }
    ] : []),
    {
        key: 'actions',
        label: 'Actions',
    }
]);

// Initialize toast and modal
const toast = useToast();
const modal = useModal();

// Reactive variables
const selectedCollegers = ref<IMember[]>([]);
const loading = ref<boolean>(false);
const DataFromCSV = ref<IMember[]>([]);

/**
 * Handle file upload and parse CSV data
 * @param {File} file - The uploaded CSV file
 */
const onChangeXlsx = async (file: File) => {
    loading.value = true;
    try {
        const form = new FormData();
        form.append("file", file);
        const uploaded = await $fetch("/api/sheet/import", {
            method: "POST",
            body: form,
        });
        DataFromCSV.value = uploaded as IMember[];
        loading.value = false;
    } catch (error) {
        toast.add({ title: "Failed to read Data" })
        loading.value = false;
    }
}

/**
 * Add selected collegers to the database
 */
const addCollegers = async () => {
    loading.value = true;
    try {
        const added = await $fetch("/api/member/batch", {
            method: "post",
            body: selectedCollegers.value
        });
        loading.value = false;
        toast.add({ title: added.statusMessage });
        modal.close();
    } catch (error) {
        toast.add({ title: "Failed to add new Collegers" });
    }
}

/**
 * Download template for CSV import
 */
const downloadTemplate = async () => {
    const member: IMember = {
        fullName: "",
        NIM: 0,
        email: "",
        phone: "",
        avatar: "/member-blank.png",
        religion: "",
        sex: "male",
        birth: {
            place: "",
            date: new Date()
        },
        citizen: "",
        address: {
            fullAddress: "",
            village: "",
            district: "",
            city: "",
            province: "",
            country: "",
            zip: 0o0
        },
        class: "",
        semester: 1,
    }
    const response = await $fetch<Blob>('/api/sheet/export', {
        method: "post",
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        body: {
            data: [member]
        }
    })
    const blob = response;

    if (!blob) {
        return
    }
    const title = `template-${new Date()}`
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download',
        `${title}.xlsx`); // Nama file yang diunduh
    document.body.appendChild(link);
    link.click();
}

/**
 * Open edit modal for a specific member
 * @param {IMember} Member - The member to edit
 */
const editModal = (Member: IMember) => {
    modal.open(ModalsEditMember, {
        Member,
        onReturnObject(value) {
            const index = DataFromCSV.value.findIndex((val) => val.NIM == value.NIM);
            if (index >= 0) {
                DataFromCSV.value[index] = value;
            }
            modal.close()
        }
    })
}

/**
 * Generate dropdown items for each row
 * @param {any} row - The row data
 * @returns {Array} Array of dropdown items
 */
const items = (row: any) => [
    [{
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => editModal(row)
    }],
    [{
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid'
    }]
]
</script>
<template>
    <div class="items-center justify-center mb-24">
        <div class="mx-auto my-4 text-center">
            <h2 class="text-2xl font-extrabold leading-tight tracking-tight text-gray-600 md:text-4xl dark:text-white">
                Users
            </h2>
        </div>
        <UCard :ui="{ base: 'min-h-full', body: responsiveUISizes.card }">
            <div class="px-2 py-6 md:py-12 md:px-8">
                <DropFile @change="onChangeXlsx" />
                <div class="w-full p-2 mx-auto my-3 text-center">
                    <UButton variant="link" @click="downloadTemplate" :size="responsiveUISizes.button">
                        Download Template
                    </UButton>
                </div>
                <!-- Table -->
                <UTable v-model="selectedCollegers" :rows="DataFromCSV" :columns="columns" :loading="loading"
                    sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down" sort-mode="manual" :ui="{
                        base: 'w-full overflow-x-auto',
                        default: {
                            checkbox: { color: 'gray' },
                            th: { padding: responsiveUISizes.table.th },
                            td: { padding: responsiveUISizes.table.td }
                        }
                    }">
                    <template #id-data="{ index }">
                        <span>{{ index + 1 }}</span>
                    </template>
                    <template #birth-data="{ row }">
                        <span>{{ row.birth.place }}</span>
                        ,
                        <span>{{ new Date(row.birth.date).toLocaleDateString() }}</span>
                    </template>

                    <template #actions-data="{ row }">
                        <UDropdown :items="items(row)" :popper="{ arrow: true, strategy: 'absolute' }">
                            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid"
                                :size="responsiveUISizes.button" />
                        </UDropdown>
                    </template>
                </UTable>
                <div class="w-full p-2">
                    <UButton @click="addCollegers" :size="responsiveUISizes.button" :loading="loading"
                        :disabled="DataFromCSV.length <= 0"
                        :label="`Add Checked Collegers (${selectedCollegers.length})`" block />
                </div>
            </div>
        </UCard>
    </div>
</template>
<style scoped></style>