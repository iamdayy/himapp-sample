<script setup lang='ts'>
import { ModalsEditProfile } from '#components';
import type { IProfile } from '~/types';

definePageMeta({
    layout: 'dashboard'
})

// Columns
const columns = [{
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
},
{
    key: 'actions',
    label: 'Actions',
}]

const toast = useToast();

const modal = useModal();

const selectedCollegers = ref<IProfile[]>([]);
const loading = ref<boolean>(false);

const DataFromCSV = ref<IProfile[]>([]);

const onChangeXlsx = async (file: File) => {
    loading.value = true;
    try {
        const form = new FormData();
        form.append("file", file);
        const uploaded = await $fetch("/api/sheet/import", {
            method: "POST",
            body: form,
        });
        DataFromCSV.value = uploaded as IProfile[];
        loading.value = false;
    } catch (error) {
        toast.add({ title: "Failed to read Data" })
        loading.value = false;
    }
}

const addCollegers = async () => {
    loading.value = true;
    try {
        const added = await $fetch("/api/profile/batch", {
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
const downloadTemplate = async () => {
    const profile: IProfile = {
        fullName: "",
        NIM: 0,
        email: "",
        phone: "",
        avatar: "/profile-blank.png",
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
            data: [profile]
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

const editModal = (Member: IProfile) => {
    modal.open(ModalsEditProfile, {
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
    <!-- Add From CSV -->
    <!--  -->
    <!--  -->
    <div class="items-center justify-center mb-24 ">
        <div class="mx-auto text-center">
            <h2 class="text-4xl font-extrabold leading-tight tracking-tight text-gray-600 dark:text-white">
                Users
            </h2>
        </div>
        <UCard :ui="{ base: 'min-h-full' }">
            <div class="py-12">
                <DropFile @change="onChangeXlsx" />
                <div class="w-full p-2 mx-auto my-3 text-center">
                    <UButton variant="link" @click="downloadTemplate">
                        Download Template
                    </UButton>
                </div>
                <!-- Table -->
                <UTable v-model="selectedCollegers" :rows="DataFromCSV" :columns="columns" :loading="loading"
                    sort-asc-icon="i-heroicons-arrow-up" sort-desc-icon="i-heroicons-arrow-down" sort-mode="manual"
                    :ui="{ base: 'w-full', default: { checkbox: { color: 'gray' } } }">
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
                            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                        </UDropdown>
                    </template>
                </UTable>
                <div class="w-full p-2">
                    <UButton @click="addCollegers" size="xl" :loading="loading" :disabled="DataFromCSV.length <= 0"
                        :label="`Add Checked Collegers (${selectedCollegers.length})`" block />
                </div>
            </div>
        </UCard>
    </div>
</template>
<style scoped></style>