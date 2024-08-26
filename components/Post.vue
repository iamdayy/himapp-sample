<script setup lang='ts'>
import type { IProfile } from '~/types';
import type { IPostResponse } from '~/types/IResponse';
const { $api } = useNuxtApp()
// Pagination
const sort = ref({ column: 'createdAt', direction: 'asc' as const });
const page = ref(1);
const pageCount = ref(10);
const { data, refresh } = useLazyAsyncData(() =>
    $api<IPostResponse>('/api/post', {
        query: {
            page: page.value,
            perPage: pageCount.value,
            sort: sort.value
        },
    })
    , {
        default: () => ({
            posts: [],
            length: 0
        }),
        watch: [page, pageCount, sort,]

    })
const pageTotal = computed(() => data.value.length) // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))
const pageCountOptions = computed(() => [10, 20, 50, 100, 200, data.value.length]);
</script>
<template>
    <UCard>
        <template #header>
            <h2 class="text-2xl font-extrabold md:text-4xl dark:text-white">Posts</h2>
        </template>
        <div class="flex flex-col gap-3 md:flex-row">
            <NuxtLink v-for="post, i in data.posts" :to="`/post/${post.slug}`">
                <UCard class="max-w-lg min-h-32">
                    <template #header>
                        <NuxtImg :src="post.mainImage" class="mx-auto rounded-lg" />
                    </template>
                    <div class="space-y-2">
                        <h2 class="text-xl font-semibold md:text-2xl line-clamp-1">{{ post.title }}</h2>
                    </div>
                    <template #footer>
                        <UCard class="min-w-full min-h-12" :ui="{ body: { padding: 'p-1 sm:p-1 px-3 sm:px-3' } }">
                            <div class="flex flex-row justify-between">
                                <div>
                                    <h2>
                                        {{ (post.author as IProfile).fullName }}
                                    </h2>
                                    <div v-if="post.published" class="text-sm font-light ms-3">
                                        Published At
                                        <span>
                                            {{ new Date(post.publishedAt!).toLocaleDateString('id-Id', {
                                                dateStyle: "long"
                                            }) }}
                                        </span>
                                    </div>
                                    <span class="text-sm text-red-500 ms-3" v-else>
                                        Not published
                                    </span>
                                </div>
                            </div>
                        </UCard>
                    </template>
                </UCard>
            </NuxtLink>
        </div>
        <template #footer>
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <div class="flex items-center gap-1.5">
                    <span class="text-sm leading-5">Rows per page:</span>
                    <USelect v-model="pageCount" :options="pageCountOptions" class="w-20 me-2" size="xs" />
                </div>
                <div>
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
</template>
<style scoped></style>
