<script setup lang='ts'>
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
const modal = useModal();

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    img: String,
    stencil: {
        type: Object,
        default: {
            movable: true,
            resizable: true,
            aspectRatio: 1,
        }
    }
});
const cropper = ref();
const model = defineModel()
const emits = defineEmits(['cropped']);
const crop = () => {
    const { canvas } = cropper.value.getResult();
    canvas.toBlob((blob: Blob) => {
        const file = new File([blob], props.title, {
            type: blob.type
        })
        emits('cropped', file)
        model.value = false;
    })

}
</script>
<template>
    <UModal :ui="{ wrapper: 'relative z-[60]' }" v-model="model">
        <UCard>
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 class="text-xl font-semibold dark:text-gray-200">Adjust image</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="model = false" />
                </div>
            </template>
            <div class="p-3">
                <Cropper :src="img" :auto-zoom="true" :stencil-props="stencil" ref="cropper" />
                <UButton label="Done" block @click="crop" />
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>