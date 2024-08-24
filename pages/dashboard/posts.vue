<script setup lang='ts'>
import { ModalsAddPost, ModalsConfirmation, ModalsEditPost } from '#components';
import type { IPost, IProfile } from '~/types';
import type { IPostResponse } from '~/types/IResponse';

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
});
useHead({
    title: 'Posts'
});
const { $api } = useNuxtApp();
const modal = useModal();
const toast = useToast();
// Pagination
const sort = ref({ column: 'createdAt', direction: 'asc' as const });
const page = ref(1);
const pageCount = ref(10);
const { data, refresh } = useLazyAsyncData(() => $api<IPostResponse>('/api/post', {
    query: {
        page: page.value,
        perPage: pageCount.value,
        sort: sort.value
    }
}), {
    default: () => ({
        posts: [],
        length: 0
    }),
    watch: [page, pageCount, sort,]

});
const pageTotal = computed(() => data.value.length) // This value should be dynamic coming from the API
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value))
const pageCountOptions = computed(() => [10, 20, 50, 100, 200, data.value.length]);

const publishPost = async (slug: string) => {
    try {
        const published = await $api('/api/post/publish', {
            query: {
                slug
            }
        });
        toast.add({ title: published.statusMessage! });
        refresh();
    } catch (error) {
        toast.add({ title: 'Failed To Publish Post' });
    }
}

const AddModal = () => {
    modal.open(ModalsAddPost, {
        fullscreen: true,
        onTriggerRefresh() {
            refresh()
        }
    })
}
const EditModal = (post: IPost) => {
    modal.open(ModalsEditPost, {
        fullscreen: true,
        onTriggerRefresh() {
            refresh()
        },
        data: post
    })
}
const DeleteModal = (slug: string) => {
    modal.open(ModalsConfirmation, {
        async onConfirm() {
            try {
                const deleted = await $api('/api/post', {
                    method: 'DELETE',
                    query: {
                        slug
                    }
                });
                toast.add({ title: deleted.statusMessage! });
                refresh();
                modal.close();
            } catch (error) {
                toast.add({ title: 'Failed To delete Post' });

            }
        },
        title: 'Post delete Confirmation',
        body: 'Are you sure to delete this post ?'
    })
}

const items = (post: IPost) => [[
    {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: () => DeleteModal(post.slug!)
    },
    {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square',
        click: () => EditModal(post)
    },
    {
        label: 'Publish',
        icon: 'i-ion-arrow-up-right-box-outline',
        click: () => publishPost(post.slug!)
    }
]]
</script>
<template>
    <div class="items-center justify-center pb-24">
        <div class="mx-auto mb-3 text-center">
            <h2 class="text-4xl font-extrabold leading-tight tracking-tight text-gray-600 dark:text-white">
                Project
            </h2>
        </div>
        <UCard class="mx-6">
            <template #header>
                <UButton label="Add Post" @click="AddModal" />
                <div class="flex flex-wrap items-center justify-between">
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
            <div class="flex flex-row gap-3">
                <UCard class="max-w-lg min-h-32" v-for="post, i in data.posts">
                    <template #header>
                        <NuxtImg :src="post.mainImage" class="mx-auto rounded-lg w" />
                    </template>
                    <div class="space-y-2">
                        <h2 class="text-2xl font-semibold line-clamp-1">{{ post.title }}</h2>
                        <div class="text-sm font-normal line-clamp-2 max-h-20 indent-6">
                            <TiptapShow :content="post.body" />
                        </div>
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
                                <UDropdown :items="items(post)" :popper="{ arrow: true, strategy: 'absolute' }">
                                    <UButton icon="i-ion-ellipsis-vertical" variant="link" color="gray" />
                                </UDropdown>

                            </div>
                        </UCard>
                    </template>
                </UCard>
            </div>

        </UCard>
    </div>
</template>
<style scoped></style>