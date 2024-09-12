<script setup lang='ts'>
import { ModalsAddPost, ModalsConfirmation, ModalsEditPost } from '#components';
import type { IPost, IProfile } from '~/types';
import type { IPostResponse } from '~/types/IResponse';

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
    title: 'Posts'
});

const { $api } = useNuxtApp();
const modal = useModal();
const toast = useToast();
const { isOrganizer } = useOrganizer();
/**
 * Pagination and sorting state
 */
const sort = ref({ column: 'createdAt', direction: 'asc' as const });
const page = ref(1);
const pageCount = ref(10);

/**
 * Fetch posts data
 */
const { data, refresh } = useLazyAsyncData(() => $api<IPostResponse>('/api/post', {
    query: {
        page: page.value,
        perPage: pageCount.value,
        sort: sort.value
    }
}), {
    default: () => ({
        data: {
            posts: [],
            length: 0
        }
    }),
    watch: [page, pageCount, sort]
});

/**
 * Computed properties for pagination
 */
const pageTotal = computed(() => data.value.data?.length || 0)
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1)
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value || 0))
const pageCountOptions = computed(() => [10, 20, 50, 100, 200, pageTotal.value || 0]);

/**
 * Publish a post
 * @param {string} slug - The slug of the post to publish
 */
const publishPost = async (slug: string) => {
    try {
        const published = await $api('/api/post/publish', {
            query: { slug }
        });
        toast.add({ title: published.statusMessage! });
        refresh();
    } catch (error) {
        toast.add({ title: 'Failed To Publish Post' });
    }
}

/**
 * Open modal to add a new post
 */
const AddModal = () => {
    modal.open(ModalsAddPost, {
        fullscreen: true,
        onTriggerRefresh() {
            refresh()
        }
    })
}

/**
 * Open modal to edit an existing post
 * @param {IPost} post - The post to edit
 */
const EditModal = (post: IPost) => {
    modal.open(ModalsEditPost, {
        fullscreen: true,
        onTriggerRefresh() {
            refresh()
        },
        data: post
    })
}

/**
 * Open confirmation modal to delete a post
 * @param {string} slug - The slug of the post to delete
 */
const DeleteModal = (slug: string) => {
    modal.open(ModalsConfirmation, {
        async onConfirm() {
            try {
                const deleted = await $api('/api/post', {
                    method: 'DELETE',
                    query: { slug }
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

/**
 * Open confirmation modal to publish a post
 * @param {string} slug - The slug of the post to publish
 */
const PublishModal = (slug: string) => {
    modal.open(ModalsConfirmation, {
        async onConfirm() {
            try {
                await publishPost(slug);
                modal.close();
            } catch (error) {
                toast.add({ title: 'Failed to publish Post' });
            }
        },
        title: 'Post Publish Confirmation',
        body: 'Are you sure you want to publish this post?'
    })
}


/**
 * Generate dropdown items for each post
 * @param {IPost} post - The post to generate items for
 * @returns {Array} Array of dropdown items
 */
const items = (post: IPost): Array<any> => [[
    {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: () => DeleteModal(post.slug!),
        disabled: !isOrganizer.value
    },
    {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square',
        click: () => EditModal(post),
        disabled: !isOrganizer.value
    },
    {
        label: 'Publish',
        icon: 'i-ion-arrow-up-right-box-outline',
        click: () => PublishModal(post.slug!),
        disabled: !isOrganizer.value
    }
]]

/**
 * Responsive design
 */
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 640)
const isTablet = computed(() => width.value >= 640 && width.value < 1024)

/**
 * Computed property for responsive class names
 */
const responsiveClasses = computed(() => ({
    container: isMobile.value ? 'px-2' : 'px-6',
    title: isMobile.value ? 'text-2xl' : 'text-4xl',
    card: isMobile.value ? 'w-full' : isTablet.value ? 'w-1/2' : 'w-1/3',
    button: isMobile.value ? 'text-sm' : 'text-base',
    pagination: isMobile.value ? 'flex-col items-start' : 'flex-row items-center',
}))
</script>
<template>
    <div :class="['items-center justify-center pb-24', responsiveClasses.container]">
        <div class="mx-auto mb-3 text-center">
            <h2
                :class="['font-extrabold leading-tight tracking-tight text-gray-600 dark:text-white', responsiveClasses.title]">
                Project
            </h2>
        </div>
        <UCard>
            <template #header>
                <UButton :class="responsiveClasses.button" v-if="isOrganizer" label="Add Post" @click="AddModal" />
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
            <div class="flex flex-wrap gap-3">
                <UCard :class="['min-h-32', responsiveClasses.card]" v-for="post, i in data.data?.posts" :key="i">
                    <template #header>
                        <NuxtImg :src="post.mainImage" class="w-full mx-auto rounded-lg" />
                    </template>
                    <div class="space-y-2">
                        <NuxtLink :to="`/post/${post.slug}`" class="text-xl font-semibold sm:text-4xl line-clamp-1">{{
                            post.title
                            }}</NuxtLink>
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