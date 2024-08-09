<script setup lang='ts'>
import type { IAdministrator, IProfile } from '~/types';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});
useHead({
    title: "My Profile"
});

const config = useRuntimeConfig();

const { data: user, refresh } = useAuth();

const { data: administrators } = await useAsyncData(() => $fetch<IAdministrator[]>("/api/administrator"));

const { all, allCanMeRegister } = useStats()

const editMode = ref(false);
const file = ref<File | null>(null);

const onFileChange = async ($event: Event) => {
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
        file.value = target.files[0];
        const body = new FormData()
        body.append('avatar', target.files[0])
        const uplaoded = await $api("/api/profile/avatar", {
            method: "put",
            query: {
                NIM: user.value.profile.NIM
            },
            body
        });
        refresh()
    }
}

const getActivinessLetter = () => {
    const administrator = administrators.value?.find((admin) => new Date(admin.period.start).getFullYear() <= new Date(Date.now()).getFullYear() && new Date(admin.period.end).getFullYear() >= new Date(Date.now()).getFullYear());

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
                                text: (administrator?.AdministratorMembers.find((adm) => adm.role == 'Chairman')?.profile as IProfile).fullName
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
                                text: (administrator?.AdministratorMembers.find((adm) => adm.role == 'Chairman')?.profile as IProfile).NIM
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
                        text: `Adalah mahasiswa yang benar - benar aktif dalam Himpunan Mahasiswa Informatika (HIMATIKA) ITSNU Pekalongan periode ${new Date(administrator?.period.start!).getFullYear()}/${new Date(administrator?.period.end!).getFullYear()}.`
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
                                                text: (administrator?.AdministratorMembers.find((adm) => adm.role == 'Chairman')?.profile as IProfile).fullName,
                                                decoration: 'underline'
                                            },
                                            {
                                                text: (administrator?.AdministratorMembers.find((adm) => adm.role == 'Chairman')?.profile as IProfile).NIM,
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
                                                text: (administrator?.AdministratorMembers.find((adm) => adm.role == 'Secretary')?.profile as IProfile).fullName,
                                                decoration: 'underline'
                                            },
                                            {
                                                text: (administrator?.AdministratorMembers.find((adm) => adm.role == 'Secretary')?.profile as IProfile).NIM,
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

const accessGetActivinessLetter = computed(() => ((all.value / allCanMeRegister.value) * 100) > 40);
</script>
<template>
    <div class="items-center justify-center pb-24 px-6">
        <UCard>
            <template #header>
                <div class="flex w-full justify-between">
                    <h2 class="text-4xl font-semibold dark:text-gray-200">My Profile</h2>
                    <UButton icon="i-heroicons-pencil-square" :padded="false" size="xl" variant="link" color="green"
                        @click="editMode = !editMode" />
                </div>
            </template>
            <div class="w-full flex gap-3 pt-12 flex-col-reverse md:flex-row">
                <div class="md:w-1/3 w-full p-8 pt-12">
                    <h2
                        class="text-4xl font-semibold leading-tight tracking-tight text-gray-800 dark:text-gray-200 mb-12">
                        Details
                    </h2>
                    <dl class="max-w-md text-gray-900 dark:text-white">
                        <div class="flex flex-col pb-3">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Full Name</dt>
                            <dd class="text-lg font-semibold">{{ user.profile.fullName }}</dd>
                        </div>
                        <div class="flex flex-col py-3">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Birth</dt>
                            <div class="flex" v-if="editMode">
                                <UInput type="text" name="birth" id="birth" placeholder="Jakarta"
                                    v-model="user.profile.birth.place" required />
                                <VDatePicker id="date" v-model="user.profile.birth.date" mode="date">
                                    <template #default="{ togglePopover }">
                                        <button @click="togglePopover">
                                            <Icon name="solar:calendar-date-outline"
                                                class="w-6 h-6 mx-2 text-gray-400 hover:text-blue-600" />
                                        </button>
                                    </template>
                                </VDatePicker>
                                <label class="block my-auto text-sm font-medium text-gray-900 dark:text-white">
                                    {{ new Date(user.profile.birth.date).toLocaleDateString('id-ID', {
                                        year: 'numeric', month:
                                            'long', day: 'numeric'
                                    }) }}
                                </label>
                            </div>
                            <dd v-else class="text-lg font-semibold">{{ `${user.profile.birth.place}, ${new
                                Date(user.profile.birth.date).toLocaleDateString('id-ID', {
                                    year: 'numeric', month:
                                        'long', day: 'numeric'
                                })}` }}</dd>
                        </div>
                        <div class="flex flex-col py-3">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Sex</dt>
                            <UInput v-model="user.profile.sex" v-if="editMode" />
                            <dd v-else class="text-lg font-semibold">{{ user.profile.sex }}</dd>
                        </div>
                        <div class="flex flex-col py-3">
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
                <div class="md:w-1/3 w-full p-8 pt-12">
                    <h2
                        class="text-4xl font-semibold leading-tight tracking-tight text-gray-800 dark:text-gray-200 mb-12">
                        Organization
                    </h2>
                    <dl class="max-w-md text-gray-900 dark:text-white">
                        <div class="flex flex-col pb-6">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">{{
                                `${user.profile.isAdministrator ? 'Daily Manager' : user.profile.isDepartement ?
                                    'Departement Manager' : 'Member'}` }}</dt>
                            <dd class="text-lg font-semibold">{{
                                `${user.profile.isAdministrator.role || user.profile.isDepartement.departement}` }}</dd>
                            <dd class="text-sm font-semibold text-gray-500 dark:text-gray-400">{{
                                `${new Date(user.profile.isAdministrator.period.start).getFullYear() || new
                                    Date(user.profile.isDepartement.period.start).getFullYear()} - ${new
                                        Date(user.profile.isAdministrator.period.end).getFullYear() || new
                                            Date(user.profile.isDepartement.period.end).getFullYear()}` }}</dd>
                        </div>
                        <div class="flex flex-col pb-6">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Events</dt>
                            <dd class="text-lg font-semibold">{{ user.profile.events.length }}</dd>
                        </div>
                        <div class="flex flex-col pt-3">
                            <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Projects</dt>
                            <dd class="text-lg font-semibold">{{ user.profile.projects.length }}</dd>
                        </div>
                    </dl>
                </div>
                <div class="md:w-1/3 w-full pt-12">
                    <UCard class="mx-8">
                        <div class="relative overflow-hidden rounded-full group w-56 h-56 -mt-32 mx-auto">
                            <NuxtImg :src="user.profile.avatar || '/img/profile-blank.png'" width="224" height="224"
                                class="max-w-56 absolute aspect-square object-cover mx-auto rounded-full" />
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
                        <div class="mx-auto text-center mt-8">
                            <h2
                                class="text-4xl font-bold leading-tight tracking-tight text-gray-600 dark:text-gray-200">
                                {{ user.username }}
                            </h2>
                            <dl class="w-full text-gray-900 dark:text-white">
                                <div class="flex flex-col pb-6">
                                    <dd class="text-lg font-semibold">{{ user.profile.email }}</dd>
                                </div>
                                <div class="flex flex-col py-3">
                                    <dt class="text-gray-500 text-sm dark:text-gray-400">NIM</dt>
                                    <dd class="text-lg font-semibold">{{ user.profile.NIM }}
                                    </dd>
                                </div>
                                <div class="flex flex-col py-3">
                                    <dt class="text-gray-500 text-sm dark:text-gray-400">Class</dt>
                                    <dd class="text-lg font-semibold">{{ user.profile.class }}</dd>
                                </div>
                                <div class="flex flex-col py-3">
                                    <dt class="text-gray-500 text-sm dark:text-gray-400">Semester</dt>
                                    <dd class="text-lg font-semibold">{{ user.profile.semester }}</dd>
                                </div>
                                <div class="flex flex-col py-3">
                                    <dt class="text-gray-500 text-sm dark:text-gray-400">Entered Year</dt>
                                    <dd class="text-lg font-semibold">{{ user.profile.enteredYear }}</dd>
                                </div>
                                <div class="flex flex-col pt-3">
                                    <UButton block label="Download Activiness Letter" class="mb-1"
                                        :disabled="!accessGetActivinessLetter" @click="getActivinessLetter" />
                                    <dd v-if="!accessGetActivinessLetter" class="text-sm text-red-500">{{
                                        `You must
                                        contribute to
                                        the organization at least 40% / being a board member, your contribution is still
                                        ${Math.round((all /
                                            allCanMeRegister) * 100)}%.` }}
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