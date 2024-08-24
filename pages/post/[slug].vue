<script setup lang='ts'>
import type { IPost, IProfile } from '~/types';

const { $api } = useNuxtApp();
definePageMeta({
    auth: false,
    layout: "client"
});
const route = useRoute();
const { data: details } = useAsyncData<IPost>(() => $api('/api/post', {
    query: {
        slug: route.params.slug
    }
}));
watch(details, () => {
    useHead({
        title: details.value?.title
    });
})
</script>
<template>
    <div class="p-5 mx-auto text-gray-100 sm:p-10 md:p-16 dark:text-gray-800">
        <UCard v-if="details">
            <template #header>
                <h1 rel="noopener noreferrer" href="#"
                    class="inline-block mb-2 text-3xl font-semibold text-gray-900 sm:text-5xl dark:text-gray-100">{{
                        details?.title }}</h1>

            </template>
            <div class="max-w-screen-xl mx-auto mb-6 space-y-2">
                <NuxtImg :src="details?.mainImage" w="128" class="object-cover w-full rounded" />
                <p class="text-xs text-gray-400 dark:text-gray-600">By
                    <span class="text-xs hover:underline">{{ (details?.author as IProfile).fullName }}</span> on
                    <span class="text-xs hover:underline">{{ new Date(details?.publishedAt!).toLocaleDateString()
                        }}</span>
                </p>
            </div>
            <div class="text-gray-900 dark:text-gray-100">
                <TiptapShow :content="details?.body!" />
            </div>
            <template #footer>
                <div class="mt-6">
                    <div class="flex flex-wrap gap-2 py-6 border-t border-dashed dark:border-gray-600">
                        <span class="px-3 py-1 rounded-sm dark:bg-blue-600 dark:text-gray-50"
                            v-for="category, i in details?.categories" :key="i">{{ category.title }}</span>
                    </div>
                    <div class="space-y-2">
                        <h4 class="text-lg font-semibold">Related posts</h4>
                        <ul class="ml-4 space-y-1 list-disc">
                            <li v-for="relate, i in details?.related" :key="i">
                                <NuxtLink rel="noopener noreferrer" :to="`/post/${relate.slug}`"
                                    class="hover:underline">
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