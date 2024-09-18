<script setup lang='ts'>
import { ModalsAddNews, ModalsConfirmation, ModalsEditNews } from '#components';
import type { INews, IProfile } from '~/types';
import type { ICategoriesResponse, INewsResponse, ITagsResponse } from '~/types/IResponse';

/**
 * Page metadata configuration
 */
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});

/**
 * Set page title
 */
useHead({
    title: 'Newss'
});

const { $api } = useNuxtApp();
const modal = useModal();
const toast = useToast();
const { isOrganizer } = useOrganizer();

const { data: tagsData } = useLazyAsyncData(() => $api<ITagsResponse>('/api/news/tags'));
const { data: categoriesData } = useLazyAsyncData(() => $api<ICategoriesResponse>('/api/news/categories'));

const tags = ref(tagsData.value?.data?.tags || []);
const categories = ref(categoriesData.value?.data?.categories || []);

/**
 * Pagination and sorting state
 */
const sort = ref({ column: 'createdAt', direction: 'asc' as const });
const page = ref(1);
const pageCount = ref(10);
const searchQuery = ref('');
const selectedTags = ref([]);
const selectedCategory = ref([]);

/**
 * Fetch newss data
 */
const { data, refresh, pending } = useLazyAsyncData(() => $api<INewsResponse>('/api/news', {
    query: {
        page: page.value,
        perPage: pageCount.value,
        sort: sort.value,
        search: searchQuery.value,
        tags: JSON.stringify(selectedTags.value),
        category: JSON.stringify(selectedCategory.value)
    }
}), {
    default: () => ({
        data: {
            news: [],
            length: 0
        }
    }),
    watch: [page, pageCount, sort, searchQuery, selectedTags, selectedCategory]
});

/**
 * Computed properties for pagination
 */
const pageTotal = computed(() => data.value.data?.length || 0)
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value || 0))
const pageCountOptions = computed(() => [10, 20, 50, 100, 200, pageTotal.value || 0]);

/**
 * Publish a news
 * @param {string} slug - The slug of the news to publish
 */
const publishNews = async (slug: string) => {
    try {
        const published = await $api('/api/news/publish', {
            query: { slug }
        });
        toast.add({ title: published.statusMessage! });
        refresh();
    } catch (error) {
        toast.add({ title: 'Failed To Publish News' });
    }
}

/**
 * Open modal to add a new news
 */
const AddModal = () => {
    modal.open(ModalsAddNews, {
        fullscreen: true,
        onTriggerRefresh() {
            refresh()
        }
    })
}

/**
 * Open modal to edit an existing news
 * @param {INews} news - The news to edit
 */
const EditModal = (news: INews) => {
    modal.open(ModalsEditNews, {
        fullscreen: true,
        onTriggerRefresh() {
            refresh()
        },
        data: news
    })
}

/**
 * Open confirmation modal to delete a news
 * @param {string} slug - The slug of the news to delete
 */
const DeleteModal = (slug: string) => {
    modal.open(ModalsConfirmation, {
        async onConfirm() {
            try {
                const deleted = await $api('/api/news', {
                    method: 'DELETE',
                    query: { slug }
                });
                toast.add({ title: deleted.statusMessage! });
                refresh();
                modal.close();
            } catch (error) {
                toast.add({ title: 'Failed To delete News' });
            }
        },
        title: 'News delete Confirmation',
        body: 'Are you sure to delete this news ?'
    })
}

/**
 * Open confirmation modal to publish a news
 * @param {string} slug - The slug of the news to publish
 */
const PublishModal = (slug: string) => {
    modal.open(ModalsConfirmation, {
        async onConfirm() {
            try {
                await publishNews(slug);
                modal.close();
            } catch (error) {
                toast.add({ title: 'Failed to publish News' });
            }
        },
        title: 'News Publish Confirmation',
        body: 'Are you sure you want to publish this news?'
    })
}


/**
 * Generate dropdown items for each news
 * @param {INews} news - The news to generate items for
 * @returns {Array} Array of dropdown items
 */
const items = (news: INews): Array<any> => [[
    {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: () => DeleteModal(news.slug!),
        disabled: !isOrganizer.value
    },
    {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square',
        click: () => EditModal(news),
        disabled: !isOrganizer.value
    },
    {
        label: 'Publish',
        icon: 'i-ion-arrow-up-right-box-outline',
        click: () => PublishModal(news.slug!),
        disabled: !isOrganizer.value
    }
]]

/**
 * Responsive design
 */
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 640);

/**
 * Responsive UI sizes for components
 */
const responsiveUISizes = computed(() => ({
    button: isMobile.value ? 'sm' : 'md',
    input: isMobile.value ? 'sm' : 'lg',
}))

/**
 * Computed property for responsive class names
 */
const responsiveClasses = computed(() => ({
    container: isMobile.value ? 'px-2' : 'px-6',
    title: isMobile.value ? 'text-2xl' : 'text-4xl',
    button: isMobile.value ? 'text-sm' : 'text-base',
    pagination: isMobile.value ? 'flex-col items-start' : 'flex-row items-center',
}))
</script>
<template>
    <div class="items-center justify-center mb-24">
        <UCard class="px-8 mt-6">
            <template #header>
                <div class="flex justify-between">
                    <h1 class="text-2xl font-bold text-gray-600 dark:text-white">News</h1>
                    <UButton label="New" :size="responsiveUISizes.button" :ui="{ rounded: 'rounded-full' }"
                        @click="AddModal" v-if="isOrganizer" />
                </div>
                <div class="flex flex-col items-center justify-between mt-4 mb-8 sm:flex-row">
                    <UInput v-model="searchQuery" :size="responsiveUISizes.input" icon="i-heroicons-magnifying-glass"
                        placeholder="Search news..." class="mb-4 sm:mb-0 sm:w-64" />
                    <div class="flex flex-row gap-2">
                        <USelectMenu v-model="selectedTags" :options="tags" multiple placeholder="Filter by tags"
                            class="w-full sm:w-48" />
                        <USelectMenu v-model="selectedCategory" :options="categories" option-attribute="title"
                            by="title" placeholder="Filter by category" multiple class="w-full sm:w-48" />
                        <UButton :size="responsiveUISizes.button" color="primary" variant="ghost"
                            icon="i-heroicons-arrow-path" @click="refresh">
                        </UButton>
                    </div>
                </div>
            </template>
            <div v-if="pending">
                <USkeleton v-for="i in 10" :key="i" class="h-48" />
            </div>
            <div v-else-if="(data.data?.news as INews[])?.length > 0" class="flex flex-wrap gap-3">
                <UCard class="min-h-32" :ui="{ base: 'max-w-sm' }" v-for="news, i in (data.data?.news as INews[])"
                    :key="i">
                    <template #header>
                        <NuxtImg provider="localProvider" :src="news.mainImage as string"
                            class="w-full mx-auto rounded-lg" />
                    </template>
                    <div class="space-y-2">
                        <NuxtLink :to="`/news/${news.slug}`">
                            <h2 class="text-xl font-semibold sm:text-3xl">{{
                                news.title
                            }}</h2>
                        </NuxtLink>
                    </div>
                    <template #footer>
                        <UCard class="min-w-full min-h-8" :ui="{ body: { padding: 'p-1 sm:p-1 px-3 sm:px-3' } }">
                            <div class="flex flex-row justify-between">
                                <div>
                                    <div class="flex flex-row items-center gap-2">
                                        <UAvatar :src="(news.author as IProfile)?.avatar" size="xs" />
                                        <h2>
                                            {{ (news.author as IProfile).fullName }}
                                        </h2>
                                    </div>
                                    <div v-if="news.published" class="text-sm font-light ms-3">
                                        Published At
                                        <span>
                                            {{ new Date(news.publishedAt!).toLocaleDateString('id-Id', {
                                                dateStyle: "long"
                                            }) }}
                                        </span>
                                    </div>
                                    <span class="text-sm text-red-500 ms-3" v-else>
                                        Not published
                                    </span>
                                </div>
                                <UDropdown :items="items(news)"
                                    :popper="{ arrow: true, strategy: 'absolute', placement: 'bottom-start' }">
                                    <UButton icon="i-ion-ellipsis-vertical" variant="link" color="gray" />
                                </UDropdown>
                            </div>
                        </UCard>
                    </template>
                </UCard>
            </div>
            <div v-else class="flex items-center justify-center">
                <div class="flex flex-col items-center justify-center gap-4">
                    <UIcon name="i-heroicons-circle-stack" class="w-12 h-12 text-gray-400" />
                    <h1 class="text-2xl font-semibold text-gray-600 dark:text-gray-400">No news found</h1>
                </div>
            </div>
            <template #footer>
                <div :class="['flex flex-wrap justify-between', responsiveClasses.pagination]">
                    <div class="flex items-center gap-1.5 mb-2 sm:mb-0">
                        <span class="text-sm leading-5">Rows per page:</span>
                        <USelect v-model="pageCount" :options="pageCountOptions" class="w-20 me-2" size="xs" />
                    </div>
                    <div class="mb-2 sm:mb-0">
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
                        <UPagination v-model="page" :page-count="pageCount" :total="pageTotal"
                            :ui="{ wrapper: 'flex items-center gap-1', rounded: '!rounded-full min-w-[32px] justify-center', default: { activeButton: { variant: 'outline' } } }" />
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>
<style scoped></style>ICategoriesResponse, , ITagsResponse