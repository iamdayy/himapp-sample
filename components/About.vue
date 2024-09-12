<script setup lang='ts'>
import { useWindowSize } from '@vueuse/core';
import type { IPhoto, IProfile } from '~/types';

const { organizers } = useOrganizer();


const { data: photos } = useAsyncData('photos', () => $fetch<IPhoto[]>('/api/photo'));

const randomPhotos = computed(() => {
    if (photos.value) {
        const shuffled = [...photos.value].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 12);
    }
    return [];
});


const organizer = computed(() => {
    if (organizers.value) {
        return organizers.value.find((organizer) => new Date(organizer.period.start).getFullYear() === Number(selectedPeriod.value.split(" - ")[0]) && new Date(organizer.period.end).getFullYear() === Number(selectedPeriod.value.split(" - ")[1]));
    }
    return null;
});

const periods = computed(() => {
    if (organizers.value) {
        return organizers.value?.map((organizer) => `${new Date(organizer.period.start).getFullYear()} - ${new Date(organizer.period.end).getFullYear()}`);
    }
    return [];
});
const selectedPeriod = ref(periods.value[0] || "");

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
        label: 'Organizer',
        key: 'organizer',
        description: ''
    },
];

const items = [
    {
        label: 'Daily Manager',
        slot: 'dailyManager',
        description: ''
    },
    {
        label: 'Departments',
        slot: 'departments',
        description: ''
    },
];

const departementsTabs = computed(() => {
    if (organizer.value) {
        return organizer.value?.department.map((department) => {
            return {
                slot: 'department',
                label: department.name,
            }
        })
    }
    return []
})
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
</script>
<template>
    <UCard>
        <template #header>
            <h2 :class="['font-extrabold dark:text-200', responsiveClasses.headerText]">About Us</h2>
        </template>
        <div class="flex flex-col-reverse items-center gap-2 px-3 py-8 lg:flex-row">
            <div class="md:w-1/2 dark:text-white md:px-2" data-aos="fade-right" data-aos-easing="ease-in-out"
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
            <RandomBuble v-if="photos" :photos="randomPhotos" data-aos="fade-left" data-aos-easing="ease-in-out"
                data-aos-duration="800" data-aos-anchor=".about" />
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
                        <div v-if="item.key === 'organizer'" class="w-full p-4 rounded-lg">
                            <h1 :class="['mb-4 font-bold text-center text-gray-400', responsiveClasses.contentText]"
                                v-if="organizer">
                                <USelect v-model="selectedPeriod" :options="periods" class="w-full mx-auto md:w-1/2" />
                            </h1>
                            <UTabs :items="items">
                                <template #dailyManager="{ item, index }">
                                    <div class="grid w-full grid-cols-1 gap-4 py-3 md:grid-cols-3">
                                        <ProfileCard v-for="dailyManager in organizer?.dailyManagement"
                                            :profile="(dailyManager.profile as IProfile)"
                                            :subtitle="dailyManager.position" />
                                    </div>
                                </template>
                                <template #departments="{ item }">
                                    <UTabs :items="departementsTabs">
                                        <template #department="{ item, index }">
                                            <ProfileCard v-if="organizer?.department[index].coordinator"
                                                :profile="(organizer?.department[index].coordinator as IProfile)"
                                                subtitle="Coordinator" class="mt-8" />
                                            <div class="grid w-full grid-cols-1 gap-4 py-3 mt-8 md:grid-cols-3">
                                                <ProfileCard v-for="member in organizer?.department[index].members"
                                                    :profile="(member as IProfile)" subtitle="Member" />
                                            </div>
                                        </template>
                                    </UTabs>
                                </template>
                            </UTabs>
                        </div>
                    </UCard>
                </template>
            </UTabs>
        </div>
    </UCard>
</template>
<style scoped></style>