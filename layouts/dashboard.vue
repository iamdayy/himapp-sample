<script setup lang='ts'>
import type { ILink } from "~/types";
const colorMode = useColorMode();
const { status, data: user, signOut } = useAuth();

const isLoggedIn = computed(() => status.value == 'authenticated' ? true : false);
const isDarkMode = computed(() => colorMode.value == 'light' ? true : false);

const router = useRouter();
const route = useRoute();

const changeMode = () => {
    if (colorMode.value == 'light') {
        colorMode.value = 'dark';
    } else {
        colorMode.value = 'light';
    }
}

const navigation: ILink[] = [
    { name: 'Home', href: '/', current: true },
    { name: 'About', href: '#about', current: false },
    { name: 'Events', href: '#events', current: false },
    { name: 'Projects', href: '#projects', current: false },
] as ILink[]
const itemsIsLogged = [
    [{
        label: 'User',
        slot: 'account',
        disabled: true
    }],
    [{
        label: 'Profile',
        icon: 'i-heroicons-user'
    }],
    [{
        label: 'Dashboard',
        icon: 'i-heroicons-rectangle-group',
        to: '/dashboard'
    }, {
        label: 'Events',
        icon: 'i-heroicons-calendar',
        to: '/dashboard/events'
    }, {
        label: 'Projects',
        icon: 'i-heroicons-code-bracket',
        to: '/dashboard/projects'
    }],
    [{
        label: 'Sign out',
        slot: 'SignOut',
        icon: 'i-heroicons-arrow-right-start-on-rectangle'
    }]
]
const itemsNotLogged = [
    [
        {
            label: 'Sign In',
            to: '/login'
        },
        {
            label: 'Sign Up',
            to: '/register'
        }
    ]
]
const items = computed(() => isLoggedIn.value ? itemsIsLogged : itemsNotLogged);
</script>
<template>
    <div class="min-h-full">
        <ClientOnly>
            <nav
                class="absolute z-10 w-full bg-white border-gray-200 md:bg-transparent bg-opacity-35 backdrop-blur-md md:border-none">
                <div class="flex flex-wrap items-center justify-between p-4 mx-auto">
                    <NuxtLink to="/" class="flex items-center space-x-3 rtl:space-x-reverse" v-if="route.path == '/'">
                        <NuxtImg src="/img/logo.png" class="h-8" alt="Logo" />
                    </NuxtLink>
                    <UButton icon="i-heroicons-chevron-left" size="xl" variant="link" color="gray" v-else
                        @click="router.back()" />
                    <div class="flex items-center space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
                        <UToggle on-icon="i-heroicons-sun" off-icon="i-heroicons-moon" :model-value="isDarkMode"
                            @change="changeMode" size="lg" class="mr-4" />
                        <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text' } }"
                            :popper="{ placement: 'bottom-start' }">
                            <UAvatar :icon="!isLoggedIn ? 'i-heroicons-arrow-right-end-on-rectangle' : undefined"
                                :src="isLoggedIn ? user.profile.avatar : undefined" />

                            <template #account="{ item }">
                                <div class="text-left">
                                    <p>
                                        Signed in as
                                    </p>
                                    <p class="truncate font-medium text-gray-900 dark:text-white">
                                        {{ user.profile.username }}
                                    </p>
                                </div>
                            </template>

                            <template #item="{ item }">
                                <NuxtLink :to="item.to" class="">
                                    <UIcon :name="item.icon" v-if="item.icon"
                                        class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto me-2" />
                                    <span class="truncate">{{ item.label }}</span>
                                </NuxtLink>
                            </template>
                            <template #SignOut="{ item }">
                                <UButton @click="signOut({ callbackUrl: '/login' })" :icon="item.icon" variant="link"
                                    color="gray" :padded="false">
                                    <span class="truncate">{{ item.label }}</span>
                                </UButton>
                            </template>
                        </UDropdown>
                    </div>
                </div>
            </nav>
        </ClientOnly>

        <main>
            <div class="px-3 py-6 pt-20 mx-auto sm:px-6 lg:px-8 dark:bg-indigo-900/40 bg-gray-200/40">
                <slot />
                <Footer />
            </div>
        </main>
    </div>
</template>
<style scoped></style>