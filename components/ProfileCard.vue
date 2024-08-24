<script setup lang='ts'>
import type { PropType } from 'vue';
import type { IProfile } from '~/types';


const props = defineProps({
    profile: {
        type: Object as PropType<IProfile>,
    },
    subtitle: {
        type: String
    }
});
</script>
<template>
    <FlipCard :img="profile?.avatar || '/img/profile-blank.png'">
        <template #front>
            <h2 class="text-xl font-semibold text-gray-200 md:text-2xl">{{ subtitle }}</h2>
            <div class="absolute bottom-16">
                <h1 class="mb-2 text-2xl font-semibold text-white md:text-4xl -translate-x-14">{{ profile?.fullName }}
                </h1>
                <h1 class="mb-2 text-base font-medium text-white md:text-xl">{{ profile?.NIM }}</h1>
            </div>
            <div></div>
        </template>
        <template #back>
            <div>
                <h1 class="mb-2 text-xl font-semibold text-white md:text-3xl -translate-x-14">{{ profile?.fullName }}
                </h1>
                <dl class="max-w-md text-gray-200 dark:text-white">
                    <div class="flex flex-col pb-2">
                        <dt class="text-gray-400 dark:text-gray-300">Email address</dt>
                        <hr class="mb-1 w-[105px] h-[1px] bg-gray-100 border-0 rounded dark:bg-gray-200">
                        <dd class="text-base font-semibold md:text-lg">{{ profile?.email }}</dd>
                    </div>
                    <div class="flex flex-col py-2">
                        <dt class="text-gray-400 dark:text-gray-300">Class</dt>
                        <hr class="mb-1 w-[45px] h-[1px] bg-gray-100 border-0 rounded dark:bg-gray-200">
                        <dd class="text-base font-semibold md:text-lg">{{ profile?.class }}</dd>
                    </div>
                    <div class="flex flex-col py-2">
                        <dt class="text-gray-400 dark:text-gray-300">Semester</dt>
                        <hr class="mb-1 w-[75px] h-[1px] bg-gray-100 border-0 rounded dark:bg-gray-200">
                        <dd class="text-base font-semibold md:text-lg">{{ profile?.semester }}</dd>
                    </div>
                    <div class="flex flex-col pt-2">
                        <dt class="text-gray-400 dark:text-gray-300">Entered year</dt>
                        <hr class="mb-1 w-[98px] h-[1px] bg-gray-100 border-0 rounded dark:bg-gray-200">
                        <dd class="text-base font-semibold md:text-lg">{{ profile?.enteredYear }}</dd>
                    </div>
                </dl>
            </div>
        </template>
    </FlipCard>
</template>
<style scoped></style>