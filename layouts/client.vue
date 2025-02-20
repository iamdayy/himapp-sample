<script setup lang='ts'>
// Set up the head with a dynamic title template
useHead({
    titleTemplate(title) {
        return title ? `${title} | Himatika` : 'Himatika'
    },
})

// Import necessary types
import type { ILink, IUser } from "~/types";

// Set up authentication
const { status, data: user, signOut } = useAuth();
const isLoggedIn = computed(() => status.value === 'authenticated');

// Set up color mode
const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

// Set up router
const router = useRouter();
const route = useRoute();

// UI state
const isOpen = ref<boolean>(false)

/**
 * Toggle between light and dark mode
 */
const changeMode = () => {
    colorMode.value = colorMode.value === 'light' ? 'dark' : 'light';
}

// Navigation links
const navigation: ILink[] = [
    { name: 'Home', href: '/' },
    { name: 'News', href: '/news' },
    { name: 'Forum', href: '/forum' },
] as ILink[]

/**
 * Generate dropdown items for logged-in users
 * @param user - The logged-in user
 * @returns An array of dropdown item groups
 */
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
        label: 'Agendas',
        icon: 'i-heroicons-calendar',
        to: '/dashboard/agendas'
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

// Dropdown items for non-logged-in users
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

// Computed property to determine which items to show based on login status
const items = computed(() => isLoggedIn.value ? itemsIsLogged(user.value) : itemsNotLogged);
</script>
<template>
    <div class="min-h-full">
        <ClientOnly>
            <nav
                class="absolute z-10 w-full bg-white border-gray-200 md:bg-transparent bg-opacity-15 backdrop-blur-md md:border-none">
                <div class="flex flex-wrap items-center justify-between p-4 mx-auto">
                    <!-- Logo or back button -->
                    <NuxtLink to="/" class="items-center hidden space-x-3 md:flex rtl:space-x-reverse"
                        v-if="route.path == '/'">
                        <NuxtImg src="/img/logo.png" class="h-8" alt="Logo" />
                    </NuxtLink>
                    <UButton icon="i-heroicons-chevron-left" size="xl" variant="link" color="gray"
                        class="hidden md:block" v-else @click="router.back()" />

                    <!-- Mobile menu button -->
                    <UButton @click="isOpen = !isOpen" icon="i-heroicons-bars-3" class="block md:hidden" variant="link"
                        square />

                    <!-- Mobile slideover menu -->
                    <USlideover v-model="isOpen" :overlay="false" side="left">
                        <div class="flex-1 p-4">
                            <UButton icon="i-heroicons-chevron-left" size="xl" variant="link" color="gray"
                                class="block md:hidden" v-if="route.path != '/'"
                                @click="() => { router.back(); isOpen = false }" />
                            <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark-20-solid"
                                class="absolute z-10 flex sm:hidden end-5 top-5" square padded
                                @click="isOpen = false" />
                            <ul
                                class="p-4 mt-12 font-medium bg-transparent rounded-lg md:space-x-8 rtl:space-x-reverse">
                                <li v-for="nav, i in navigation" :key="i">
                                    <a :href="nav.href"
                                        class="block px-3 py-2 font-sans font-semibold text-gray-700 bg-transparent rounded md:p-0 dark:text-gray-200"
                                        @click="isOpen = false">{{
                                            nav.name }}</a>
                                </li>
                            </ul>
                        </div>
                    </USlideover>

                    <!-- User menu and theme toggle -->
                    <div class="flex items-center space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
                        <UToggle on-icon="i-heroicons-sun" off-icon="i-heroicons-moon" :model-value="isDarkMode"
                            @change="changeMode" size="lg" class="mr-4" />
                        <UDropdown :items="items"
                            :ui="{ width: 'max-w-36', item: { disabled: 'cursor-text select-text' } }"
                            :popper="{ placement: 'bottom-start' }">
                            <NuxtImg v-if="isLoggedIn" provider="localProvider"
                                :src="user.member.avatar || '/img/member-blank.png'"
                                class="object-cover rounded-full max-w-8 aspect-square" />
                            <UButton v-else icon="i-heroicons-arrow-right-end-on-rectangle" variant="link"
                                color="gray" />

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
                                <UButton @click="signOut()" :icon="item.icon" variant="link" color="gray"
                                    :padded="false">
                                    <span class="truncate">{{ item.label }}</span>
                                </UButton>
                            </template>
                        </UDropdown>
                    </div>

                    <!-- Desktop navigation menu -->
                    <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
                        id="navbar-user">
                        <ul
                            class="flex flex-col p-4 mt-4 font-medium border border-gray-300 rounded-lg shadow-md md:p-0 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent md:shadow-none">
                            <li v-for="nav, i in navigation" :key="i">
                                <NuxtLink :to="nav.href"
                                    class="block px-3 py-2 font-sans font-semibold text-gray-700 bg-transparent rounded md:p-0 dark:text-gray-200">
                                    {{
                                        nav.name }}</NuxtLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </ClientOnly>

        <main>
            <div class="px-2 py-6 mx-auto md:pt-16 md:px-8 dark:bg-indigo-900/40 bg-gray-200/40">
                <slot />
                <Footer />
            </div>
        </main>
    </div>
</template>
<style scoped></style>