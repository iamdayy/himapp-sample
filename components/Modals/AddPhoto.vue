<script setup lang='ts'>
import { ModalsCropImage } from '#components';
import imageCompression from 'browser-image-compression';
import type { IPhoto } from '~/types';
import type { IReqPhoto } from '~/types/IRequestPost';
import type { IResponse } from '~/types/IResponse';
/**
 * Composables
 */
const { $api } = useNuxtApp();
const toast = useToast();
const modal = useModal();
const { convert } = useImageToBase64();
/**
 * Emits
 */
const emit = defineEmits(["triggerRefresh"]);

/**
 * Reactive references
 */
const openModal = ref<Boolean>(false);
const loadingCompress = ref<Boolean>(false);
const file = ref<File>();
const fileToCropped = ref<{ blob: string, name: string }>({
    blob: "",
    name: ""
});

/**
 * Photo data structure
 */
const photo = ref<IPhoto>({
    title: "",
    image: "",
});

/**
 * Add new photo
 */
const addPhoto = async () => {
    try {
        const body: IReqPhoto = {
            image: {
                name: file.value!.name,
                content: await convert(file.value!),
                size: file.value!.size.toString(),
                type: file.value!.type,
                lastModified: file.value!.lastModified.toString()
            },
            title: photo.value.title
        }
        const added = await $api<IResponse>("/api/photo", {
            method: "POST",
            body
        });
        toast.add({ title: added.statusMessage });
        modal.close();
        emit("triggerRefresh");
    } catch (error) {
        console.log(error);
        toast.add({ title: "Failed to add new Photos" });
    }
};

/**
 * Handle cropped image
 * @param {File} f - Cropped image file
 */
const onCropped = async (f: File) => {
    try {
        openModal.value = false;
        file.value = f;
        const blob = URL.createObjectURL(f);
        fileToCropped.value.blob = blob;
    } catch (error) {
        console.log(error);
        toast.add({ title: "Failed to compress image" });
    }
}

/**
 * Handle image change
 * @param {File} f - Selected image file
 */
const onChangeImage = async (f: File) => {
    loadingCompress.value = true;
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        alwaysKeepResolution: true
    }
    const compressedFile = await imageCompression(f, options);
    const blob = URL.createObjectURL(compressedFile);

    fileToCropped.value.name = f.name;
    fileToCropped.value.blob = blob;
    openModal.value = true;
    loadingCompress.value = false;
}


/**
 * Responsive design
 */
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 640)
const isTablet = computed(() => width.value >= 640 && width.value < 1024)

/**
 * Responsive classes
 */
const responsiveClasses = computed(() => ({
    container: isMobile.value ? 'p-4' : 'p-6',
    grid: isMobile.value ? 'grid-cols-1 space-y-4' : 'grid-cols-6 space-y-8',
    fullSpan: isMobile.value ? 'col-span-1' : 'col-span-6',
    halfSpan: isMobile.value ? 'col-span-1' : 'col-span-3',
    title: isMobile.value ? 'text-lg' : 'text-xl',
    button: isMobile.value ? 'text-sm' : 'text-base',
}));
/**
 * Compute UI size
 */
const uiSize = computed(() => isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg')


</script>
<template>
    <UModal>
        <UCard :ui="{ background: 'bg-gray-200 dark:bg-gray-800' }">
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 :class="['font-semibold dark:text-gray-200', responsiveClasses.title]">New Photo</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div :class="['space-y-6 text-start', responsiveClasses.container]">
                <div :class="responsiveClasses.grid">
                    <!-- Title input -->
                    <div :class="responsiveClasses.halfSpan">
                        <label for="Title"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                        <UInput type="text" name="Title" id="Title" placeholder="Photo 1" :size="uiSize"
                            v-model="photo.title" required />
                    </div>
                    <!-- Image upload -->
                    <div :class="[responsiveClasses.fullSpan, 'min-h-36']">
                        <label for="Title"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
                        <DropFile @change="onChangeImage" accept="image/*">
                            <div v-if="file">
                                <NuxtImg :src="fileToCropped.blob" />
                            </div>
                        </DropFile>
                        <ModalsCropImage v-model="openModal" :img="fileToCropped.blob" :stencil="{
                            movable: true,
                            resizable: true
                        }" :title="fileToCropped.name" @cropped="onCropped" />
                    </div>
                </div>
                <!-- Submit button -->
                <UButton @click.prevent="addPhoto" :loading="loadingCompress" label="Save" icon="i-heroicons-clipboard"
                    block trailing :class="responsiveClasses.button" />
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>