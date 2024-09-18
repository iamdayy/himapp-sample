<script setup lang='ts'>

/**
 * Color mode management
 */
const colorMode = useColorMode();

/**
 * Authentication management
 */
const { status, data: user, signOut } = useAuth();

/**
 * Computed properties for authentication and color mode
 */
const isLoggedIn = computed(() => status.value === 'authenticated');
const isDarkMode = computed(() => colorMode.value === 'dark');

/**
 * Router and route instances
 */
const router = useRouter();
const route = useRoute();

/**
 * Toggle between light and dark mode
 */
const changeMode = () => {
    colorMode.value = colorMode.value === 'light' ? 'dark' : 'light';
}

/**
 * Dropdown items for logged-in users
 */
const itemsIsLogged = [
    [{
        label: user.value.username,
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
    [
        {
            label: 'Config',
            icon: 'i-heroicons-cog',
            to: '/administrators/config'
        },
        {
            label: 'Sign out',
            slot: 'SignOut',
            icon: 'i-heroicons-arrow-right-start-on-rectangle'
        }]
]

/**
 * Dropdown items for non-logged-in users
 */
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

/**
 * Computed property to determine which dropdown items to show based on login status
 */
const items = computed(() => isLoggedIn.value ? itemsIsLogged : itemsNotLogged);

/**
 * Set up page head with dynamic title
 */
useHead({
    titleTemplate(title) {
        return title ? `${title} | Himatika Dashboard` : 'Himatika Dashboard';
    },
});

/**
 * Slide-over state
 */
const openSlideOver = ref<boolean>(false)

/**
 * Vertical navigation links
 */
const links = [
    [
        {
            label: user.value.profile.fullName,
            disabled: true
        },
        {
            label: user.value.profile.email,
            icon: 'i-heroicons-envelope',
            disabled: true
        },
        {
            label: user.value.profile.phone,
            icon: 'i-heroicons-phone',
            disabled: true
        },
        {
            label: user.value.profile.class,
            icon: 'i-heroicons-building-library',
            disabled: true
        },
        {
            label: user.value.profile.semester,
            icon: 'i-heroicons-chevron-double-up',
            disabled: true
        },
    ],
    [
        {
            label: 'Dashboard',
            icon: 'i-heroicons-rectangle-group',
            to: '/dashboard'
        },
        {
            label: 'Agendas',
            icon: 'i-heroicons-calendar',
            to: '/dashboard/agendas'
        },
        {
            label: 'Projects',
            icon: 'i-heroicons-code-bracket',
            to: '/dashboard/projects'
        },
        {
            label: 'News',
            icon: 'i-heroicons-clipboard-document-list',
            to: '/dashboard/news'
        },
    ],
    [
        {
            label: 'Users',
            icon: 'i-heroicons-users',
            to: '/administrators/users'
        },
        {
            label: 'Organizers',
            icon: 'i-heroicons-user-group',
            to: '/administrators/organizers'
        },
        {
            label: 'Config',
            icon: 'i-heroicons-cog',
            to: '/administrators/config'
        },
        {
            label: 'Photos',
            icon: 'i-heroicons-photo',
            to: '/administrators/photos'
        },
    ],
]
</script>

<template>
    <div class="min-h-full">
        <ClientOnly>
            <!-- Navigation bar -->
            <nav
                class="absolute z-10 w-full bg-white border-gray-200 md:bg-transparent bg-opacity-15 backdrop-blur-md md:border-none">
                <div class="flex flex-wrap items-center justify-between p-4 mx-auto">
                    <!-- Mobile menu button -->
                    <UButton color="gray" variant="ghost" icon="i-heroicons-bars-3" @click="openSlideOver = true" />
                    <!-- User actions -->
                    <div class="flex items-center space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
                        <!-- Dark mode toggle -->
                        <UToggle on-icon="i-heroicons-moon" off-icon="i-heroicons-sun" :model-value="isDarkMode"
                            @change="changeMode" size="lg" class="mr-4" />

                        <!-- User dropdown -->
                        <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text' } }"
                            :popper="{ placement: 'bottom-start' }">
                            <NuxtImg v-if="isLoggedIn" provider="localProvider"
                                :src="user.profile.avatar || '/img/profile-blank.png'"
                                class="object-cover rounded-full max-w-8 aspect-square" />
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
                                <NuxtLink :to="item.to">
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
                </div>
            </nav>
        </ClientOnly>

        <!-- Main content -->
        <main class="px-2 py-6 pt-16 mx-auto md:px-8 dark:bg-indigo-900/40 bg-gray-200/40">
            <slot />
            <Footer />
        </main>

        <!-- Slide-over for mobile -->
        <USlideover v-model="openSlideOver" :overlay="false" side="left">
            <div class="flex-1 p-4 overflow-auto">
                <UButton icon="i-heroicons-chevron-left" size="xl" variant="link" color="gray" v-if="route.path != '/'"
                    @click="() => { router.back(); openSlideOver = false }" />
                <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark-20-solid"
                    class="absolute z-10 flex end-5 top-5" square padded @click="openSlideOver = false" />
                <div class="mt-8">
                    <NuxtLink to="/dashboard/profile">
                        <div class="flex w-full gap-2">
                            <UAvatar :src="user.profile.avatar" size="lg" />
                            <div>
                                <h2 class="text-xl font-extrabold text-gray-800 dark:text-white">{{
                                    user.username }}
                                </h2>
                                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{ user.profile.NIM
                                    }}</h2>
                            </div>
                        </div>
                    </NuxtLink>
                    <UVerticalNavigation :links="links">
                        <template #default="{ link }">
                            <h2 class="text-base font-semibold truncate">{{ link.label }}</h2>
                        </template>
                    </UVerticalNavigation>
                </div>
            </div>
        </USlideover>
    </div>
</template>

<style scoped></style>