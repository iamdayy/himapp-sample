<script setup lang='ts'>
import { ModalsCropImage } from "#components";
import imageCompression from "browser-image-compression";
import type { IProfile } from "~/types";

// Define page metadata
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});

// Set page title
useHead({
    title: "My Profile"
});

const config = useRuntimeConfig();

// Fetch user data and refresh function
const { data: user, refresh } = useAuth();

// Fetch administrators data
const { organizers } = useOrganizer();

// Get stats
const { all, allCanMeRegister } = useStats();
const { $api } = useNuxtApp();
const modal = useModal();
const editMode = ref(false);
const file = ref<File | null>(null);

// Use window size to determine if the device is mobile
const windowSize = useWindowSize();
const isMobile = computed(() => windowSize.width.value < 640);

/**
 * Handle file change event for avatar upload
 * @param {Event} $event - The file input change event
 */
const onFileChange = async ($event: Event) => {
    const target = $event.target as HTMLInputElement;
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    }
    if (target && target.files) {
        file.value = target.files[0];
        const body = new FormData();
        const blob = URL.createObjectURL(file.value);
        modal.open(ModalsCropImage, {
            img: blob,
            title: file.value.name,
            async onCropped(file) {
                const compressedFile = await imageCompression(file, options);
                body.append('avatar', compressedFile);
                await $api("/api/profile/avatar", {
                    method: "put",
                    query: {
                        NIM: user.value.profile.NIM
                    },
                    body,
                });
                refresh();
            }
        });
    }
}

/**
 * Generate and download the activeness letter
 */
const getActivinessLetter = () => {
    const organizer = organizers?.find((org) => new Date(org.period.start).getFullYear() <= new Date(Date.now()).getFullYear() && new Date(org.period.end).getFullYear() >= new Date(Date.now()).getFullYear() + 1);

    const pdfMake = usePDFMake();
    pdfMake.fonts = {
        Times: {
            normal: config.public.public_uri + 'fonts/times-new-roman.ttf',
            italics: config.public.public_uri + 'fonts/times-new-roman-italic.ttf',
            bold: config.public.public_uri + 'fonts/times-new-roman-bold.ttf',
            bolditalics: config.public.public_uri + 'fonts/times-new-roman-bold-italic.ttf'
        }
    }
    pdfMake.createPdf({
        content: [
            {
                alignment: "center",
                columns: [
                    {
                        image: "himaLogo",
                        width: 60
                    },
                    {
                        width: '*',
                        stack: [
                            {
                                text: 'HIMPUNAN MAHASISWA INFORMATIKA',
                                color: 'green',
                                fontSize: 14,
                                bold: true
                            },
                            {
                                text: 'INSTITUT TEKNOLOGI DAN SAINS NAHDLATUL ULAMA PEKALONGAN',
                                color: 'green',
                                bold: true,
                            },
                            {
                                text: 'Sekretariat : Gedung ITS NU Jl. Karangdowo No. 9 Kedungwuni Pekalongan 51173',
                                italics: true,
                                fontSize: 11
                            },
                            {
                                text: 'email : him.tekom123@gmail.com',
                                italics: true,
                                fontSize: 11
                            },
                        ]
                    },
                    {
                        image: "itsnuLogo",
                        width: 60
                    },
                ]
            },
            { canvas: [{ type: 'line', lineColor: 'black', x1: 0, y1: 5, x2: 595 - 2 * 20, y2: 5, lineWidth: 1 }] },
            { canvas: [{ type: 'line', lineColor: 'black', x1: 0, y1: 3, x2: 595 - 2 * 20, y2: 3, lineWidth: 2 }] },
            {
                alignment: 'center',
                margin: [0, 30, 0, 10],
                stack: [
                    {
                        bold: true,
                        fontSize: 14,
                        text: 'Surat Keterangan Aktif'
                    },
                    {
                        text: 'Himpunan Mahasiswa Informatika',
                        fontSize: 14,
                        bold: true,
                        lineHeight: 1.2,
                        decoration: 'underline'
                    },
                    {
                        text: `019/II.3.AI/BO1.01/02.A-1/S.Ket/IV/${new Date(Date.now()).getFullYear()}`,
                    }
                ]
            },
            {
                margin: [40, 10],
                stack: [
                    {
                        text: 'Yang bertanda tangan di bawah ini : ',
                        margin: [0, 10],
                    },
                    {
                        margin: [0, 2],
                        columns: [
                            {
                                text: 'Nama',
                                width: 90
                            },
                            {
                                text: ':',
                                width: 5
                            },
                            {
                                text: (organizer?.dailyManagement.find((dm) => dm.position.includes('Ketua') || dm.position.includes('Chairman'))?.profile as IProfile).fullName
                            },
                        ],
                    },
                    {
                        margin: [0, 2],
                        columns: [
                            {
                                text: 'NIM',
                                width: 90
                            },
                            {
                                text: ':',
                                width: 5
                            },
                            {
                                text: (organizer?.dailyManagement.find((dm) => dm.position.includes('Ketua') || dm.position.includes('Chairman'))?.profile as IProfile).NIM
                            },
                        ],
                    },
                    {
                        margin: [0, 2],
                        columns: [
                            {
                                text: 'Jabatan',
                                width: 90
                            },
                            {
                                text: ':',
                                width: 5
                            },
                            {
                                text: 'Ketua Umum'
                            },
                        ],
                    },
                    {
                        margin: [0, 10],
                        text: 'Menyatakan dengan sesungguhnya bahwa :'
                    },
                    {
                        margin: [0, 2],
                        columns: [
                            {
                                text: 'Nama',
                                width: 90
                            },
                            {
                                text: ':',
                                width: 5
                            },
                            {
                                text: user.value.profile.fullName
                            },
                        ],
                    },
                    {
                        margin: [0, 2],
                        columns: [
                            {
                                text: 'NIM',
                                width: 90
                            },
                            {
                                text: ':',
                                width: 5
                            },
                            {
                                text: user.value.profile.NIM
                            },
                        ],
                    },
                    {
                        margin: [0, 2],
                        columns: [
                            {
                                text: 'Kelas',
                                width: 90
                            },
                            {
                                text: ':',
                                width: 5
                            },
                            {
                                text: user.value.profile.class
                            },
                        ],
                    },
                    {
                        margin: [0, 10],
                        text: `Adalah mahasiswa yang benar - benar aktif dalam Himpunan Mahasiswa Informatika (HIMATIKA) ITSNU Pekalongan periode ${new Date(organizer?.period.start!).getFullYear()}/${new Date(organizer?.period.end!).getFullYear()}.`
                    },
                    {
                        text: 'Demikian surat keterangan keaktifan mahasiswa ini dibuat sebagaimana mestinya.'
                    },
                    {
                        margin: [0, 20],
                        alignment: 'right',
                        text: [
                            {
                                text: 'Pekalongan, '
                            },
                            {
                                text: new Date(Date.now()).toLocaleDateString('id-ID', { dateStyle: 'long' }),
                            }
                        ]
                    },
                    {
                        margin: [0, 30],
                        alignment: 'center',
                        bold: true,
                        stack: [
                            'HIMPUNAN MAHASISWA INFORMATIKA',
                            'INSTITUT TEKNOLOGI DAN SAINS NAHDLATUL ULAMA',
                            'PEKALONGAN'
                        ]
                    },
                    {
                        margin: [0, 30, 0, 30],
                        alignment: 'center',
                        bold: true,
                        text: 'Mengetahui'
                    },
                    {
                        alignment: 'center',
                        bold: true,
                        columns: [
                            {
                                stack: [
                                    {
                                        text: 'Ketua Umum',
                                    },
                                    {
                                        margin: [0, 80, 0, 0],
                                        stack: [
                                            {
                                                text: (organizer?.dailyManagement.find((dm) => dm.position.includes('Ketua') || dm.position.includes('Chairman'))?.profile as IProfile).fullName,
                                                decoration: 'underline'
                                            },
                                            {
                                                text: (organizer?.dailyManagement.find((dm) => dm.position.includes('Ketua') || dm.position.includes('Chairman'))?.profile as IProfile).NIM,
                                                bold: false
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                stack: [
                                    {
                                        text: 'Sekretaris Umum',
                                    },
                                    {
                                        margin: [0, 80, 0, 0],
                                        stack: [
                                            {
                                                text: (organizer?.dailyManagement.find((dm) => dm.position.includes('Sekretaris') || dm.position.includes('Secretary'))?.profile as IProfile).fullName,
                                                decoration: 'underline'
                                            },
                                            {
                                                text: (organizer?.dailyManagement.find((dm) => dm.position.includes('Sekretaris') || dm.position.includes('Secretary'))?.profile as IProfile).NIM,
                                                bold: false
                                            }
                                        ]
                                    }
                                ]
                            },
                        ]
                    }
                ]
            }
        ],
        images: {
            himaLogo: config.public.public_uri + "img/logo.png",
            itsnuLogo: config.public.public_uri + "img/itsnu-logo.png",
        },
        pageMargins: [20, 25],
        pageSize: 'A4',
        defaultStyle: {
            fontSize: 12,
            font: "Times"
        }
    }).download(`${user.value.profile.fullName}-Surat-Keatifan`);
}

// Compute if the user has access to download the activeness letter
const accessGetActivinessLetter = computed(() => ((all.value / allCanMeRegister.value) * 100) > 40);
</script>
<template>
    <div class="items-center justify-center px-4 pb-24 mt-4 md:mt-8 sm:px-6">
        <UCard>
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 class="text-2xl font-semibold sm:text-4xl dark:text-gray-200">My Profile</h2>
                    <UButton icon="i-heroicons-pencil-square" :padded="false" :size="isMobile ? 'sm' : 'xl'"
                        variant="link" color="green" @click="editMode = !editMode" />
                </div>
            </template>
            <div class="flex flex-col-reverse w-full gap-3 pt-12 lg:flex-row">
                <div class="flex flex-col w-full gap-3 pt-12 md:w-2/3 md:flex-row">
                    <div class="w-full p-4 pt-12 sm:p-8 md:w-1/2">
                        <h2
                            class="mb-8 text-2xl font-semibold leading-tight tracking-tight text-gray-800 sm:mb-12 sm:text-4xl dark:text-gray-200">
                            Details
                        </h2>
                        <dl class="max-w-md text-gray-900 dark:text-white">
                            <!-- User details -->
                            <div class="flex flex-col pb-3">
                                <dt class="mb-1 text-sm text-gray-500 sm:text-base dark:text-gray-400">Full Name</dt>
                                <dd class="text-base font-semibold sm:text-lg">{{ user.profile.fullName }}</dd>
                            </div>
                            <div class="flex flex-col py-3">
                                <dt class="mb-1 text-sm text-gray-500 sm:text-base dark:text-gray-400">Birth</dt>
                                <div class="flex flex-wrap" v-if="editMode">
                                    <UInput type="text" name="birth" id="birth" placeholder="Jakarta"
                                        v-model="user.profile.birth.place" required
                                        :class="isMobile ? 'w-full mb-2' : 'w-1/2 mb-0 mr-2'" />
                                    <VDatePicker id="date" v-model="user.profile.birth.date" mode="date">
                                        <template #default="{ togglePopover }">
                                            <button @click="togglePopover" :class="isMobile ? 'w-full mb-2' : 'w-auto'">
                                                <Icon name="solar:calendar-date-outline"
                                                    class="w-6 h-6 mx-2 text-gray-400 hover:text-blue-600" />
                                            </button>
                                        </template>
                                    </VDatePicker>
                                    <label :class="isMobile ? 'w-full text-center' : 'w-auto text-left'"
                                        class="block my-auto text-sm font-medium text-gray-900 dark:text-white">
                                        {{ new Date(user.profile.birth.date).toLocaleDateString('id-ID', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        }) }}
                                    </label>
                                </div>
                                <dd v-else class="text-base font-semibold sm:text-lg">{{ `${user.profile.birth.place},
                                    ${new
                                        Date(user.profile.birth.date).toLocaleDateString('id-ID', {
                                            year: 'numeric', month:
                                                'long', day: 'numeric'
                                        })}` }}</dd>
                            </div>
                            <div class="flex flex-col py-3">
                                <dt class="mb-1 text-sm text-gray-500 sm:text-base dark:text-gray-400">Sex</dt>
                                <UInput v-model="user.profile.sex" v-if="editMode" />
                                <dd v-else class="text-base font-semibold sm:text-lg">{{ user.profile.sex }}</dd>
                            </div>
                            <div class="flex flex-col py-3">
                                <dt class="mb-1 text-sm text-gray-500 sm:text-base dark:text-gray-400">Religion</dt>
                                <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Religion</dt>
                                <UInput v-model="user.profile.religion" v-if="editMode" />
                                <dd v-else class="text-lg font-semibold">{{ user.profile.religion }}</dd>
                            </div>
                            <div class="flex flex-col py-3">
                                <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">citizen</dt>
                                <UInput v-model="user.profile.citizen" v-if="editMode" />
                                <dd v-else class="text-lg font-semibold">{{ user.profile.citizen }}</dd>
                            </div>
                            <div class="flex flex-col pt-3">
                                <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Phone number</dt>
                                <UInput v-model="user.profile.phone" v-if="editMode" />
                                <dd v-else class="text-lg font-semibold">{{ user.profile.phone }}</dd>
                            </div>
                        </dl>
                    </div>
                    <div class="w-full p-4 pt-12 sm:p-8 md:w-1/2">
                        <h2
                            class="mb-12 text-4xl font-semibold leading-tight tracking-tight text-gray-800 dark:text-gray-200">
                            Organization
                        </h2>
                        <dl class="max-w-md text-gray-900 dark:text-white">
                            <!-- Organization details -->
                            <div class="flex flex-col pb-6">
                                <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Position</dt>
                                <dd class="text-lg font-semibold">
                                    {{ user.profile.organizer.role || 'Member' }}
                                </dd>
                                <dd class="text-sm font-light text-gray-500 dark:text-gray-400">
                                    {{ `${new Date(user.profile.organizer.period.start).getFullYear()} - ${new
                                        Date(user.profile.organizer.period.end).getFullYear()}` }}
                                </dd>
                            </div>
                            <div class="flex flex-col pb-6">
                                <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Agendas</dt>
                                <dd class="text-lg font-semibold">{{ user.profile.agendas.length }}</dd>
                            </div>
                            <div class="flex flex-col pt-3">
                                <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Projects</dt>
                                <dd class="text-lg font-semibold">{{ user.profile.projects.length }}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
                <div class="w-full pt-12 md:w-1/3">
                    <UCard class="mx-2 md:mx-8">
                        <!-- User avatar and profile summary -->
                        <div class="relative w-56 h-56 mx-auto -mt-32 overflow-hidden rounded-full group">
                            <NuxtImg :src="user.profile.avatar || '/img/profile-blank.png'" width="224" height="224"
                                class="object-cover rounded-full max-w-56 aspect-square" />
                            <div
                                class="absolute top-0 left-0 flex items-center justify-center w-full h-0 gap-2 duration-500 bg-orange-400 rounded-full opacity-0 bg-opacity-95 group-hover:h-full group-hover:opacity-100">
                                <label for="inputAvatar" class="cursor-pointer">
                                    <Icon name="solar:upload-minimalistic-outline"
                                        class="w-8 h-8 text-white hover:text-gray-300" />
                                    <input id="inputAvatar" type="file" class="hidden" @change="onFileChange" />
                                </label>
                                <button>
                                    <Icon name="solar:eye-outline" class="w-8 h-8 text-white hover:text-gray-300" />
                                </button>
                            </div>
                        </div>
                        <div class="mx-auto mt-8 text-center">
                            <h2
                                class="text-4xl font-bold leading-tight tracking-tight text-gray-600 dark:text-gray-200">
                                {{ user.username }}
                            </h2>
                            <dl class="w-full text-gray-900 dark:text-white">
                                <!-- User profile summary -->
                                <div class="flex flex-col pb-6">
                                    <dd class="text-lg font-semibold">{{ user.profile.email }}</dd>
                                </div>
                                <div class="flex flex-col py-3">
                                    <dt class="text-sm text-gray-500 dark:text-gray-400">NIM</dt>
                                    <dd class="text-lg font-semibold">{{ user.profile.NIM }}
                                    </dd>
                                </div>
                                <div class="flex flex-col py-3">
                                    <dt class="text-sm text-gray-500 dark:text-gray-400">Class</dt>
                                    <dd class="text-lg font-semibold">{{ user.profile.class }}</dd>
                                </div>
                                <div class="flex flex-col py-3">
                                    <dt class="text-sm text-gray-500 dark:text-gray-400">Semester</dt>
                                    <dd class="text-lg font-semibold">{{ user.profile.semester }}</dd>
                                </div>
                                <div class="flex flex-col py-3">
                                    <dt class="text-sm text-gray-500 dark:text-gray-400">Entered Year</dt>
                                    <dd class="text-lg font-semibold">{{ user.profile.enteredYear }}</dd>
                                </div>
                                <div class="flex flex-col pt-3">
                                    <UButton block label="Download Activiness Letter" class="mb-1"
                                        :disabled="!accessGetActivinessLetter" @click="getActivinessLetter" />
                                    <dd v-if="!accessGetActivinessLetter" class="text-sm text-red-500">
                                        You must contribute to the organization at least 40% / being a board member,
                                        your
                                        contribution is still {{ Math.round((all / allCanMeRegister) * 100) }}%.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </UCard>
                </div>
            </div>
        </UCard>
    </div>
</template>
<style scoped></style>