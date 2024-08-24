<script setup lang='ts'>
useHead({
    titleTemplate(title) {
        return title + ' | Himatika'
    },
})
import type { ILink, IUser } from "~/types";
const { status, data: user, signOut } = useAuth();
const isLoggedIn = computed(() => status.value == 'authenticated' ? true : false);

const colorMode = useColorMode();
const router = useRouter();
const route = useRoute();
const isDarkMode = computed(() => colorMode.value == 'light' ? true : false);
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
const itemsIsLogged = (user: IUser) => [
    [{
        label: user.username,
        slot: 'account',
        disabled: true
    }],
    [{
        label: 'Profile',
        icon: 'i-heroicons-user',
        to: '/dashboard/profile'
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
const items = computed(() => isLoggedIn.value ? itemsIsLogged(user.value) : itemsNotLogged);
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
                            <NuxtImg v-if="isLoggedIn" :src="user.profile.avatar || '/img/profile-blank.png'" width="24"
                                height="24" class="object-cover rounded-full max-w-8 aspect-square" />
                            <UAvatar v-else icon="i-heroicons-arrow-right-end-on-rectangle" />

                            <template #account="{ item }">
                                <div class="text-left">
                                    <p>
                                        Signed in as
                                    </p>
                                    <p class="font-medium text-gray-900 truncate dark:text-white">
                                        {{ item.label }}
                                    </p>
                                </div>
                            </template>

                            <template #item="{ item }">
                                <NuxtLink :to="item.to" class="">
                                    <UIcon :name="item.icon" v-if="item.icon"
                                        class="flex-shrink-0 w-4 h-4 text-gray-400 dark:text-gray-500 ms-auto me-2" />
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
                    <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
                        id="navbar-user">
                        <ul
                            class="flex flex-col p-4 mt-4 font-medium border border-gray-300 rounded-lg shadow-md md:p-0 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent md:shadow-none">
                            <li v-for="nav, i in navigation" :key="i">
                                <a :href="nav.href"
                                    class="block px-3 py-2 font-sans font-semibold text-gray-700 bg-transparent rounded md:p-0 dark:text-gray-200">{{
                                        nav.name }}</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </ClientOnly>

        <main>
            <div class="px-3 py-6 mx-auto sm:px-6 lg:px-8 dark:bg-indigo-900/40 bg-gray-200/40">
                <slot />
                <Footer />
            </div>
        </main>
    </div>
</template>
<style scoped></style>