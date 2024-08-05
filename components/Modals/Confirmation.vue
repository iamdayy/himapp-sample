<script setup lang='ts'>
const modal = useModal();

defineProps({
    title: String,
    body: String
});
defineEmits(['confirm'])
</script>
<template>
    <UModal>
        <UCard>
            <template #header>
                <div class="flex w-full justify-between">
                    <h2 class="text-xl font-semibold dark:text-gray-200">{{ title }}</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div class="p-3">
                <p>{{ body }}</p>
                <div class="w-full flex gap-3 justify-between py-4">
                    <UButton label="Cancel" variant="outline" color="red" @click="modal.close" />
                    <UButton label="Confirm" variant="solid" @click="$emit('confirm')" />
                </div>
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>