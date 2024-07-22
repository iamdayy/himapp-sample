<script setup lang='ts'>
import type { IPost } from '~/types';

const perPage = ref<number>(10);
const page = ref<number>(1);
const paginate = <T extends unknown>(arr: Array<T>, perPage: number, page: number) => {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return arr.slice((page - 1) * perPage, page * perPage);
}

const query = groq`*[_type == "post"] {
    title,
    "mainImage": mainImage.asset._ref,
    "slug": slug.current}`
const { data } = await useSanityQuery<IPost[]>(query);
const posts = ref<IPost[]>(paginate(data.value!, perPage.value, page.value));
watch(page, () => {
    posts.value = paginate(data.value!, perPage.value, page.value);
});
</script>
<template>
    <UCard>
        <template #header>
            <h2 class="text-4xl font-extrabold dark:text-white">Posts</h2>
        </template>
        <div class="px-3 py-8 overflow-auto max-h-[70vh]">
            <ol class="relative">
                <li class="mb-10 ms-4" v-for="{ title, slug, mainImage }, i in posts" :key="i">
                    <NuxtLink :to="`/post/${slug}`" class="text-2xl font-bold dark:text-gray-100">
                        <SanityImage class="object-contain w-48" w="128" auto="format" :asset-id="mainImage" />
                        {{ title }}
                    </NuxtLink>
                </li>
            </ol>
        </div>
        <UPagination size="sm" v-model="page" :total="posts.length" show-last show-first />
    </UCard>
</template>
<style scoped></style>