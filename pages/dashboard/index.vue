<script setup lang='ts'>
import type { IProfile, IProject } from "~/types";

/**
 * Set page metadata
 */
definePageMeta({
    layout: false,
    middleware: 'auth'
});

/**
 * Set page title
 */
useHead({
    title: 'Home | Himatika Dashboard'
})

/**
 * Get color mode
 */
const colorMode = useColorMode();

/**
 * Get user stats
 */
const { all, eventsMe, projectsMe, allCanMeRegister, eventsCanMeRegistered, ProjectsCanMeRegistered } = useStats()

/**
 * Get authentication data
 */
const { status, data: user, signOut } = useAuth();

/**
 * Get the next upcoming project
 */
const Project = computed<IProject | undefined>(() => {
    return projectsMe.value?.find((project) => new Date(project.deadline) > new Date(Date.now()))
});

/**
 * Check if user is logged in
 */
const isLoggedIn = computed(() => status.value === 'authenticated');

/**
 * Check if dark mode is enabled
 */
const isDarkMode = computed(() => colorMode.value === 'dark');

/**
 * Slide-over state
 */
const openSlideOver = ref<boolean>(false)

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
 * Sidebar navigation links
 */
const links = computed(() => [
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
            label: 'Events',
            icon: 'i-heroicons-calendar',
            to: '/dashboard/events'
        },
        {
            label: 'Projects',
            icon: 'i-heroicons-code-bracket',
            to: '/dashboard/projects'
        },
        {
            label: 'Users',
            icon: 'i-heroicons-users',
            to: '/administrators/users'
        },
        {
            label: 'Post',
            icon: 'i-heroicons-clipboard-document-list',
            to: '/dashboard/posts'
        },
    ]
])

/**
 * Dropdown items based on login status
 */
const items = computed(() => isLoggedIn.value ? itemsIsLogged : itemsNotLogged);

/**
 * Reference to the carousel component
 */
const carouselRef = ref()

/**
 * Set up carousel auto-rotation
 */
onMounted(() => {
    setInterval(() => {
        if (!carouselRef.value) return

        if (carouselRef.value.page === carouselRef.value.pages) {
            return carouselRef.value.select(0)
        }

        carouselRef.value.next()
    }, 30000);
});
</script>
<template>
    <div class="">
        <ClientOnly>
            <nav
                class="absolute z-10 w-full bg-white border-gray-200 md:bg-transparent bg-opacity-15 backdrop-blur-md md:border-none">
                <div class="flex flex-wrap items-center justify-between p-4 mx-auto">
                    <NuxtLink to="/" class="items-center hidden space-x-3 md:flex rtl:space-x-reverse">
                        <NuxtImg src="/img/logo.png" class="h-8" alt="Logo" />
                    </NuxtLink>
                    <UButton variant="link" color="gray" :padded="false" icon="i-heroicons-bars-3" class="md:hidden"
                        @click="openSlideOver = !openSlideOver" />
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
                </div>
            </nav>
        </ClientOnly>
        <main>
            <div class="px-3 py-6 pt-20 mx-auto sm:px-6 lg:px-8 dark:bg-indigo-900/40 bg-gray-200/40">
                <div class="flex flex-col w-full px-4 py-3 space-y-6 md:flex-row md:space-y-0 md:space-x-6">
                    <UCard class="hidden w-full md:w-1/3 lg:w-1/4 md:block"
                        :ui="{ divide: 'divide-y divide-gray-200/60 dark:divide-gray-800/60' }">
                        <template #header>
                            <NuxtLink to="/dashboard/profile">
                                <div class="flex items-center w-full gap-6">
                                    <NuxtImg :src="user.profile.avatar || '/img/profile-blank.png'" width="180"
                                        height="180" class="object-cover rounded-full max-w-36 aspect-square" />
                                    <div>
                                        <h2 class="text-2xl font-extrabold text-gray-800 md:text-4xl dark:text-white">{{
                                            user.username
                                            }}
                                        </h2>
                                        <h2 class="text-lg font-semibold text-gray-800 md:text-xl dark:text-gray-200">{{
                                            user.profile.NIM }}
                                        </h2>
                                    </div>
                                </div>
                            </NuxtLink>
                        </template>
                        <UVerticalNavigation :links="links">
                            <template #default="{ link }">
                                <h2 class="text-lg font-semibold md:text-xl">{{ link.label }}</h2>
                            </template>
                        </UVerticalNavigation>
                    </UCard>
                    <div class="w-full space-y-6 md:w-2/3 lg:w-3/4">
                        <div class="flex flex-col w-full gap-2 sm:flex-row">
                            <UCard class="w-full sm:w-1/3">
                                <template #header>
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Registered</h2>
                                </template>
                                <div class="flex items-center justify-between w-full mb-2">
                                    <h2 class="text-3xl text-gray-700 text-bold dark:text-gray-400">{{ all }}</h2>
                                    <UIcon name="i-heroicons-globe-alt" class="text-6xl" />
                                </div>
                                <ClientOnly>
                                    <UMeter :value="all" :max="allCanMeRegister" indicator />
                                </ClientOnly>
                            </UCard>
                            <UCard class="w-full sm:w-1/3">
                                <template #header>
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Events</h2>
                                </template>
                                <div class="flex items-center justify-between w-full mb-2">
                                    <h2 class="text-3xl text-gray-700 text-bold dark:text-gray-400">{{
                                        eventsMe.length
                                    }}</h2>
                                    <UIcon name="i-heroicons-calendar" class="text-6xl" />
                                </div>
                                <ClientOnly>
                                    <UMeter :value="eventsMe.length" :max="eventsCanMeRegistered?.length" indicator />
                                </ClientOnly>
                            </UCard>
                            <UCard class="w-full sm:w-1/3">
                                <template #header>
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Projects</h2>
                                </template>
                                <div class="flex items-center justify-between w-full mb-2">
                                    <h2 class="text-3xl text-gray-700 text-bold dark:text-gray-400">{{
                                        projectsMe.length
                                    }}</h2>
                                    <UIcon name="i-heroicons-code-bracket" class="text-6xl" />
                                </div>
                                <ClientOnly>
                                    <UMeter :value="projectsMe.length" :max="ProjectsCanMeRegistered?.length"
                                        indicator />
                                </ClientOnly>
                            </UCard>
                        </div>
                        <UCard>
                            <template #header>
                                <div class="flex justify-between w-full">
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Events</h2>
                                    <NuxtLink to="/dashboard/events">
                                        see more...
                                    </NuxtLink>
                                </div>
                            </template>
                            <UCarousel ref="carouselRef" :items="eventsMe" v-slot="{ item, index }"
                                :ui="{ item: 'w-full' }"
                                :prev-button="{ color: 'gray', icon: 'i-heroicons-arrow-left-20-solid', class: 'left-0' }"
                                :next-button="{ color: 'gray', icon: 'i-heroicons-arrow-right-20-solid', class: 'right-0' }"
                                arrows class="overflow-hidden rounded-lg">
                                <div class="px-8">
                                    <span
                                        class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Title</span>
                                    <h3
                                        class="self-center font-semibold text-gray-500 ms-2 text-md whitespace-nowrap dark:text-white/60">
                                        {{
                                            item.title
                                        }}
                                    </h3>

                                    <span
                                        class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Date</span>
                                    <h3
                                        class="self-center font-semibold text-gray-500 ms-2 text-md whitespace-nowrap dark:text-white/60">
                                        {{
                                            new Date(item.date).toLocaleDateString() }}
                                    </h3>

                                    <span class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">At</span>
                                    <h3
                                        class="self-center font-semibold text-gray-500 ms-2 text-md whitespace-nowrap dark:text-white/60">
                                        {{
                                            item.at
                                        }}
                                    </h3>

                                    <span
                                        class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Accessbility</span>
                                    <h3
                                        class="self-center font-semibold text-gray-500 ms-2 text-md whitespace-nowrap dark:text-white/60">
                                        {{
                                            item.canSee
                                        }}
                                    </h3>
                                </div>
                            </UCarousel>
                        </UCard>
                        <UCard>
                            <template #header>
                                <div class="flex justify-between w-full">
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Projects</h2>
                                    <NuxtLink to="/dashboard/projects">
                                        see more...
                                    </NuxtLink>
                                </div>
                            </template>
                            <div v-if="Project" class="px-4 my-4 sm:px-8">
                                <span class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Name</span>
                                <h3 class="self-center text-gray-500 text-md whitespace-nowrap dark:text-white">{{
                                    Project?.title }}</h3>

                                <span
                                    class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Deadline</span>
                                <h3 class="self-center text-gray-500 text-md whitespace-nowrap dark:text-white">{{
                                    new Date(Project?.deadline!).toDateString() }}
                                </h3>

                                <span
                                    class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Contributors</span>
                                <div class="flex items-center">
                                    <div v-for="contributor, i in Project?.contributors" v-if="Project?.contributors"
                                        :key="i" class="-mx-1">
                                        <img :data-tooltip-target="`tooltip-${i}`"
                                            class="object-cover w-6 h-6 border rounded-full shadow-md border-white/30"
                                            :src="(contributor.profile as IProfile).avatar || '/img/profile-blank.png'"
                                            alt="">
                                        <div :id="`tooltip-${i}`" role="tooltip"
                                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                                            {{ `${(contributor.profile as IProfile).fullName}` }}
                                            <div class="tooltip-arrow" data-popper-arrow></div>
                                        </div>
                                    </div>
                                </div>

                                <span class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Public</span>
                                <h3 class="self-center text-gray-500 text-md whitespace-nowrap dark:text-white">
                                    {{ Project?.canSee }}
                                </h3>
                            </div>
                        </UCard>
                    </div>
                </div>
                <Footer />
            </div>
            <USlideover v-model="openSlideOver" :overlay="false" side="left">
                <div class="flex-1 p-4">
                    <NuxtLink to="/" class="text-2xl font-semibold">Himatika</NuxtLink>
                    <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark-20-solid"
                        class="absolute z-10 flex sm:hidden end-5 top-5" square padded @click="openSlideOver = false" />
                    <div class="mt-8">
                        <NuxtLink to="/dashboard/profile">
                            <div class="flex w-full gap-2">
                                <UAvatar :src="user.profile.avatar" size="lg" />
                                <div>
                                    <h2 class="text-xl font-extrabold text-gray-800 dark:text-white">{{
                                        user.username
                                        }}
                                    </h2>
                                    <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">{{
                                        user.profile.NIM }}
                                    </h2>
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
        </main>
    </div>
</template>
<style scoped></style>