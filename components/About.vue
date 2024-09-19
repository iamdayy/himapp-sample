<script setup lang='ts'>
import { useWindowSize } from '@vueuse/core';
import type { IMember } from '~/types';
import type { IPhotoResponse } from '~/types/IResponse';

const { organizers } = useOrganizer();


const { data } = useAsyncData('photos', () => $fetch<IPhotoResponse>('/api/photo'));

const randomPhotos = computed(() => {

    if (data.value) {
        const shuffled = [...(data.value.data?.photos || [])].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 12);
    }
    return [];
});


const organizer = computed(() => {
    if (organizers.value) {
        return organizers.value[0];
        // return organizers.value.find((organizer) => new Date(organizer.period.start).getFullYear() == Number(selectedPeriod.value.split(" - ")[0]) && new Date(organizer.period.end).getFullYear() == Number(selectedPeriod.value.split(" - ")[1]));
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
    subtitle: isMobile.value ? 'text-lg' : 'text-xl md:text-2xl',
    title: isMobile.value ? 'text-xl' : 'text-2xl md:text-4xl',
}));

// Compute responsive dimensions
const wrapperDimensions = computed(() => ({
    width: isMobile.value ? '220px' : '280px',
    height: isMobile.value ? '380px' : '480px'
}));

const cardDimensions = computed(() => ({
    height: isMobile.value ? '350px' : '450px'
}));

const imageDimensions = computed(() => ({
    width: isMobile.value ? '120px' : '160px',
    height: isMobile.value ? '120px' : '160px'
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
            <RandomBuble v-if="randomPhotos.length > 0" :photos="randomPhotos" data-aos="fade-left"
                data-aos-easing="ease-in-out" data-aos-duration="800" data-aos-anchor=".about" />
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
                            <h1 :class="['mb-4 font-bold text-center text-gray-400', responsiveClasses.contentText]">
                                <USelec v-model="selectedPeriod" :options="periods" class="w-full mx-auto md:w-1/2" />
                            </h1>
                            <div>
                                <h1
                                    class="my-4 text-xl font-bold leading-tight tracking-tight text-center text-gray-600 md:text-3xl dark:text-white">
                                    Council
                                </h1>
                                <div class="grid grid-cols-1 gap-4 py-3 md:grid-cols-2">
                                    <div class="mx-auto wrapper" :style="wrapperDimensions"
                                        v-for="council in organizer?.council">
                                        <div class="card" :style="{ height: cardDimensions.height }">
                                            <div class="front" :style="{ height: cardDimensions.height }">
                                                <h2
                                                    :class="['font-semibold text-gray-200', responsiveClasses.subtitle]">
                                                    {{
                                                        council.position }}</h2>
                                                <NuxtImg :src="(council.image as string)" :alt="council.name"
                                                    class="object-cover rounded-full aspect-square"
                                                    provider="localProvider" />
                                                <div class="absolute bottom-16">
                                                    <h1
                                                        :class="['mb-2 font-semibold text-white -translate-x-14', responsiveClasses.title]">
                                                        {{ council.name }}
                                                    </h1>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h1
                                    class="my-4 text-xl font-bold leading-tight tracking-tight text-center text-gray-600 md:text-3xl dark:text-white">
                                    Advisor
                                </h1>
                                <div class="mx-auto wrapper" :style="wrapperDimensions">
                                    <div class="card" :style="{ height: cardDimensions.height }">
                                        <div class="front" :style="{ height: cardDimensions.height }">
                                            <h2 :class="['font-semibold text-gray-200', responsiveClasses.subtitle]">{{
                                                organizer?.advisor.position }}</h2>
                                            <NuxtImg :src="(organizer?.advisor.image as string)"
                                                :alt="organizer?.advisor.name"
                                                class="object-cover rounded-full aspect-square"
                                                provider="localProvider" />
                                            <div class="absolute bottom-16">
                                                <h1
                                                    :class="['mb-2 font-semibold text-white -translate-x-14', responsiveClasses.title]">
                                                    {{ organizer?.advisor.name }}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h1
                                    class="my-4 text-xl font-bold leading-tight tracking-tight text-center text-gray-600 md:text-3xl dark:text-white">
                                    Consideration Board
                                </h1>
                                <div
                                    :class="`grid w-full grid-cols-1 gap-4 py-3 md:grid-cols-${organizer?.considerationBoard.length}`">
                                    <MemberCard v-for="considerationBoard in organizer?.considerationBoard"
                                        :member="(considerationBoard as IMember)" subtitle="Consideration Board" />
                                </div>
                            </div>
                            <UTabs :items="items">
                                <template #dailyManager="{ item, index }">
                                    <div class="grid w-full grid-cols-1 gap-4 py-3 md:grid-cols-3">
                                        <MemberCard v-for="dailyManager in organizer?.dailyManagement"
                                            :member="(dailyManager.member as IMember)"
                                            :subtitle="dailyManager.position" />
                                    </div>
                                </template>
                                <template #departments="{ item }">
                                    <UTabs :items="departementsTabs">
                                        <template #department="{ item, index }">
                                            <MemberCard v-if="organizer?.department[index].coordinator"
                                                :member="(organizer?.department[index].coordinator as IMember)"
                                                subtitle="Coordinator" class="mt-8" />
                                            <div class="grid w-full grid-cols-1 gap-4 py-3 mt-8 md:grid-cols-3">
                                                <MemberCard v-for="member in organizer?.department[index].members"
                                                    :member="(member as IMember)" subtitle="Member" />
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
<style scoped>
/* Wrapper for the entire component */
.wrapper {
    perspective: 800px;
    position: relative;
}

/* Main card container */
.card {
    width: 100%;
    position: relative;
    transform-style: preserve-3d;
    transform: translateZ(-140px);
    transition: transform 350ms cubic-bezier(0.390, 0.575, 0.565, 1.000);
    cursor: pointer;
}

/* Common styles for front and back of the card */
.card>div {
    position: absolute;
    width: 100%;
    padding: 34px 21px;
    transition: all 350ms cubic-bezier(0.390, 0.575, 0.565, 1.000);
}

/* Front face of the card */
.front {
    background-image: linear-gradient(180deg, rgb(255 138 76) 0%, rgba(92, 91, 94, 0) 95%);
    transform: rotateY(0deg) translateZ(160px);
    border-radius: 34px 8px 0;
}

/* Responsive styles */
@media (max-width: 768px) {
    .card>div {
        padding: 20px 15px;
    }

    .front,
    .right {
        border-radius: 20px 5px 0;
    }

}
</style>