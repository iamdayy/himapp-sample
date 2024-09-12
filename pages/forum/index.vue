<script lang="ts" setup>
import type { IProfile } from "~/types";
import type { IQuestionResponse } from "~/types/IResponse";

definePageMeta({
    layout: 'client',
    auth: false,
});

useHead({
    title: 'Forum',
});

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
/**
 * Computed properties for pagination
 */
const page = ref(1);
const pageCount = ref(10);
const pageTotal = computed(() => data.value?.data?.length ?? 0);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => Math.min(page.value * pageCount.value, pageTotal.value));
const pageCountOptions = computed(() => {
    const baseOptions = [5, 10, 20, 50, 100];
    const filteredOptions = baseOptions.filter((option) => option <= pageTotal.value);

    if (isMobile.value && filteredOptions.length > 3) {
        return filteredOptions.slice(0, 3);
    }

    return filteredOptions;
});


// query options
const search = ref('');
const { data: tags, pending, error } = useAsyncData('tags', () => $fetch('/api/tags'));
const tagsOpt = computed(() => {
    if (pending.value) return [];
    if (error.value) return [];
    if (!tags.value?.data) return [];
    return tags.value.data.map((tag, i) => ({ label: tag, id: i }));
});
const tagSelected = ref<string[]>([]);
const answered = ref(false);
const unanswered = ref(false);

const sortOptions = ['Votes', 'Post', 'Title'];
const sort = ref<string>('Post');
const sortBy = computed(() => {
    if (sort.value == 'Votes') return 'totalVotes';
    if (sort.value == 'Title') return 'title';
    return 'createdAt';
});
const order = ref<string>('asc');


const { data } = useLazyAsyncData<IQuestionResponse>('questions', () => $fetch<IQuestionResponse>('/api/questions', {
    method: 'GET',
    query: {
        page: page.value,
        perPage: pageCount.value,
        search: search.value,
        tags: tagSelected.value,
        sort: sortBy.value,
        order: order.value,
        answered: answered.value,
        unanswered: unanswered.value
    }
}),
    {
        watch: [page, pageCount, search, sort, order, tagSelected, answered, unanswered],
        default: () => ({
            data: {
                questions: [],
                length: 0
            },
            statusCode: 500,
            statusMessage: "Internal server error"
        })
    });


const responsiveUISizes = {
    button: isMobile.value ? 'sm' : 'lg',
    select: isMobile.value ? 'sm' : 'lg'
};

// Add these computed properties
const sortedQuestions = computed(() => {
    return data.value?.data?.questions.sort((a, b) => b.totalVotes - a.totalVotes);
});


const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
</script>
<template>
    <div class="items-center justify-center p-2 pt-16 mb-24 md:p-5">
        <div class="mx-auto text-center">
            <h2 class="text-2xl font-extrabold leading-tight tracking-tight text-gray-600 md:text-4xl dark:text-white">
                Forum
            </h2>
        </div>
        <UCard class="px-4 mt-6 md:px-8">
            <template #header>
                <UButton label="Ask Question" :size="responsiveUISizes.button" :ui="{ rounded: 'rounded-full' }" block
                    to="/forum/ask" />
                <UInput icon="i-heroicons-magnifying-glass-20-solid" size="lg" color="white" class="mt-4"
                    :trailing="false" placeholder="Search..." v-model="search" />
                <div class="flex justify-between w-full p-2">
                    <USelect v-model="sort" :options="sortOptions" label="sort" />
                    <USelect v-model="order" :options="['asc', 'desc']" label="order" />
                </div>
                <div class="flex w-full gap-2 p-2">
                    <UCheckbox label="Answered" v-model="answered" />
                    <UCheckbox label="Unanswered" v-model="unanswered" />
                    <UCheckbox v-model="tagSelected" v-for="tag in tagsOpt.slice(0, isMobile ? 5 : 10)" :key="tag.id"
                        :label="tag.label" :value="tag.label" />
                    <NuxtLink class="text-sm text-gray-500">See all tags</NuxtLink>
                </div>
            </template>
            <div class="w-full py-3">
                <ul class="w-full divide-y divide-gray-200 dark:divide-gray-700"
                    v-if="sortedQuestions && sortedQuestions.length > 0">
                    <li class="py-4" v-for="item in sortedQuestions" :key="item._id">
                        <NuxtLink :to="`/forum/${item._id}`"
                            class="flex items-center p-2 rounded-lg hover:bg-gray-800/15 dark:hover:bg-gray-200/15">
                            <div class="flex-shrink-0 mr-4 text-center">
                                <div class="text-xl font-bold">{{ item.totalVotes }}</div>
                                <div class="text-sm text-gray-500">votes</div>
                            </div>
                            <div class="flex-grow">
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ item.title }}
                                </h3>
                                <TiptapShow :content="item.body" />
                                <div class="flex items-center mt-2 text-sm text-gray-500">
                                    <NuxtImg class="w-5 h-5 mr-2 rounded-full"
                                        :src="item.author ? (item.author as IProfile).avatar : '/img/profile-blank.png'"
                                        :alt="item.author ? (item.author as IProfile).fullName : 'Anonymous'" />
                                    <span>{{ item.author ? (item.author as IProfile).fullName : 'Anonymous' }}</span>
                                    <span class="mx-2">•</span>
                                    <span>asked {{ formatDate(item.createdAt) }}</span>
                                </div>
                            </div>
                        </NuxtLink>
                    </li>
                </ul>
                <div v-else class="text-center">
                    <p>No questions found</p>
                </div>
            </div>
            <!-- Number of rows & Pagination -->
            <template #footer>
                <div class="flex flex-col flex-wrap items-center justify-between gap-3 md:flex-row">
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

                    <UPagination v-model="page" :page-count="pageCount" :total="pageTotal"
                        :ui="{ wrapper: 'flex items-center gap-1', rounded: '!rounded-full min-w-[32px] justify-center', default: { activeButton: { variant: 'outline' } } }" />
                    <div class="flex items-center gap-1.5">
                        <span class="text-sm leading-5">Rows per page:</span>
                        <USelect v-model="pageCount" :options="pageCountOptions" class="w-20 me-2"
                            :size="responsiveUISizes.select" />
                    </div>
                </div>
            </template>
        </UCard>
    </div>
</template>