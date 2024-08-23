<template>
    <div class="overflow-hidden border border-orange-500 rounded-md">
        <div class="flex justify-between w-full border-b border-orange-500 shadow-md h-fit">
            <UButtonGroup size="xs" orientation="horizontal" v-if="editor" :ui="{ rounded: 'rounded-none' }">
                <UButton icon="i-heroicons-bold" :variant="editor?.isActive('bold') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleBold().run()"
                    :disabled="!editor?.can().chain().focus().toggleBold().run()" />
                <UButton icon="i-heroicons-italic" :variant="editor?.isActive('italic') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleItalic().run()"
                    :disabled="!editor?.can().chain().focus().toggleItalic().run()" />
                <UButton icon="i-heroicons-strikethrough" :variant="editor?.isActive('strike') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleStrike().run()"
                    :disabled="!editor?.can().chain().focus().toggleStrike().run()" />
                <UButton label="h1" :variant="editor?.isActive('heading', { level: 1 }) ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" />
                <UButton label="h2" :variant="editor?.isActive('heading', { level: 2 }) ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" />
                <UButton label="h3" :variant="editor?.isActive('heading', { level: 3 }) ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" />
                <UButton label="h4" :variant="editor?.isActive('heading', { level: 4 }) ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleHeading({ level: 4 }).run()" />
                <UButton label="h5" :variant="editor?.isActive('heading', { level: 5 }) ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleHeading({ level: 5 }).run()" />
                <UButton icon="i-ph-paragraph" color="orange" @click="editor?.chain().focus().setParagraph().run()" />
                <UButton icon="i-ph-image" color="orange" @click="openInput" />
                <input class="hidden" id="fileInput" type="file" @input="handleImage" />
            </UButtonGroup>
            <UButtonGroup size="xs" orientation="horizontal" v-if="editor" :ui="{ rounded: 'rounded-none' }">
                <UButton icon="i-heroicons-arrow-uturn-left" color="orange"
                    @click="editor?.chain().focus().undo().run()"
                    :disabled="!editor?.can().chain().focus().undo().run()" />
                <UButton icon="i-heroicons-arrow-uturn-right" color="orange"
                    @click="editor?.chain().focus().redo().run()"
                    :disabled="!editor?.can().chain().focus().redo().run()" />
            </UButtonGroup>
        </div>
        <TiptapFloatingMenu :editor="editor" :tippy-options="{ duration: 100 }" v-if="editor">
            <UButtonGroup size="sm" orientation="horizontal" :ui="{ rounded: 'rounded-full' }">
                <UButton label="h1" :variant="editor?.isActive('heading', { level: 1 }) ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" />
                <UButton label="h2" :variant="editor?.isActive('heading', { level: 2 }) ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" />
                <UButton label="h3" :variant="editor?.isActive('heading', { level: 3 }) ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" />
                <UButton icon="i-ph-list-bullets" :variant="editor?.isActive('bulletList') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleBulletList().run()" />
                <UButton icon="i-ph-list-numbers" :variant="editor?.isActive('orderedList') ? 'solid' : 'outline'"
                    color="orange" @click="editor?.chain().focus().toggleOrderedList().run()" />
                <UButton icon="i-ph-arrow-elbow-down-left" variant="solid" color="orange"
                    @click="editor?.chain().focus().setHardBreak().run()" />
            </UButtonGroup>
        </TiptapFloatingMenu>
        <TiptapEditorContent :editor="editor" />
    </div>
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
import imageCompression from 'browser-image-compression';
const openModal = ref(false);
const file = ref<{ blob: string, name: string }>({
    blob: "",
    name: ""
});
const props = defineProps({
    modelValue: String
});

const openInput = () => {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input?.click();
}

const handleImage = (ev: Event) => {
    encodeImageFileAsURL(ev.target as HTMLInputElement)

}

const encodeImageFileAsURL = async (target: HTMLInputElement) => {
    if (target && target.files) {
        let f = target.files[0];
        const blob = URL.createObjectURL(f);
        file.value.blob = blob;
        file.value.name = f.name;
        openModal.value = true;
    }
}
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
const emit = defineEmits(['update:modelValue'])

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
onBeforeUnmount(() => {
    unref(editor)?.destroy();
});
</script>
<style>
.tiptap {
    outline: none;
}
</style>