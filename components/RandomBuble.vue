<script lang='ts' setup>
import { computed, onMounted, ref } from 'vue';
import type { IPhoto } from '~/types';

type IPhotoExtended = IPhoto & {
    size: number;
    x: number;
    y: number;
};

const photosList = ref();
const props = defineProps<{
    photos: IPhoto[];
}>();

const { width: containerWidth, height: containerHeight } = useElementBounding(photosList);

const photos = computed(() => {
    const placedPhotos: IPhotoExtended[] = [];
    const minDistance = 100; // Jarak minimum antar foto
    const maxAttempts = 50;
    const padding = 20; // Padding dari tepi kontainer
    const rightPadding = 100;

    const isInCenterZone = (x: number, y: number, size: number): boolean => {
        const centerX = containerWidth.value / 2;
        const centerY = containerHeight.value / 2;
        const centerZoneWidth = 448;
        const centerZoneHeight = 200;

        return (
            x + size > centerX - centerZoneWidth / 2 &&
            x < centerX + centerZoneWidth / 2 &&
            y + size > centerY - centerZoneHeight / 2 &&
            y < centerY + centerZoneHeight / 2
        );
    };

    const generatePosition = (size: number): { x: number; y: number } => {
        const side = Math.floor(Math.random() * 4);
        const centerX = containerWidth.value / 2;
        const centerY = containerHeight.value / 2;
        const centerZoneWidth = 448;
        const centerZoneHeight = 200;

        switch (side) {
            case 0: // Atas
                return {
                    x: padding + Math.random() * (containerWidth.value - 2 * padding - rightPadding),
                    y: padding + Math.random() * (centerY - centerZoneHeight / 2 - padding - size)
                };
            case 1: // Kanan
                return {
                    x: centerX + centerZoneWidth / 2 + Math.random() * (containerWidth.value - centerX - centerZoneWidth / 2 - padding - rightPadding - size),
                    y: padding + Math.random() * (containerHeight.value - 2 * padding)
                };
            case 2: // Bawah
                return {
                    x: padding + Math.random() * (containerWidth.value - 2 * padding - rightPadding),
                    y: centerY + centerZoneHeight / 2 + Math.random() * (containerHeight.value - centerY - centerZoneHeight / 2 - padding - size)
                };
            case 3: // Kiri
                return {
                    x: padding + Math.random() * (centerX - centerZoneWidth / 2 - padding - size),
                    y: padding + Math.random() * (containerHeight.value - 2 * padding)
                };
            default:
                return { x: 0, y: 0 };
        }
    };

    const getValidPosition = (size: number): { x: number; y: number } => {
        let position = { x: 0, y: 0 };
        for (let i = 0; i < maxAttempts; i++) {
            position = generatePosition(size);
            if (!isInCenterZone(position.x, position.y, size)) break;
        }

        return position;
    };

    const findValidPosition = (size: number): { x: number; y: number } => {
        for (let i = 0; i < maxAttempts; i++) {
            const position = getValidPosition(size);

            const isTooClose = placedPhotos.some(placedPhoto => {
                const distance = Math.sqrt(
                    Math.pow(position.x - placedPhoto.x, 2) + Math.pow(position.y - placedPhoto.y, 2)
                );
                return distance < minDistance;
            });

            if (!isTooClose) return position;
        }

        // Fallback jika tidak menemukan posisi valid
        return getValidPosition(size);
    };

    return props.photos.map((photo) => {
        const size = Math.floor(Math.random() * 10) + 100;
        const { x, y } = findValidPosition(size);

        const newPhoto = { ...photo, size, x, y };
        placedPhotos.push(newPhoto);
        return newPhoto;
    });
});

const shufflePhotos = () => {
    for (let i = props.photos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [photos.value[i], photos.value[j]] = [photos.value[j], photos.value[i]];
    }
};

const photoSelected = ref<IPhotoExtended | null>(photos.value[0]);

const selectPhoto = (photo: IPhotoExtended) => {
    photoSelected.value = photo;
};

/**
 * Compute a random cubic-bezier timing function
 * @returns {string} A cubic-bezier function with random parameters
 */
const randomCubicBezier = computed(() => {
    const R1 = ((Math.random() * 0.699) + 0.300).toFixed(3);
    const R2 = ((Math.random() * 0.199) + 0.100).toFixed(3);
    const R3 = ((Math.random() * 0.100) + 0.200).toFixed(3);
    const R4 = ((Math.random() * 0.100) + 0.300).toFixed(3);
    return `cubic-bezier(${R1}, ${R2}, ${R3},${R4})`
});

/**
 * Compute a random translation for the floating animation
 * @returns {string} A CSS transform function with random X and Y translations
 */
const randomWalk = computed(() => {
    const x = Math.floor(Math.random() * -25) + 'px';
    const y = Math.floor(Math.random() * -35) + 'px';
    return `translateY(${x}) translateX(${y})`
});

onMounted(() => {
    shufflePhotos();
});
</script>

<template>
    <div class="relative h-[512px] md:h-[230px] w-full md:w-1/2" ref="photosList">
        <div v-for="photo, i in photos" :key="i"
            class="absolute flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ease-in-out rounded-full shadow-lg cursor-pointer group hover:z-50 hover:scale-110 max-w-24 max-h-24"
            :style="{
                width: photo.size + 'px',
                height: photo.size + 'px',
                left: photo.x + 'px',
                top: photo.y + 'px',
            }" @click="selectPhoto(photo)">
            <NuxtImg provider="localProvider" :src="(photo.image as string)" :alt="photo.title" loading="lazy"
                class="object-cover w-full h-full transition-all duration-300 ease-in-out aspect-square filter hover:scale-110 blur-sm hover:blur-none hover:z-50" />
        </div>
        <div v-if="photoSelected"
            class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 min-w-2xl">
            <NuxtImg provider="localProvider" :src="(photoSelected.image as string)" alt="logo"
                class="object-cover max-w-md transition duration-500 ease-in-out border-2 border-white rounded-lg shadow-lg cursor-pointer max-h-72 hover:scale-125" />
        </div>
    </div>
</template>

<style scoped></style>