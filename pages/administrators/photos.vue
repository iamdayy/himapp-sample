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

const page = ref(1);
const perPage = ref(9);

const { data, error, pending, refresh } = useLazyAsyncData('photos', () => $api<IPhotoResponse>('/api/photo',
    { query: { page: page.value, perPage: perPage.value } }),
    {
        watch: [page, perPage],
        default: () => ({ data: { photos: [], length: 0 } })
    });

const perPageOptions = computed(() => {
    const totalPhotos = data.value?.data?.length || 0;
    const maxOptions = 3;
    const baseOption = Math.max(3, Math.ceil(totalPhotos / 9)); // Minimum of 3 photos per page

    return Array.from({ length: maxOptions }, (_, index) => baseOption * (index + 1) * 3)
        .filter(option => option <= totalPhotos);
});
const pageTotal = computed(() => data.value.data?.length) // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * perPage.value + 1)
const pageTo = computed(() => Math.min(page.value * perPage.value, pageTotal.value || 0))

// Tambahkan fungsi untuk mengelompokkan foto
const groupedPhotos = computed(() => {

    if (!data.value) return [];
    return data.value.data?.photos.reduce<IPhoto[][]>((result, item, index) => {
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
                <div class="flex flex-row justify-between w-full">
                    <UButton label="New Photo" :ui="{ rounded: 'rounded-3xl' }" v-if="isOrganizer" @click="addPhoto"
                        :size="responsiveUISizes.button" />
                    <UButton label="Refresh" @click="refresh" color="blue" variant="ghost"
                        :size="responsiveUISizes.button">
                        <template #trailing>
                            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 md:w-8 md:h-8" />
                        </template>
                    </UButton>
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
                        <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 md:w-8 md:h-8" />
                    </template>
                </UButton>
            </div>
            <div v-else :class="`grid grid-cols-1 gap-4 md:grid-cols-${perPage / 3}`">
                <div v-for="(group, groupIndex) in groupedPhotos" :key="groupIndex" class="grid gap-4">
                    <div v-for="photo in group" :key="photo.title" class="relative w-full group">
                        <NuxtImg provider="localProvider" class="object-cover w-full h-full rounded-lg"
                            :src="photo.image as string" :alt="photo.title" />
                        <div
                            class="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-0 duration-500 bg-black opacity-0 group-hover:h-full group-hover:opacity-70">
                            <UButton icon="i-heroicons-trash" size="xl" variant="ghost" color="red"
                                @click="deletePhoto(photo._id as string)" />
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex flex-wrap items-center justify-between gap-1.5">
                    <div class="flex items-center gap-1.5">
                        <span class="text-sm leading-5">Rows per page:</span>
                        <USelect v-model="perPage" :options="perPageOptions" class="w-20 me-2" size="xs" />
                    </div>
                    <div>
                        <span class="text-sm leading-5">
                            Showing
                            <span class="font-medium">{{ pageFrom }}</span>
                            to
                            <span class="font-medium">{{ pageTo }}</span>
                            of
                            <span class="font-medium">{{ pageTotal }}</span>
                            results
                        </span>
                    </div>
                    <div class="flex items-center gap-3">
                        <UPagination v-model="page" :page-count="perPage" :total="data.data?.length"
                            :ui="{ wrapper: 'flex items-center gap-1', rounded: '!rounded-full min-w-[32px] justify-center', default: { activeButton: { variant: 'outline' } } }" />
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>