<script setup lang='ts'>
import { ModalsCropImage } from '#components';
import imageCompression from 'browser-image-compression';
import type { IPost } from '~/types';

const props = defineProps({
    data: { type: Object as PropType<IPost>, required: true }
})

const toast = useToast();
const modal = useModal();
const emit = defineEmits(["triggerRefresh"]);

const AddCategoryPopover = ref<boolean>(false);
const categoryTitle = ref<string>('');
const categoryDescription = ref<string>('');

const openModal = ref<Boolean>(false)
const file = ref<File>()
const fileToCropped = ref<{ blob: string, name: string }>({
    blob: "",
    name: ""
});
const post = ref<IPost>({
    title: props.data.title,
    mainImage: props.data.mainImage,
    categories: props.data.categories,
    body: props.data.body
});

const editPost = async () => {
    try {
        const body = new FormData();
        body.append('mainImage', file.value!);
        Object.entries(post.value).forEach(([key, value]) => {
            let v = value;
            if (typeof value == 'object') {
                v = JSON.stringify(value)
            }
            body.append(key, v as string);
        });
        const added = await $api("/api/post", {
            method: "PUT",
            body,
            query: {
                slug: props.data.slug
            }
        });
        toast.add({ title: added.statusMessage! });
        modal.close();
        emit("triggerRefresh");

    } catch (error) {
        toast.add({ title: "Failed to add new Posts" });
    }
};
const onCropped = async (f: File) => {
    const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    }
    const compressedFile = await imageCompression(f, options);
    file.value = compressedFile;
    const blob = URL.createObjectURL(compressedFile);
    fileToCropped.value.blob = blob;

}
const onChangeImage = (f: File) => {
    const blob = URL.createObjectURL(f);
    fileToCropped.value.name = f.name;
    fileToCropped.value.blob = blob;
    openModal.value = true;
}
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

const deleteCategory = (i: number) => {
    post.value.categories?.splice(i, 1);
}
</script>
<template>
    <UModal>
        <UCard>
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 class="text-xl font-semibold dark:text-gray-200">Edit Post</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div class="space-y-6 text-start">
                <div class="grid grid-cols-6 gap-6">
                    <div class="col-span-6 sm:col-span-3">
                        <label for="Title"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                        <UInput type="text" name="Title" id="Title" placeholder="Post 1" v-model="post.title"
                            required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
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
                                <UButton icon="i-heroicons-pencil-square" variant="outline" size="xs" />

                                <template #panel>
                                    <div class="px-3 py-2 space-y-3 min-w-48">
                                        <label for="Category"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                                        <UInput type="text" name="Category-title" id="Category-title"
                                            placeholder="Title" v-model="categoryTitle" required />
                                        <UInput type="text" name="Category-description" id="Category-description"
                                            placeholder="Description" v-model="categoryDescription" required />
                                        <UButton type="submit" class="my-2 font-semibold" variant="outline" block
                                            @click="addNewCategory" label="Add" tralling-icon="i-heroicons-check" />
                                    </div>
                                </template>
                            </UPopover>
                        </div>
                    </div>
                    <div class="col-span-6 min-h-36">
                        <label for="Title"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
                        <DropFile @change="onChangeImage" accept="image/*">
                            <NuxtImg :src="fileToCropped.blob || post.mainImage" />
                        </DropFile>
                        <ModalsCropImage v-model="openModal" :img="fileToCropped.blob" :stencil="{
                            movable: true,
                            resizable: true,
                            aspectRatio: 16 / 9,
                        }" :title="fileToCropped.name" @cropped="onCropped" />
                    </div>
                    <div class="col-span-6">
                        <label for="description"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                        <TipTapEditor id="description" v-model="post.body" />
                    </div>
                </div>
                <UButton @click.prevent="editPost" label="Save" icon="i-heroicons-clipboard" block trailing />
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>