<script lang="ts" setup>
import type { IAnswer, IMember } from '~/types';
import type { IQuestionDetailResponse, IResponse, IVoteResponse } from '~/types/IResponse';

definePageMeta({
    layout: 'client',
});

const route = useRoute();

const { $api } = useNuxtApp();
const toast = useToast();

const newAnswer = ref('');
const anonymous = ref(false);
const isSubmitting = ref(false);

const { data, refresh, pending } = useAsyncData<IQuestionDetailResponse>('question', () => $api(`/api/questions/${route.params.id}`));

const submitAnswer = async () => {
    if (!newAnswer.value.trim()) return;

    isSubmitting.value = true;
    try {
        const response = await $api<IResponse>('/api/questions/${route.params.id}/answers', {
            method: 'POST',
            body: JSON.stringify({
                content: newAnswer.value,
                isAnonymous: anonymous.value,
            }),
        });
        refresh();
        toast.add({
            title: 'Answer submitted',
            color: 'green',
            description: 'Your answer has been submitted',
        });
        newAnswer.value = '';
    } catch (error) {
        console.error('Error submitting answer:', error);
        toast.add({
            title: 'Error submitting answer',
            color: 'red',
            description: 'Please try again',
        });
    } finally {
        isSubmitting.value = false;
    }
};

const voteQuestion = async (voteType: 'upvote' | 'downvote') => {
    try {
        const response = await $api<IResponse>(`/api/questions/${route.params.id}/vote`, {
            method: 'POST',
            body: JSON.stringify({
                voteType,
            }),
        });
        refresh();
        toast.add({
            title: voteType === 'upvote' ? 'Upvoted' : 'Downvoted',
            color: 'green',
            description: 'Your vote has been submitted',
        });
    } catch (error) {
        console.error('Error voting:', error);
        toast.add({
            title: voteType === 'upvote' ? 'Error upvoting' : 'Error downvoting',
            color: 'red',
            description: 'Please try again',
        });
    }
};

const voteAnswer = async (voteType: 'upvote' | 'downvote', id: string) => {
    try {
        const response = await $api<IVoteResponse>(`/api/answers/${id}/vote`, {
            method: 'POST',
            body: JSON.stringify({
                voteType,
            }),
        });
        refresh();
        toast.add({
            title: response.statusMessage,
            color: 'green',
            description: 'Your vote has been submitted',
        });
    } catch (error: any) {
        console.error('Error voting:', error);
        toast.add({
            title: error.response.data.statusMessage,
            color: 'red',
            description: 'Please try again',
        });
    }
};

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const sortedAnswers = computed(() => {
    return [...(data.value?.data.answers as IAnswer[])].sort((a, b) => b.totalVotes - a.totalVotes);
});

</script>

<template>
    <div class="px-4 mx-auto mt-8 mb-24 md:px-8">
        <UCard>
            <div v-if="!data?.data && pending">
                <UCard>
                    <USkeleton class="min-w-full min-h-full rounded-lg" />
                </UCard>
            </div>
            <UCard>
                <template #header>
                    <h1 class="text-2xl font-bold">{{ data?.data?.title }}</h1>
                    <div class="flex items-center mt-2 text-sm text-gray-500">
                        <NuxtImg class="w-6 h-6 mr-2 rounded-full"
                            :src="data?.data?.author ? (data?.data?.author as IMember).avatar : '/img/member-blank.png'"
                            :alt="data?.data?.author ? (data?.data?.author as IMember).fullName : 'Anonymous'" />
                        <span>{{ data?.data?.author ? (data?.data?.author as IMember).fullName : 'Anonymous' }}</span>
                        <span class="mx-2">•</span>
                        <span>asked {{ formatDate(data?.data?.createdAt as Date) }}</span>

                    </div>
                </template>

                <div class="mt-4 mb-6">
                    <TiptapShow :content="data?.data?.body as string" />
                </div>

                <div class="flex items-center space-x-4">
                    <UButton icon="i-heroicons-arrow-up" color="gray" size="sm" variant="ghost" :padded="false"
                        @click="voteQuestion('upvote')" />
                    <span class="text-sm font-semibold">{{ data?.data?.totalVotes }}</span>
                    <UButton icon="i-heroicons-arrow-down" color="gray" size="sm" variant="ghost" :padded="false"
                        @click="voteQuestion('downvote')" />
                </div>

                <template #footer>
                    <div class="flex flex-wrap gap-2">
                        <UBadge v-for="tag in data?.data?.tags" :key="tag" color="blue" variant="soft">
                            {{ tag }}
                        </UBadge>
                    </div>
                </template>
            </UCard>

            <h2 class="mt-8 mb-4 text-xl font-bold">{{ (data?.data?.answers as IAnswer[]).length }} Answers</h2>

            <UCard v-for="answer in sortedAnswers" :key="answer._id" class="mb-4">
                <div class="flex items-start">
                    <div class="flex flex-col items-center mr-4">
                        <UButton icon="i-heroicons-arrow-up" color="gray" variant="ghost" :padded="false"
                            @click="voteAnswer('upvote', answer._id as string)" />
                        <span class="my-2 text-lg font-semibold">{{ answer.totalVotes }}</span>
                        <UButton icon="i-heroicons-arrow-down" color="gray" variant="ghost" :padded="false"
                            @click="voteAnswer('downvote', answer._id as string)" />
                    </div>
                    <div class="flex-grow">
                        <TiptapShow :content="answer.body" />
                        <div class="flex items-center mt-4 text-sm text-gray-500">
                            <NuxtImg class="w-6 h-6 mr-2 rounded-full"
                                :src="answer.author ? (answer.author as IMember).avatar : '/img/member-blank.png'"
                                :alt="answer.author ? (answer.author as IMember).fullName : 'Anonymous'" />
                            <span>{{ answer.author ? (answer.author as IMember).fullName : 'Anonymous' }}</span>
                            <span class="mx-2">•</span>
                            <span>answered {{ formatDate(answer.createdAt) }}</span>
                        </div>
                    </div>
                </div>
            </UCard>

            <UCard class="mt-8">
                <h3 class="mb-4 text-lg font-semibold">Your Answer</h3>
                <TipTapEditor v-model="newAnswer" rows="6" placeholder="Write your answer here..." />
                <div class="flex items-center justify-between space-x-4">
                    <UButton class="mt-4" @click="submitAnswer" :loading="isSubmitting" :disabled="isSubmitting">
                        Post Your Answer
                    </UButton>
                    <div class="flex items-center">
                        <UToggle v-model="anonymous" size="lg" variant="primary" />
                        <span class="ml-2">Anonymously</span>
                    </div>
                </div>
            </UCard>
        </UCard>
    </div>
</template>
