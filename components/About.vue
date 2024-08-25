<script setup lang='ts'>
import { useWindowSize } from '@vueuse/core';
import type { IAdministrator, IDepartement, IPeriod, IProfile } from '~/types';

/**
 * Fetches the list of administrators from the API
 */
const { data: administrators } = await useAsyncData(() => $fetch<IAdministrator[]>("/api/administrator"));

/**
 * Fetches the list of departments from the API
 */
const { data: departementsData } = await useAsyncData(() => $fetch<IDepartement[]>("/api/departement"));

/**
 * Reactive reference to the current administrator
 */
const administrator = ref<IAdministrator | undefined>();

/**
 * Reactive reference to the list of departments
 */
const departements = ref<IDepartement[] | undefined>();

/**
 * Reactive reference to the current department period
 */
const departementPeriod = ref<IPeriod | undefined>();

/**
 * Defines the tab items for the About Us section
 */
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

/**
 * Use VueUse's useWindowSize composable for responsive design
 */
const { width } = useWindowSize();

/**
 * Compute if the screen is mobile
 */
const isMobile = computed(() => width.value < 768);

/**
 * Compute responsive class names
 */
const responsiveClasses = computed(() => ({
    headerText: isMobile.value ? 'text-2xl' : 'text-4xl',
    contentText: isMobile.value ? 'text-base' : 'text-lg',
    gridCols: isMobile.value ? 'grid-cols-1' : 'grid-cols-2',
}));

/**
 * Lifecycle hook that runs after the component is mounted
 */
onMounted(async () => {
    // Find the current administrator based on the current year
    if (administrators.value) {
        administrator.value = administrators.value?.find((admin) => {
            const currentYear = new Date().getFullYear();
            const startYear = new Date(admin.period.start).getFullYear();
            const endYear = new Date(admin.period.end).getFullYear();
            return startYear <= currentYear && endYear >= currentYear;
        });
    }

    // Filter departments based on the current year
    if (departementsData.value) {
        departements.value = departementsData.value?.filter((departement) => {
            const currentYear = new Date().getFullYear();
            const startYear = new Date(departement.period.start).getFullYear();
            const endYear = new Date(departement.period.end).getFullYear();
            return startYear <= currentYear && endYear >= currentYear;
        });
    }

    // Set the department period if departments are available
    if (departements.value && departements.value.length > 0) {
        departementPeriod.value = departements.value[0].period;
    }
})
</script>
<template>
    <UCard>
        <template #header>
            <h2 :class="['font-extrabold dark:text-200', responsiveClasses.headerText]">About Us</h2>
        </template>
        <div class="flex flex-col-reverse items-center gap-2 px-3 py-8 lg:flex-row">
            <div class="lg:w-1/2 dark:text-white md:px-2" data-aos="fade-right" data-aos-easing="ease-in-out"
                data-aos-duration="1000" data-aos-anchor=".about">
                <p :class="responsiveClasses.contentText">Himpunan Mahasiswa Informatika atau yang sering disebut
                    HIMATIKA
                    merupakan suatu organisasi yang
                    menghimpun
                    Mahasiswa Informatika untuk mengembangkan, dan mempraktekkan ilmu nya dalam bidang komputer.</p>
                <br />
                <p :class="responsiveClasses.contentText">
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
                            <p :class="['mb-4 font-bold text-center dark:text-gray-400', responsiveClasses.headerText]">
                                {{ item.label }}
                            </p>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {{ item.description }}
                            </p>
                        </template>
                        <div v-if="item.key === 'visi'" class="max-w-4xl p-4 mx-auto rounded-lg">
                            <p :class="['text-center text-gray-800 dark:text-gray-400', responsiveClasses.contentText]">
                                Dengan Semangat
                                kekeluargaan, HIMATIKA
                                menjadi
                                poros aktivitas kemahasiswaan Mahasiswa Informatika yang memberikan Kemanfaatan bagi
                                mahasiswa
                                Teknologi Komputer</p>
                        </div>
                        <div v-if="item.key === 'misi'" class="max-w-4xl p-4 mx-auto rounded-lg">
                            <ul
                                :class="['space-y-3 text-gray-800 list-disc list-inside text-start dark:text-gray-400', responsiveClasses.contentText]">
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
                            <h1 :class="['mb-4 font-bold text-center text-gray-400', responsiveClasses.contentText]"
                                v-if="administrator"><span>{{
                                    new Date(administrator?.period.start!).getFullYear() }}</span> - <span>{{ new
                                        Date(administrator?.period.end!).getFullYear() }}</span> </h1>
                            <div :class="['max-w-4xl py-8 mx-auto justify-items-center', responsiveClasses.gridCols]"
                                v-if="administrator">
                                <ProfileCard v-for="member, i in administrator.AdministratorMembers" class="mb-8"
                                    :profile="member.profile as IProfile" :subtitle="member.role" />
                            </div>
                        </div>
                        <div v-if="item.key === 'departemen'" class="w-full p-4 rounded-lg">
                            <h1 :class="['mb-4 font-bold text-center text-gray-400', responsiveClasses.contentText]"
                                v-if="departements"><span>{{
                                    new
                                        Date(departementPeriod?.start!).getFullYear() }}</span> - <span>{{ new
                                        Date(departementPeriod?.end!).getFullYear() }}</span> </h1>
                            <div :class="['max-w-4xl py-8 mx-auto justify-items-center', responsiveClasses.gridCols]"
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
<style scoped></style>