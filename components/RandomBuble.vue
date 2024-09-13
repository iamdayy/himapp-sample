<script lang='ts' setup>
import { onMounted, ref } from 'vue';
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
const photos = computed(() => props.photos.map((photo) => {
    const size = Math.floor(Math.random() * 50) + 100;
    const x = Math.floor(Math.random() * (containerWidth.value - size));
    const y = Math.floor(Math.random() * (containerHeight.value - size));
    return {
        ...photo,
        size,
        x,
        y
    }
}));
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

onMounted(() => {
    shufflePhotos();
});
</script>
<template>
    <div class="relative h-[512px] md:h-[230px] w-full md:w-1/2" ref="photosList">
        <div v-for="photo in photos" :key="photo.title"
            class="absolute flex flex-col items-center justify-center overflow-hidden transition-all duration-300 rounded-full cursor-pointer hover:scale-110"
            :style="{
                width: photo.size + 'px',
                height: photo.size + 'px',
                left: photo.x + 'px',
                top: photo.y + 'px'
            }" @click="selectPhoto(photo)">
            <NuxtImg provider="localStorage" :src="photo.image" alt="logo"
                class="object-cover transition-all duration-300 rounded-full filter blur-sm hover:blur-none" />
        </div>
        <div v-if="photoSelected"
            class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 min-w-2xl">
            <NuxtImg provider="localStorage" :src="photoSelected.image" alt="logo"
                class="transition duration-500 ease-out cursor-pointer min-w-3xl hover:scale-125" />
        </div>
    </div>
</template>
<style scoped></style>