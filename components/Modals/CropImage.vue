<script setup lang='ts'>
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

/**
 * Composables
 */
const modal = useModal();
const { width } = useWindowSize();

/**
 * Responsive design
 */
const isMobile = computed(() => width.value < 640);
const isTablet = computed(() => width.value >= 640 && width.value < 1024);

/**
 * Props definition
 */
const props = defineProps({
    title: {
        type: String,
        required: true,
        description: 'Title of the image to be cropped'
    },
    img: {
        type: String,
        description: 'Source URL of the image to be cropped'
    },
    stencil: {
        type: Object,
        default: {
            movable: true,
            resizable: true,
            aspectRatio: 1,
        },
        description: 'Stencil properties for the cropper'
    }
});

/**
 * Reactive references
 */
const cropper = ref();
const model = defineModel();

/**
 * Emits
 */
const emits = defineEmits(['cropped']);

/**
 * Crop the image
 */
const crop = () => {
    const { canvas } = cropper.value.getResult();
    canvas.toBlob((blob: Blob) => {
        const file = new File([blob], props.title, {
            type: blob.type
        });
        emits('cropped', file);
    });
};

/**
 * Compute UI size based on screen width
 */
const uiSize = computed(() => isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg');

/**
 * Responsive classes
 */
const responsiveClasses = computed(() => ({
    container: isMobile.value ? 'p-2' : 'p-3',
    title: isMobile.value ? 'text-lg' : 'text-xl',
    button: isMobile.value ? 'text-sm' : 'text-base',
}));
</script>

<template>
    <UModal :ui="{ wrapper: 'relative z-[60]' }" v-model="model">
        <UCard>
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 :class="['font-semibold dark:text-gray-200', responsiveClasses.title]">Adjust image</h2>
                    <UButton icon="i-heroicons-x-mark" :size="uiSize" :padded="false" variant="link" color="gray"
                        @click="model = false" />
                </div>
            </template>
            <div :class="responsiveClasses.container">
                <Cropper :src="img" :auto-zoom="true" :stencil-props="stencil" ref="cropper" class="mb-4" />
                <UButton label="Done" :size="uiSize" block @click="crop" :class="responsiveClasses.button" />
            </div>
        </UCard>
    </UModal>
</template>

<style scoped>
/* Responsive styles for the cropper */
.vue-advanced-cropper {
    max-height: 70vh;
}

@media (max-width: 640px) {
    .vue-advanced-cropper {
        max-height: 50vh;
    }
}
</style>