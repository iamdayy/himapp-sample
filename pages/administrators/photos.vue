<script setup lang="ts">
import { ModalsAddPhoto, ModalsConfirmation } from '#components';
import type { IPhoto } from '~/types';
import type { IPhotoResponse, IResponse } from '~/types/IResponse';
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth',
});
useHead({
    title: 'Photos',
});

const { $api } = useNuxtApp();

const { width } = useWindowSize();
const modal = useModal();
const toast = useToast();

const isMobile = computed(() => width.value < 768);
const isTablet = computed(() => width.value >= 768 && width.value < 1024);

const responsiveUISizes = computed(() => ({
    input: isMobile.value ? 'sm' : 'md',
    button: isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg',
    select: isMobile.value ? 'sm' : 'md',
}));

const { isOrganizer } = useOrganizer();

const { data, error, pending, refresh } = useLazyAsyncData('photos', () => $api<IPhotoResponse>('/api/photo'));


// Tambahkan fungsi untuk mengelompokkan foto
const groupedPhotos = computed(() => {

    if (!data.value) return [];
    return data.value.data?.reduce<IPhoto[][]>((result, item, index) => {
        const chunkIndex = Math.floor(index / 3);
        if (!result[chunkIndex]) {
            result[chunkIndex] = []; // Type is inferred as IPhoto[]
        }
        result[chunkIndex].push(item);
        return result;
    }, []);
});

const addPhoto = () => {
    modal.open(ModalsAddPhoto, {
        onTriggerRefresh: () => {
            refresh()
        }
    });
}
const deletePhoto = (id: string) => {
    modal.open(ModalsConfirmation, {
        title: 'Delete Photo',
        body: 'Are you sure you want to delete this photo?',
        onConfirm: () => {
            $api<IResponse>(`/api/photo`, {
                method: 'delete',
                query: {
                    id
                }
            }).then((response) => {
                refresh();
                modal.close();
                toast.add({
                    title: "Success",
                    description: response.statusMessage,
                    color: 'green',
                });
            }).catch((error) => {
                toast.add({
                    title: "Error",
                    description: error.data.statusMessage,
                    color: 'red',
                });
            });
        }
    });
}
</script>
<template>
    <div class="flex flex-col items-center justify-center mb-24">
        <div class="mx-auto text-center">
            <h2 class="text-2xl font-extrabold leading-tight tracking-tight text-gray-600 md:text-4xl dark:text-white">
                Photos
            </h2>
        </div>
        <UCard class="w-full px-4 mt-6 md:px-8">
            <template #header>
                <div class="flex flex-col justify-between w-full md:flex-row">
                    <UButton label="New" :size="responsiveUISizes.button" :ui="{ rounded: 'rounded-full' }"
                        v-if="isOrganizer" @click="addPhoto" />
                </div>
            </template>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-4" v-if="pending">
                <div v-for="i in 4" :key="i" class="grid gap-4">
                    <div v-for="j in 2" :key="j" :style="{ height: `${Math.floor((Math.random() + 1) * 400)}px` }">
                        <USkeleton class="min-w-full min-h-full rounded-lg" />
                    </div>
                </div>
            </div>
            <div v-else-if="!data" class="flex items-center justify-center">
                <UButton label="Refresh" @click="refresh" color="blue" variant="ghost" size="lg">
                    <template #trailing>
                        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8" />
                    </template>
                </UButton>
            </div>
            <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div v-for="(group, groupIndex) in groupedPhotos" :key="groupIndex" class="grid gap-4">
                    <div v-for="photo in group" :key="photo.title" class="relative group w-96">
                        <NuxtImg class="object-cover w-full h-full rounded-lg" :src="photo.image" :alt="photo.title" />
                        <div
                            class="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-0 duration-500 bg-black opacity-0 group-hover:h-full group-hover:opacity-70">
                            <UButton icon="i-heroicons-trash" size="xl" variant="ghost" color="red"
                                @click="deletePhoto(photo._id as string)" />
                        </div>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>