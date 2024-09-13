<script setup lang='ts'>
import { ModalsCropImage } from '#components';
import imageCompression from 'browser-image-compression';
import type { IPost } from '~/types';
import type { IReqPost } from '~/types/IRequestPost';
import type { IResponse } from '~/types/IResponse';

/**
 * Props definition
 */
const props = defineProps({
    data: { type: Object as PropType<IPost>, required: true }
})

/**
 * Composables
 */
const toast = useToast();
const modal = useModal();
const { $api } = useNuxtApp();
const { convert } = useImageToBase64();

/**
 * Emits
 */
const emit = defineEmits(["triggerRefresh"]);

/**
 * Reactive references
 */
const AddCategoryPopover = ref<boolean>(false);
const categoryTitle = ref<string>('');
const categoryDescription = ref<string>('');
const openModal = ref<Boolean>(false)
const file = ref<File>()
const fileToCropped = ref<{ blob: string, name: string }>({
    blob: "",
    name: ""
});

/**
 * Post data structure
 */
const post = ref<IPost>({
    title: props.data.title,
    mainImage: props.data.mainImage,
    categories: props.data.categories,
    body: props.data.body
});

/**
 * Edit post
 */
const editPost = async () => {
    try {
        const body: IReqPost = {
            ...post.value,
            mainImage: {
                name: file.value!.name,
                content: await convert(file.value!),
                size: file.value!.size.toString(),
                type: file.value!.type,
                lastModified: file.value!.lastModified.toString()
            }
        }
        const added = await $api<IResponse>("/api/post", {
            method: "PUT",
            body,
            query: {
                slug: props.data.slug
            }
        });
        toast.add({ title: added.statusMessage });
        modal.close();
        emit("triggerRefresh");
    } catch (error) {
        toast.add({ title: "Failed to edit Post" });
    }
};

/**
 * Handle cropped image
 * @param {File} f - Cropped image file
 */
const onCropped = async (f: File) => {
    const blob = URL.createObjectURL(f);
    fileToCropped.value.blob = blob;
    file.value = f;
    openModal.value = false;
}

/**
 * Handle image change
 * @param {File} f - Selected image file
 */
const onChangeImage = async (f: File) => {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
    }
    const compressedFile = await imageCompression(f, options);
    const blob = URL.createObjectURL(compressedFile);
    fileToCropped.value.name = f.name;
    fileToCropped.value.blob = blob;
    openModal.value = true;
}

/**
 * Add new category
 */
const addNewCategory = () => {
    if (categoryTitle.value != "" && categoryDescription.value != '') {
        const value = {
            title: categoryTitle.value,
            description: categoryDescription.value
        };
        post.value.categories?.push(value);
        AddCategoryPopover.value = false;
        categoryTitle.value = "";
        categoryDescription.value = "";
    }
}

/**
 * Delete category
 * @param {number} i - Index of category to delete
 */
const deleteCategory = (i: number) => {
    post.value.categories?.splice(i, 1);
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
}))

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
                    <h2 :class="['font-semibold dark:text-gray-200', responsiveClasses.title]">Edit Post</h2>
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
                        <UInput type="text" name="Title" id="Title" placeholder="Post 1" v-model="post.title"
                            :size="uiSize" required />
                    </div>
                    <!-- Categories input -->
                    <div :class="responsiveClasses.halfSpan">
                        <label for="select-categorys"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Categories</label>
                        <div class="flex flex-wrap items-center gap-2">
                            <UBadge size="xs" variant="soft" v-for="category, i in post.categories" :key="i">
                                {{ category.title }}
                                <UButton @click="deleteCategory(i)" icon="i-heroicons-x-mark" size="xs"
                                    class="text-red-500 dark:text-red-600 hover:text-red-400 dark:hover:text-red-400"
                                    variant="link" />
                            </UBadge>

                            <UPopover overlay v-model:open="AddCategoryPopover"
                                :popper="{ placement: 'bottom', strategy: 'absolute', arrow: true }">
                                <UButton icon="i-heroicons-pencil-square" variant="outline" :size="uiSize" />

                                <template #panel>
                                    <div class="px-3 py-2 space-y-3 min-w-48">
                                        <label for="Category"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                                        <UInput type="text" name="Category-title" id="Category-title"
                                            placeholder="Title" v-model="categoryTitle" :size="uiSize" required />
                                        <UInput type="text" name="Category-description" id="Category-description"
                                            placeholder="Description" v-model="categoryDescription" :size="uiSize"
                                            required />
                                        <UButton type="submit" class="my-2 font-semibold" variant="outline" block
                                            @click="addNewCategory" label="Add" tralling-icon="i-heroicons-check"
                                            :size="uiSize" />
                                    </div>
                                </template>
                            </UPopover>
                        </div>
                    </div>
                    <!-- Image upload -->
                    <div :class="[responsiveClasses.fullSpan, 'min-h-36']">
                        <label for="Title"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
                        <DropFile @change="onChangeImage" accept="image/*">
                            <NuxtImg :provider="!fileToCropped.blob ? 'localProvider' : ''"
                                :src="fileToCropped.blob || post.mainImage as string" />
                        </DropFile>
                        <ModalsCropImage v-model="openModal" :img="fileToCropped.blob" :stencil="{
                            movable: true,
                            resizable: true,
                            aspectRatio: 16 / 9,
                        }" :title="fileToCropped.name" @cropped="onCropped" />
                    </div>
                    <!-- Description input -->
                    <div :class="responsiveClasses.fullSpan">
                        <label for="description"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <TipTapEditor id="description" v-model="post.body" />
                    </div>
                </div>
                <!-- Submit button -->
                <UButton @click.prevent="editPost" label="Save" icon="i-heroicons-clipboard" block trailing
                    :size="uiSize" />
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>