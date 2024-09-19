<script setup lang="ts">
import imageCompression from 'browser-image-compression';
import type { IOrganizer } from '~/types';
import type { IConfigResponse, IMemberResponse, IOrganizerResponse } from '~/types/IResponse';

const modal = useModal();
const { $api } = useNuxtApp();
const toast = useToast();
const { convert } = useImageToBase64();
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
const { data: memberData } = await useAsyncData(() => $api<IMemberResponse>("/api/member"));
const { organizer: org } = useOrganizer();

const emits = defineEmits<{
    (e: 'refreshTrigger'): void
}>();

const dailyManagements = computed(() => {
    if (!data.value) return [];
    return data.value?.data?.dailyManagements.map((management) => {
        return {
            position: management,
            member: 0,
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
    council: [{
        position: '',
        name: '',
        image: {
            name: '',
            content: '',
            size: '',
            type: '',
            lastModified: '',
        },
    }, {
        position: '',
        name: '',
        image: {
            name: '',
            content: '',
            size: '',
            type: '',
            lastModified: '',
        },
    }],
    advisor: {
        position: '',
        name: '',
        image: {
            name: '',
            content: '',
            size: '',
            type: '',
            lastModified: '',
        },
    },
    considerationBoard: [0, 0],
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


const files = ref<File[]>([]);
const filesToCropped = ref<{ blob: string, name: string }[]>([{ blob: '', name: '' }, { blob: '', name: '' }, { blob: '', name: '' }]);
const loadingCompress = ref<boolean>(false);
const openModals = ref<boolean[]>([false, false, false]);

const onChangeImages = async (f: File, i: number) => {
    loadingCompress.value = true;
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        alwaysKeepResolution: true
    }
    const compressedFile = await imageCompression(f, options);
    const blob = URL.createObjectURL(compressedFile);
    openModals.value[i] = true;
    if (filesToCropped.value[i]) {
        filesToCropped.value[i].blob = blob;
        filesToCropped.value[i].name = f.name;
    } else {
        filesToCropped.value.push({ blob: blob, name: f.name });
    }
    loadingCompress.value = false;
}

const onCropped = async (f: File, i: number) => {
    try {
        openModals.value[i] = false;
        if (files.value[i]) {
            files.value[i] = f;
        } else {
            files.value.push(f);
        }
        const blob = URL.createObjectURL(f);
        filesToCropped.value[i].blob = blob;
    } catch (error) {
        console.log(error);
        toast.add({ title: "Failed to compress image" });
    }
}
const addOrganizer = async () => {
    const body: IOrganizer = {
        ...organizer.value,
        council: await Promise.all(organizer.value.council.map(async (council, i) => {
            return {
                ...council,
                image: {
                    name: files.value[i].name,
                    content: await convert(files.value[i]),
                    size: files.value[i].size.toString(),
                    type: files.value[i].type,
                    lastModified: files.value[i].lastModified.toString(),
                }
            }
        })),
        advisor: {
            ...organizer.value.advisor,
            image: {
                name: files.value[organizer.value.council.length].name,
                content: await convert(files.value[organizer.value.council.length]),
                size: files.value[organizer.value.council.length].size.toString(),
                type: files.value[organizer.value.council.length].type,
                lastModified: files.value[organizer.value.council.length].lastModified.toString(),
            }
        }
    }
    const added = await $api<IOrganizerResponse>('/api/organizer', {
        method: 'POST',
        body,
    });
    toast.add({
        title: 'Organizer added',
        description: added.statusMessage,
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
    return memberData.value?.data?.members.find((member) => member.NIM == NIM)?.fullName;
}

watch(() => organizer.value.period.start, (newVal) => {

    organizer.value.period.end = new Date(newVal.getFullYear() + 1, newVal.getMonth(), newVal.getDate());
});

</script>
<template>
    <UModal :fullscreen="true">
        <UCard :ui="{ background: 'bg-gray-100 dark:bg-gray-900' }">
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
            <div class="my-4">
                <label for="council"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Council</label>
                <div class="grid grid-cols-12 gap-2" id="council">
                    <div class="grid grid-cols-12 col-span-6 gap-2" v-for="(council, i) in organizer.council" :key="i">
                        <div class="col-span-12">
                            <label for="Name"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                            <UInput type="text" name="Name" id="Name" placeholder="Insert name here..." required
                                v-model="organizer.council[i].name" class="w-full" />
                        </div>
                        <div class="col-span-12">
                            <label for="Position"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position</label>
                            <UInput type="text" name="Position" id="Position" placeholder="Rector, etc." required
                                v-model="organizer.council[i].position" class="w-full" />
                        </div>
                        <div class="col-span-12">
                            <label for="Image"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
                            <DropFile :identifier="i" @change="v => onChangeImages(v, i)" accept="image/*">
                                <div v-if="filesToCropped[i].blob">
                                    <NuxtImg :src="filesToCropped[i].blob" :alt="filesToCropped[i].name"
                                        class="mx-auto" />
                                </div>
                            </DropFile>
                            <ModalsCropImage v-model="openModals[i]" :img="filesToCropped[i].blob" :stencil="{
                                movable: true,
                                resizable: true,
                                aspectRatio: 1 / 1,
                            }" :title="filesToCropped[i].name" @cropped="v => onCropped(v, i)" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="my-4">
                <label for="advisor"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Advisor</label>
                <div class="grid grid-cols-12 gap-2" id="advisor">
                    <div class="col-span-12">
                        <label for="Name"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <UInput type="text" name="Name" id="Name" placeholder="Insert name here..." required
                            v-model="organizer.advisor.name" class="w-full" />
                    </div>
                    <div class="col-span-12">
                        <label for="Position"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position</label>
                        <UInput type="text" name="Position" id="Position" placeholder="Advisor, etc." required
                            v-model="organizer.advisor.position" class="w-full" />
                    </div>
                    <div class="col-span-12">
                        <label for="Image"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
                        <DropFile :identifier="organizer.council.length"
                            @change="v => onChangeImages(v, organizer.council.length)" accept="image/*">
                            <div v-if="filesToCropped[organizer.council.length].blob">
                                <NuxtImg :src="filesToCropped[organizer.council.length].blob"
                                    :alt="filesToCropped[organizer.council.length].name" class="mx-auto" />
                            </div>
                        </DropFile>
                        <ModalsCropImage v-model="openModals[organizer.council.length]"
                            :img="filesToCropped[organizer.council.length].blob" :stencil="{
                                movable: true,
                                resizable: true,
                                aspectRatio: 1 / 1,
                            }" :title="filesToCropped[organizer.council.length].name"
                            @cropped="v => onCropped(v, organizer.council.length)" />
                    </div>
                </div>
            </div>
            <div class="my-4">
                <label for="ConsiderationBoard"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Consideration
                    Board</label>
                <div class="grid grid-cols-12 gap-2">
                    <div class="col-span-6" v-for="(consideration, i) in organizer.considerationBoard" :key="i">
                        <UInput type="text" name="ConsiderationBoard" id="ConsiderationBoard" placeholder="21060202001"
                            required v-model="organizer.considerationBoard[i]" class="w-full" />
                        <label :for="`${organizer.considerationBoard[i]}-member`"
                            class="block mt-1 text-sm font-medium text-gray-900 dark:text-white">{{
                                getNameFromNIM(organizer.considerationBoard[i] as number)
                            }}</label>
                    </div>
                </div>
            </div>
            <UTabs :items="items">
                <template #dailyManager="{ item }">
                    <UCard>
                        <div class="grid grid-cols-12 gap-2" v-for="(member, i) in organizer.dailyManagement" :key="i">
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
                                    v-model="organizer.dailyManagement[i].member" class="w-full" />
                                <label :for="`${organizer.dailyManagement[i].member}-member`"
                                    class="block mt-1 text-sm font-medium text-gray-900 dark:text-white">{{
                                        getNameFromNIM(organizer.dailyManagement[i].member as number)
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
                                        <label :for="`${organizer.department[index].coordinator}-member`"
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
                                                <label :for="`${organizer.department[index].members[i]}-member`"
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
</template>, IMemberResponse
