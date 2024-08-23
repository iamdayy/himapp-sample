<script setup lang='ts'>
defineProps({
    content: {
        type: String,
        required: true
    }
})
</script>
<template>
    <article class="min-w-full p-3 py-0 prose dark:prose-invert prose-img:rounded-xl prose-a:text-blue-600"
        v-html="content">
    </article>
</template>
<style scoped></style>