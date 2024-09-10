<script lang="ts" setup>

definePageMeta({
    layout: 'client',
});

const { data: user } = useAuth();
const { $api } = useNuxtApp();

const toast = useToast();

const title = ref('');
const body = ref('');
const tags = ref<{ label: string, id: number }[]>([]);
const anonymous = ref(false);
const isSubmitting = ref(false);
const { data, pending, error } = useAsyncData('tags', () => $api('/api/tags'));
const tagsOptions = computed(() => {
    if (pending.value) return [];
    if (error.value) return [];
    if (!data.value?.data) return [];
    return data.value.data.map((tag, i) => ({ label: tag, id: i }));
});

const submitQuestion = async () => {
    if (!title.value || !body.value) {
        toast.add({
            title: 'Title and content are required.',
            color: 'red',
            description: 'Please fill in the title and content fields.',
        });
        return;
    }

    isSubmitting.value = true;


    try {
        // Assuming you have an API endpoint for creating questions
        const response = await $api('/api/questions', {
            method: 'POST',
            body: JSON.stringify({
                title: title.value,
                body: body.value,
                tags: tags.value.map((tag) => tag.label),
                isAnonymous: anonymous.value,
            }),
        });

        // Redirect to the new question page
        navigateTo(`/forum/${(response.question as any)._id}`);
    } catch (error: any) {
        console.error('Error submitting question:', error);
        toast.add({
            title: 'Error submitting question',
            description: error.message,
            color: 'red',
        });
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="pt-16 mx-auto mt-8 mb-24">
        <h1 class="mb-6 text-3xl font-bold text-center">Ask a Question</h1>
        <UCard>
            <form @submit.prevent="submitQuestion">
                <div class="mb-4">
                    <label for="title"
                        class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <UInput id="title" v-model="title" placeholder="What's your question? Be specific." />
                </div>
                <div class="mb-4">
                    <label for="anonymous"
                        class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Anonymously</label>
                    <UToggle v-model="anonymous" size="lg" variant="primary" />
                </div>
                <div class="mb-4">
                    <label for="content"
                        class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                    <TipTapEditor id="body" v-model="body" rows="10"
                        placeholder="Provide details and any relevant code..." />
                </div>
                <div class="mb-6">
                    <label for="tags"
                        class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                    <USelectMenu v-model="tags" multiple :options="tagsOptions" :creatable="true" searchable
                        placeholder="Select tags">
                        <template #label>
                            <template v-if="tags.length">
                                <span class="flex items-center space-x-1">
                                    <UBadge v-for="tag of tags" :key="tag.id">{{ tag.label }}</UBadge>
                                </span>
                                <span>{{ tags.length }} tag{{ tags.length > 1 ? 's' : '' }}</span>
                            </template>
                            <template v-else>
                                <span class="text-gray-500 truncate dark:text-gray-400">Select Tags</span>
                            </template>
                        </template>

                        <template #option="{ option }">
                            <span class="flex-shrink-0 w-2 h-2 mt-px rounded-full" />
                            <span class="truncate">{{ option.label }}</span>
                        </template>

                        <template #option-create="{ option }">
                            <span class="flex-shrink-0">New Tag:</span>
                            <span class="block truncate">{{ option.label }}</span>
                        </template>
                    </USelectMenu>
                </div>
                <UButton type="submit" :loading="isSubmitting" :disabled="isSubmitting">
                    Post Your Question
                </UButton>
            </form>
        </UCard>
    </div>
</template>
