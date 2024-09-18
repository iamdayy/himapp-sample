<script setup lang='ts'>
import type { INews, IProfile } from '~/types';
import type { INewsResponse } from '~/types/IResponse';

const { $api } = useNuxtApp();
definePageMeta({
    auth: false,
    layout: "client"
});
const route = useRoute();
const { data } = useAsyncData(() => $api<INewsResponse>('/api/news', {
    query: {
        slug: route.params.slug
    }
}));
const news = computed(() => data.value?.data?.news as INews);
watch(data, () => {
    useHead({
        title: (data.value?.data?.news as INews)?.title
    });
})
</script>
<template>
    <div class="p-2 py-16 text-gray-100 md:mx-auto md:p-5 dark:text-gray-800">
        <UCard v-if="data?.data?.news">
            <template #header>
                <div>
                    <h1 class="inline-block mb-2 text-3xl font-semibold text-gray-900 sm:text-5xl dark:text-gray-100">{{
                        news?.title }}</h1>
                    <div v-if="news?.publishedAt" class="mt-2">
                        <span v-if="news?.publishedAt" class="text-gray-500 dark:text-gray-400">
                            Published at {{ new Date(news?.publishedAt!).toLocaleDateString() }} by {{
                                (news?.author as IProfile).fullName }}
                        </span>
                        <span v-else class="text-gray-500 dark:text-gray-400">
                            Draft
                        </span>
                    </div>
                    <div v-if="news?.category" class="mt-2">
                        <span class="text-gray-500">Category : </span>
                        <UBadge>{{
                            news?.category?.title }}</UBadge>
                    </div>
                </div>
            </template>
            <div class="mx-auto mb-6 space-y-2 max-w-screen-2xl">
                <NuxtImg provider="localProvider" :src="news?.mainImage as string" w="128"
                    class="object-cover w-full rounded" />
            </div>
            <div class="text-gray-900 dark:text-gray-100">
                <TiptapShow :content="news?.body!" />
            </div>
            <template #footer>
                <div class="mt-6">
                    <div class="flex flex-wrap gap-2 py-6 border-t border-dashed dark:border-gray-600">
                        <UBadge v-for="tag, i in news?.tags" :key="i">{{ tag }}</UBadge>
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200">You might also be interested
                            in</h4>
                        <ul
                            class="ml-4 space-y-1 text-gray-800 list-disc list-inside text-md md:text-lg dark:text-gray-400">
                            <li v-for="relate, i in news?.related" :key="i">
                                <NuxtLink rel="noopener noreferrer" :to="`/news/${relate.slug}`"
                                    class="text-gray-800 hover:underline hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200">
                                    {{ relate.title }}
                                </NuxtLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>
<style scoped></style>