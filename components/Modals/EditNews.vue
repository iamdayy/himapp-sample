<script setup lang='ts'>
import { ModalsCropImage } from '#components';
import imageCompression from 'browser-image-compression';
import type { INews } from '~/types';
import type { IReqNews } from '~/types/IRequestPost';
import type { ICategoriesResponse, IResponse, ITagsResponse } from '~/types/IResponse';

/**
 * Props definition
 */
const props = defineProps({
    data: { type: Object as PropType<INews>, required: true }
})

/**
 * Composables
 */
const toast = useToast();
const modal = useModal();
const { $api } = useNuxtApp();
const { convert } = useImageToBase64();

const { data } = useLazyAsyncData(() => $api<ICategoriesResponse>('/api/news/categories'));
const { data: tagsData } = useLazyAsyncData(() => $api<ITagsResponse>('/api/news/tags'));

/**
 * Emits
 */
const emit = defineEmits(["triggerRefresh"]);

/**
 * Reactive references
 */
const openModal = ref<Boolean>(false)
const file = ref<File>()
const fileToCropped = ref<{ blob: string, name: string }>({
    blob: "",
    name: ""
});

const tagsSelected = ref<{ id: number, label: string }[]>(props.data.tags?.map((tag, i) => ({
    id: i + 1,
    label: tag
})) || []);

/**
 * News data structure
 */
const news = ref<INews>({
    title: props.data.title,
    mainImage: props.data.mainImage,
    category: props.data.category,
    tags: props.data.tags,
    body: props.data.body
});

/**
 * Edit news
 */
const editNews = async () => {
    try {
        const body: IReqNews = {
            ...news.value,
            mainImage: typeof file.value === "object" ? {
                name: file.value!.name,
                content: await convert(file.value!),
                size: file.value!.size.toString(),
                type: file.value!.type,
                lastModified: file.value!.lastModified.toString()
            } : news.value.mainImage as string,
            tags: tagsSelected.value.map(tag => tag.label)
        }
        const added = await $api<IResponse>("/api/news", {
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
        console.log(error);
        toast.add({ title: "Failed to edit News" });
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


const category = computed({
    get: () => news.value.category,
    set: async (value) => {
        if (value.description) {
            return {
                title: value.title,
                description: value.description
            };
        }
        const newValue = {
            title: value.title,
            description: ""
        }
        news.value.category = newValue;
        data.value?.data?.categories.push(newValue);
    }
});
const tagsOptions = computed({
    get: () => {
        return tagsData.value?.data?.tags.map((tag, i) => ({
            id: i + 1,
            label: tag
        })) || [];
    },
    set: (value) => {
        tagsOptions.value = value;
    }
});
const tags = computed({
    get: () => tagsSelected.value || [],
    set: async (labels) => {
        const promises = labels.map(async (label) => {
            if (label.id) {
                return label
            }
            if (tagsOptions.value.find(tag => tag.label === label.label)) {
                return label;
            }

            // In a real app, you would make an API call to create the label
            const response = {
                id: tagsOptions.value.length + 1,
                label: label.label
            }
            tagsOptions.value.push(response);

            return response
        })
        tagsSelected.value = await Promise.all(promises);
    }
});

const categoryCanEdit = computed(() => {
    return news.value.category.description !== undefined && news.value.category.description !== "";
});

const changeCategoryDescription = (value: string) => {
    category.value.description = value;
    news.value.category.description = value;
}

/**
 * Delete category
 * @param {number} i - Index of category to delete
 */
const deleteTag = (i: number) => {
    news.value.tags?.splice(i, 1);
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
                    <h2 :class="['font-semibold dark:text-gray-200', responsiveClasses.title]">Edit News</h2>
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
                        <UInput type="text" name="Title" id="Title" placeholder="News 1" v-model="news.title"
                            :size="uiSize" required />
                    </div>
                    <!-- Categories input -->
                    <div :class="responsiveClasses.halfSpan">
                        <label for="select-categories"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Categories</label>
                        <USelectMenu v-model="category" :options="data?.data?.categories" searchable creatable
                            option-attribute="title" by="title">
                            <template #label>
                                <span v-if="news.category.title">
                                    {{ news.category.title }}
                                </span>
                                <span v-else>
                                    Select category
                                </span>
                            </template>
                        </USelectMenu>
                        <div class="px-6 py-2">
                            <span v-if="categoryCanEdit">{{ news.category.description }}</span>
                            <UInput type="text" v-else @change="changeCategoryDescription"
                                placeholder="Category description" />
                        </div>
                    </div>

                    <!-- Tags input -->
                    <div :class="responsiveClasses.halfSpan">
                        <label for="select-tags"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tags</label>
                        <div class="flex flex-wrap items-center gap-2">
                            <USelectMenu v-model="tags" :options="tagsOptions" multiple searchable creatable by="id">
                                <template #label>
                                    <span v-if="news.tags">
                                        {{ tagsSelected.length }} Tags
                                    </span>
                                    <span v-else>
                                        Select tags
                                    </span>
                                </template>
                                <!-- <template #option-create="{ option }">
                                    <div class="flex items-center gap-2">
                                        <span class="block truncate">{{ option.title }}</span>
                                        <UInput type="text" v-model="option.description" autofocus />
                                    </div>
                                </template> -->
                            </USelectMenu>
                            <UBadge size="xs" variant="soft" v-for="tag, i in tagsSelected" :key="i">
                                {{ tag.label }}
                                <UButton @click="deleteTag(i)" icon="i-heroicons-x-mark" size="xs"
                                    class="text-red-500 dark:text-red-600 hover:text-red-400 dark:hover:text-red-400"
                                    variant="link" />
                            </UBadge>
                        </div>
                    </div>
                    <!-- Image upload -->
                    <div :class="[responsiveClasses.fullSpan, 'min-h-36']">
                        <label for="Title"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
                        <DropFile @change="onChangeImage" accept="image/*">
                            <NuxtImg :provider="!fileToCropped.blob ? 'localProvider' : ''"
                                :src="fileToCropped.blob || news.mainImage as string" />
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
                        <TipTapEditor id="description" v-model="news.body" />
                    </div>
                </div>
                <!-- Submit button -->
                <UButton @click.prevent="editNews" label="Save" icon="i-heroicons-clipboard" block trailing
                    :size="uiSize" />
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>