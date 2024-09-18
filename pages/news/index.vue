<template>
    <div class="min-h-screen px-4 py-8 md:px-12">
        <UCard class="py-8">
            <template #header>
                <h1 class="text-2xl font-bold text-gray-600 dark:text-white md:text-3xl">News</h1>
                <div class="flex flex-col items-center justify-between mt-4 mb-8 sm:flex-row">
                    <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Search news..."
                        class="mb-4 sm:mb-0 sm:w-64" />
                    <div class="flex flex-row gap-2">
                        <USelectMenu v-model="selectedTags" :options="tags" multiple placeholder="Filter by tags"
                            class="w-full sm:w-48" />
                        <USelectMenu v-model="selectedCategory" :options="categories" option-attribute="title"
                            by="title" placeholder="Filter by category" multiple class="w-full sm:w-48" />
                        <UButton color="primary" variant="ghost" icon="i-heroicons-arrow-path" @click="refresh">
                        </UButton>
                    </div>
                </div>
            </template>
            <!-- Search and Filter Section -->
            <div v-if="pending">
                <USkeleton v-for="i in 10" :key="i" class="h-48" />
            </div>
            <div v-else-if="(data?.data?.news as INews[])?.length > 0">
                <!-- Hero Section -->
                <UCard v-if="mainArticle" :ui="{ base: 'overflow-hidden mb-8' }">
                    <template #header>
                        <div class="relative h-[30rem]">
                            <img :src="(mainArticle.mainImage as string)" :alt="mainArticle.title"
                                class="absolute inset-0 object-cover w-full h-full" />
                            <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                            <div class="absolute bottom-0 left-0 w-full p-6 text-white">
                                <UBadge class="mb-2">{{ mainArticle.category.title }}</UBadge>
                                <h1 class="mb-2 text-3xl font-bold">{{ mainArticle.title }}</h1>
                                <div class="w-full text-gray-900 dark:text-gray-100 line-clamp-2">
                                    <TiptapShow :content="mainArticle?.body!" />
                                </div>
                                <UButton color="white" variant="solid" :to="`/news/${mainArticle.slug}`">Read More
                                </UButton>
                            </div>
                        </div>
                    </template>
                </UCard>

                <!-- News Grid -->
                <div class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
                    <UCard v-for="news in (data?.data?.news as INews[])" :key="news.slug"
                        :ui="{ base: 'overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1' }">
                        <template #header>
                            <div class="relative h-48">
                                <img :src="(news.mainImage as string)" :alt="news.title"
                                    class="absolute inset-0 object-cover w-full h-full" />
                                <UBadge class="absolute top-2 left-2">{{
                                    news.category.title }}</UBadge>
                            </div>
                        </template>
                        <div class="h-48 p-4">
                            <h2 class="mb-2 text-xl font-semibold">{{ news.title }}</h2>
                            <div class="text-gray-900 dark:text-gray-100 line-clamp-5">
                                <TiptapShow :content="news?.body!" />
                            </div>
                        </div>
                        <template #footer>
                            <div class="flex items-center justify-between text-sm text-gray-500">
                                <div>
                                    <h2>{{ calculateReadingTime(news.body) }} min read</h2>
                                    <h2> Published At {{ new Date(news.publishedAt as Date).toLocaleDateString('id-ID',
                                        {
                                            dateStyle: 'long'
                                        }) }}</h2>
                                </div>
                                <UButton color="primary" variant="ghost" :to="`/news/${news.slug}`">Read More
                                </UButton>
                            </div>
                        </template>
                    </UCard>
                </div>
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

<script setup lang="ts">
import type { INews } from "~/types";
import type { ICategoriesResponse, INewsResponse, ITagsResponse } from "~/types/IResponse";
definePageMeta({
    layout: 'client',
    auth: false,
});
useHead({
    title: 'News',
    meta: [
        { name: 'description', content: 'News' },
    ],
});


const { width } = useWindowSize()

const isMobile = computed(() => width.value < 768)

const searchQuery = ref('')
const selectedCategory = ref('')
const selectedTags = ref([]);
const { data: dataTags } = useAsyncData('tags', () => $fetch<ITagsResponse>('/api/news/tags'));
const tags = computed(() => {
    return (dataTags.value?.data?.tags)
})

const { data: dataCategories } = useAsyncData('categories', () => $fetch<ICategoriesResponse>('/api/news/categories'));
const categories = computed(() => {
    return (dataCategories.value?.data?.categories)
})

const page = ref(1);
const pageCount = ref(10);

const { data, refresh, pending } = useLazyAsyncData('news', () => $fetch<INewsResponse>('/api/news', {
    query: {
        category: JSON.stringify(selectedCategory.value),
        tags: JSON.stringify(selectedTags.value),
        search: searchQuery.value,
        page: page.value,
        perPage: pageCount.value
    }
}), {
    watch: [selectedCategory, selectedTags, searchQuery, page, pageCount],
    default: () => ({
        data: {
            news: [],
            length: 0
        }
    })
})

// Fungsi untuk menghapus tag HTML
const stripHtml = (html: string): string => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

// Fungsi untuk menghitung waktu baca
const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const text = stripHtml(content);
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

// Modifikasi computed property untuk mainArticle
const mainArticle = computed(() => {
    if (data.value?.data?.news) {
        return (data.value?.data?.news as INews[])[0]
    }
    return null
});


/**
 * Computed properties for pagination
 */
const pageTotal = computed(() => data.value.data?.length || 0)
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value || 0))
const pageCountOptions = computed(() => [10, 20, 50, 100, 200, pageTotal.value || 0]);


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