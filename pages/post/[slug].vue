<script setup lang='ts'>
import type { IProfile } from '~/types';
import type { IPostResponse } from '~/types/IResponse';

const { $api } = useNuxtApp();
definePageMeta({
    auth: false,
    layout: "client"
});
const route = useRoute();
const { data } = useAsyncData(() => $api<IPostResponse>('/api/post', {
    query: {
        slug: route.params.slug
    }
}));
watch(data, () => {
    useHead({
        title: data.value?.data?.post?.title
    });
})
</script>
<template>
    <div class="p-2 py-16 text-gray-100 md:mx-auto md:p-5 dark:text-gray-800">
        <UCard v-if="data?.data?.post">
            <template #header>
                <h1 class="inline-block mb-2 text-3xl font-semibold text-gray-900 sm:text-5xl dark:text-gray-100">{{
                    data?.data?.post?.title }}</h1>

            </template>
            <div class="max-w-screen-xl mx-auto mb-6 space-y-2">
                <NuxtImg provider="localProvider" :src="data?.data?.post?.mainImage as string" w="128"
                    class="object-cover w-full rounded" />
                <p class="text-xs text-gray-400 dark:text-gray-600">By
                    <span class="text-xs hover:underline">{{ (data?.data?.post?.author as IProfile).fullName }}</span>
                    on
                    <span class="text-xs hover:underline">{{ new
                        Date(data?.data?.post?.publishedAt!).toLocaleDateString()
                        }}</span>
                </p>
            </div>
            <div class="text-gray-900 dark:text-gray-100">
                <TiptapShow :content="data?.data?.post?.body!" />
            </div>
            <template #footer>
                <div class="mt-6">
                    <div class="flex flex-wrap gap-2 py-6 border-t border-dashed dark:border-gray-600">
                        <span class="px-3 py-1 rounded-sm dark:bg-blue-600 dark:text-gray-50"
                            v-for="category, i in data?.data?.post?.categories" :key="i">{{ category.title }}</span>
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Related posts</h4>
                        <ul class="ml-4 space-y-1 list-disc">
                            <li v-for="relate, i in data?.data?.post?.related" :key="i">
                                <NuxtLink rel="noopener noreferrer" :to="`/post/${relate.slug}`"
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