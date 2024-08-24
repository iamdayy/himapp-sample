<script setup lang='ts'>
import type { IAdministrator, IDepartement, IPeriod, IProfile } from '~/types';

const { data: administrators } = await useAsyncData(() => $fetch<IAdministrator[]>("/api/administrator"));
const { data: departementsData } = await useAsyncData(() => $fetch<IDepartement[]>("/api/departement"));
const administrator = ref<IAdministrator | undefined>();
const departements = ref<IDepartement[] | undefined>();
const departementPeriod = ref<IPeriod | undefined>();

const tabItems = [
    {
        label: 'Visi',
        key: 'visi',
        description: ''
    },
    {
        label: 'Misi',
        key: 'misi',
        description: ''
    },
    {
        label: 'Pengurus Harian',
        key: 'ph',
        description: ''
    },
    {
        label: 'Departemen',
        key: 'departemen',
        description: ''
    },
];

onMounted(async () => {
    if (administrators.value) {
        administrator.value = administrators.value?.find((admin) => new Date(admin.period.start).getFullYear() <= new Date(Date.now()).getFullYear() && new Date(admin.period.end).getFullYear() >= new Date(Date.now()).getFullYear());
    }
    if (departementsData.value) {
        departements.value = departementsData.value?.filter((departement) => new Date(departement.period.start).getFullYear() <= new Date(Date.now()).getFullYear() && new Date(departement.period.end).getFullYear() >= new Date(Date.now()).getFullYear())
    }
    if (departements.value) {
        departementPeriod.value = departements?.value![0].period;
    }
})
</script>
<template>
    <UCard>
        <template #header>
            <h2 class="text-2xl font-extrabold md:text-4xl dark:text-200">About Us</h2>
        </template>
        <div class="flex flex-col-reverse items-center gap-2 px-3 py-8 lg:flex-row">
            <div class="lg:w-1/2 dark:text-white md:px-2" data-aos="fade-right" data-aos-easing="ease-in-out"
                data-aos-duration="1000" data-aos-anchor=".about">
                <p>Himpunan Mahasiswa Informatika atau yang sering disebut HIMATIKA merupakan suatu organisasi yang
                    menghimpun
                    Mahasiswa Informatika untuk mengembangkan, dan mempraktekkan ilmu nya dalam bidang komputer.</p>
                <br />
                <p>
                    HIMATIKA memiliki tujuan untuk mewujudkan mahasiswa Program Studi Informatika yang beriman dan
                    bertakwa,
                    mandiri dan jujur dalam bersikap, berwawasan global yang memiliki kompetensi strategis bagi
                    terbentuknya
                    mahasiswa yang berintelektualitas tinggi serta bertanggungjawab, mampu bekerja sama dan
                    mengembangkan diri
                    baik secara keilmuan maupun sosial.

                </p>
            </div>
            <div class="overflow-hidden shadow-md lg:w-1/2 rounded-tr-2xl rounded-bl-3xl" data-aos="fade-left"
                data-aos-easing="ease-in-out" data-aos-duration="800" data-aos-anchor=".about">
                <NuxtImg src="/img/fobar.jpg" loading="lazy"
                    class="transition duration-500 ease-out cursor-pointer hover:scale-125" />
            </div>
        </div>
        <div class="flex flex-col justify-center px-3 py-8">
            <UTabs :items="tabItems" class="w-full">
                <template #item="{ item }">
                    <UCard>
                        <template #header>
                            <p class="mb-4 text-2xl font-bold text-center md:text-3xl dark:text-gray-400">
                                {{ item.label }}
                            </p>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {{ item.description }}
                            </p>
                        </template>
                        <div v-if="item.key === 'visi'" class="max-w-4xl p-4 mx-auto rounded-lg">
                            <p class="text-2xl text-center text-gray-800 dark:text-gray-400">Dengan Semangat
                                kekeluargaan, HIMATIKA
                                menjadi
                                poros aktivitas kemahasiswaan Mahasiswa Informatika yang memberikan Kemanfaatan bagi
                                mahasiswa
                                Teknologi Komputer</p>
                        </div>
                        <div v-if="item.key === 'misi'" class="max-w-4xl p-4 mx-auto rounded-lg">
                            <ul
                                class="space-y-3 text-2xl text-gray-800 list-disc list-inside text-start dark:text-gray-400">
                                <li>Mewujudkan HIMATIKA yang bersahabat dan profesional.</li>
                                <li>Menjadikan sebuah wadah aspirasi mahasiswa Informatika.</li>
                                <li>Meningkatkan kualitas dibidang pendidikan,keilmuan teknologi dan keorganisasian.
                                </li>
                                <li>Menjalin hubungan kerjasama yang baik dengan pihak internal maupun eksternal
                                    HIMATIKA.</li>
                                <li>Mengadakan kegiatan-kegiatan yang dapat meningkatkan pengetahuan keilmuan dan
                                    pengalaman mahasiswa
                                    Informatika.</li>
                            </ul>
                        </div>
                        <div v-if="item.key === 'ph'" class="w-full p-4 rounded-lg">
                            <h1 class="mb-4 text-xl font-bold text-center text-gray-400" v-if="administrator"><span>{{
                                new Date(administrator?.period.start!).getFullYear() }}</span> - <span>{{ new
                                        Date(administrator?.period.end!).getFullYear() }}</span> </h1>
                            <div class="grid max-w-4xl grid-cols-1 py-8 mx-auto md:grid-cols-2 justify-items-center"
                                v-if="administrator">
                                <ProfileCard v-for="member, i in administrator.AdministratorMembers" class="mb-8"
                                    :profile="member.profile as IProfile" :subtitle="member.role" />
                            </div>
                        </div>
                        <div v-if="item.key === 'departemen'" class="w-full p-4 rounded-lg">
                            <h1 class="mb-4 text-xl font-bold text-center text-gray-400" v-if="departements"><span>{{
                                new
                                    Date(departementPeriod?.start!).getFullYear() }}</span> - <span>{{ new
                                        Date(departementPeriod?.end!).getFullYear() }}</span> </h1>
                            <div class="grid max-w-4xl grid-cols-2 py-8 mx-auto justify-items-center"
                                v-if="departements">
                                <ProfileCard v-for="member, i in departements" class="mb-8"
                                    :profile="member.profile as IProfile" :subtitle="member.departement" />
                            </div>
                        </div>
                    </UCard>
                </template>
            </UTabs>
        </div>
    </UCard>
</template>
<style scoped></style>, IDepartement, IPeriod, IProfile, IDepartement, IPeriod, IProfile