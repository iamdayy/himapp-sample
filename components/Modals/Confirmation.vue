<script setup lang='ts'>
import { useWindowSize } from '@vueuse/core';

/**
 * Modal instance for controlling the modal visibility
 */
const modal = useModal();

/**
 * Props definition for the component
 */
defineProps({
    /**
     * The title of the confirmation modal
     */
    title: String,
    /**
     * The body text of the confirmation modal
     */
    body: String
});

/**
 * Emits definition for the component
 */
defineEmits(['confirm']);

/**
 * Window size composable for responsive design
 */
const { width } = useWindowSize();

/**
 * Computed property to determine if the screen is mobile size
 */
const isMobile = computed(() => width.value < 640);

/**
 * Computed property for responsive class names
 */
const responsiveClasses = computed(() => ({
    container: isMobile.value ? 'p-2' : 'p-3',
    title: isMobile.value ? 'text-lg' : 'text-xl',
    buttonContainer: isMobile.value ? 'flex-col' : 'flex-row',
    button: isMobile.value ? 'w-full mb-2' : 'w-auto',
}));
</script>
<template>
    <UModal>
        <UCard>
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <h2 :class="['font-semibold dark:text-gray-200', responsiveClasses.title]">{{ title }}</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div :class="responsiveClasses.container">
                <p class="mb-4">{{ body }}</p>
                <div :class="['w-full flex gap-3 justify-between', responsiveClasses.buttonContainer]">
                    <UButton :class="responsiveClasses.button" label="Cancel" variant="outline" color="red"
                        @click="modal.close" />
                    <UButton :class="responsiveClasses.button" label="Confirm" variant="solid"
                        @click="$emit('confirm')" />
                </div>
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>