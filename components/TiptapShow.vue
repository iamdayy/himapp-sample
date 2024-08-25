<script setup lang='ts'>
import { useWindowSize } from '@vueuse/core';
import { computed } from 'vue';

/**
 * Props definition for the TiptapShow component
 */
const props = defineProps({
    content: {
        type: String,
        required: true,
        description: 'The HTML content to be displayed'
    }
});

/**
 * Responsive design setup
 */
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

/**
 * Computed classes for responsive design
 */
const articleClasses = computed(() => [
    'min-w-full',
    'prose',
    'dark:prose-invert',
    'prose-img:rounded-xl',
    'prose-a:text-blue-600',
    isMobile.value ? 'p-2 py-0 text-sm' : 'p-3 py-0 text-base',
    isMobile.value ? 'prose-sm' : 'prose-base'
]);
</script>

<template>
    <article :class="articleClasses" v-html="content"></article>
</template>

<style scoped>
/* Additional scoped styles can be added here if needed */
</style>