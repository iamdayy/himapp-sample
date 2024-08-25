<template>
    <div class="overflow-hidden border border-orange-500 rounded-md">
        <!-- Editor toolbar -->
        <div class="flex flex-wrap justify-between w-full border-b border-orange-500 shadow-md h-fit">
            <!-- Main editing tools -->
            <UButtonGroup :size="responsiveUISizes.button as any" orientation="horizontal" v-if="editor"
                :ui="{ rounded: 'rounded-none' }">
                <UButton icon="i-heroicons-bold" :variant="editor?.isActive('bold') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleBold().run()"
                    :disabled="!editor?.can().chain().focus().toggleBold().run()" />
                <UButton icon="i-heroicons-italic" :variant="editor?.isActive('italic') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleItalic().run()"
                    :disabled="!editor?.can().chain().focus().toggleItalic().run()" />
                <UButton icon="i-heroicons-strikethrough" :variant="editor?.isActive('strike') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleStrike().run()"
                    :disabled="!editor?.can().chain().focus().toggleStrike().run()" />
                <UButton v-for="level in [1, 2, 3, 4, 5]" :key="level" :label="`h${level}`"
                    :variant="editor?.isActive('heading', { level: level as 1 | 2 | 3 | 4 | 5 }) ? 'solid' : 'outline'"
                    color="orange"
                    @click="editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 }).run()" />
                <UButton icon="i-ph-paragraph" color="orange" @click="editor?.chain().focus().setParagraph().run()" />
                <UButton icon="i-ph-image" color="orange" @click="openInput" />
                <input class="hidden" id="fileInput" type="file" @input="handleImage" accept="image/*" />
            </UButtonGroup>
            <!-- Undo/Redo buttons -->
            <UButtonGroup :size="responsiveUISizes.button as any" orientation="horizontal" v-if="editor"
                :ui="{ rounded: 'rounded-none' }">
                <UButton icon="i-heroicons-arrow-uturn-left" color="orange"
                    @click="editor?.chain().focus().undo().run()"
                    :disabled="!editor?.can().chain().focus().undo().run()" />
                <UButton icon="i-heroicons-arrow-uturn-right" color="orange"
                    @click="editor?.chain().focus().redo().run()"
                    :disabled="!editor?.can().chain().focus().redo().run()" />
            </UButtonGroup>
        </div>
        <!-- Floating menu for quick formatting -->
        <TiptapFloatingMenu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
            <UButtonGroup :size="responsiveUISizes.floatingMenu as any" orientation="horizontal"
                :ui="{ rounded: 'rounded-full' }">
                <UButton v-for="level in [1, 2, 3]" :key="level" :label="`h${level}`"
                    :variant="editor?.isActive('heading', { level: level as 1 | 2 | 3 }) ? 'solid' : 'outline'"
                    color="orange"
                    @click="editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()" />
                <UButton icon="i-ph-list-bullets" :variant="editor?.isActive('bulletList') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleBulletList().run()" />
                <UButton icon="i-ph-list-numbers" :variant="editor?.isActive('orderedList') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleOrderedList().run()" />
                <UButton icon="i-ph-arrow-elbow-down-left" variant="solid" color="orange"
                    @click="editor?.chain().focus().setHardBreak().run()" />
            </UButtonGroup>
        </TiptapFloatingMenu>
        <!-- Main editor content area -->
        <TiptapEditorContent :editor="editor" />
    </div>
    <!-- Modal for image cropping -->
    <ModalsCropImage v-model="openModal" :img="file.blob" :title="file.name" @cropped="onCropped" />
</template>

<script setup lang="ts">
import { ModalsCropImage } from '#components';
import { Color } from '@tiptap/extension-color';
import { Image as TiptapImage } from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import { Placeholder as TiptapPlaceholder } from "@tiptap/extension-placeholder";
import TextStyle from '@tiptap/extension-text-style';
import { useWindowSize } from '@vueuse/core';
import imageCompression from 'browser-image-compression';

// Reactive references for UI state
const openModal = ref(false);
const file = ref<{ blob: string, name: string }>({
    blob: "",
    name: ""
});

// Props definition
const props = defineProps({
    modelValue: String
});

// Emits definition
const emit = defineEmits(['update:modelValue']);

/**
 * Opens the file input dialog
 */
const openInput = () => {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input?.click();
}

/**
 * Handles the image selection
 * @param {Event} ev - The input event
 */
const handleImage = (ev: Event) => {
    encodeImageFileAsURL(ev.target as HTMLInputElement)
}

/**
 * Encodes the selected image file as a URL
 * @param {HTMLInputElement} target - The input element containing the file
 */
const encodeImageFileAsURL = async (target: HTMLInputElement) => {
    if (target && target.files) {
        let f = target.files[0];
        const blob = URL.createObjectURL(f);
        file.value.blob = blob;
        file.value.name = f.name;
        openModal.value = true;
    }
}

/**
 * Handles the cropped image
 * @param {File} file - The cropped image file
 */
const onCropped = async (file: File) => {
    const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
    }
    const compressedFile = await imageCompression(file, options);
    let reader = new FileReader();
    reader.onloadend = function () {
        unref(editor)?.chain().focus().setImage({ src: reader.result as string }).run()
    }
    reader.readAsDataURL(compressedFile);
}

// Initialize the editor
const editor = useEditor({
    extensions: [
        TiptapStarterKit.configure({
            orderedList: {
                HTMLAttributes: {
                    class: 'list-decimal ms-8'
                }
            },
            bulletList: {
                HTMLAttributes: {
                    class: 'list-disc ms-8'
                }
            },
            paragraph: {
                HTMLAttributes: {
                    class: 'indent-8'
                }
            }
        }),
        TiptapPlaceholder.configure({
            emptyEditorClass: 'is-editor-empty',
            placeholder: 'Write your post content here',
        }),
        TiptapImage.configure({
            allowBase64: true
        }),
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
        Link.configure({
            openOnClick: false,
            defaultProtocol: 'https',
            HTMLAttributes: {
                class: "after:content-['_↗']"
            }
        }),
    ],
    editorProps: {
        attributes: {
            class: 'prose p-3 min-w-full min-h-96 dark:prose-invert prose-img:rounded-xl prose-a:text-blue-600'
        }
    },
    content: props.modelValue,
    onUpdate: ({ editor }) => {
        emit('update:modelValue', editor?.getHTML())
    },
});

// Clean up editor on component unmount
onBeforeUnmount(() => {
    unref(editor)?.destroy();
});

/**
 * Responsive design setup
 */
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
const isTablet = computed(() => width.value >= 768 && width.value < 1024);

/**
 * Responsive UI sizes for components
 */
const responsiveUISizes = computed(() => ({
    button: isMobile.value ? '2xs' : isTablet.value ? 'xs' : 'sm',
    floatingMenu: isMobile.value ? 'xs' : 'sm',
}))
</script>

<style>
.tiptap {
    outline: none;
}
</style>