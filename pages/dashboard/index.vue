<script setup lang='ts'>
import type { ILink, IProfile, IProject } from "~/types";
definePageMeta({
    layout: false
});
const colorMode = useColorMode();
const { allPercentage, all, eventsMe, EventPercentage, projectsMe, ProjectPercentage } = useStats()
const { status, data: user } = useAuth();
const Project = computed<IProject | undefined>(() => {
    return projectsMe.value?.find((project) => new Date(project.deadline) > new Date(Date.now()))
});
const isLoggedIn = computed(() => status.value == 'authenticated' ? true : false);
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
const itemsIsLogged = [
    [{
        label: user.value.username,
        slot: 'account',
        disabled: true
    }],
    [{
        label: 'Profile',
        icon: 'i-heroicons-user'
    }],
    [{
        label: 'Dashboard',
        icon: 'i-heroicons-rectangle-group'
    }, {
        label: 'Events',
        icon: 'i-heroicons-calendar'
    }, {
        label: 'Projects',
        icon: 'i-heroicons-code-bracket'
    }],
    [{
        label: 'Sign out',
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
            label: 'Examples',
            icon: 'i-heroicons-light-bulb'
        },
        {
            label: 'Help',
            icon: 'i-heroicons-question-mark-circle'
        }
    ]
]
const items = computed(() => isLoggedIn.value ? itemsIsLogged : itemsNotLogged);

const carouselRef = ref()

onMounted(() => {
    setInterval(() => {
        if (!carouselRef.value) return

        if (carouselRef.value.page === carouselRef.value.pages) {
            return carouselRef.value.select(0)
        }

        carouselRef.value.next()
    }, 3000)
})
</script>
<template>
    <div class="min-h-full">
        <ClientOnly>
            <nav
                class="absolute z-10 w-full bg-white border-gray-200 md:bg-transparent bg-opacity-35 backdrop-blur-md md:border-none">
                <div class="flex flex-wrap items-center justify-between p-4 mx-auto">
                    <NuxtLink to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
                        <NuxtImg src="/img/logo.png" class="h-8" alt="Logo" />
                    </NuxtLink>
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
                                        {{ item.label }}
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
            <div class="px-3 py-6 pt-20 mx-auto sm:px-6 lg:px-8  dark:bg-indigo-900/40 bg-gray-200/40">
                <div class="flex px-4 py-3 w-full gap-3">
                    <UCard class="max-w-md md:block hidden w-full"
                        :ui="{ divide: 'divide-y divide-gray-200/60 dark:divide-gray-800/60' }">
                        <template #header>
                            <div class="flex w-full gap-2">
                                <UAvatar :src="user.profile.avatar" size="3xl" />
                                <div>
                                    <h2 class="text-4xl font-extrabold text-gray-800 dark:text-white">{{ user.username
                                        }}
                                    </h2>
                                    <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">{{
                                        user.profile.NIM }}
                                    </h2>
                                </div>
                            </div>
                        </template>
                        <UVerticalNavigation :links="links">
                            <template #default="{ link }">
                                <h2 class="text-xl font-semibold">{{ link.label }}</h2>
                            </template>
                        </UVerticalNavigation>
                    </UCard>
                    <div class="w-full">
                        <div class="w-full flex gap-2 mb-3">
                            <UCard class="w-full">
                                <template #header>
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Registered</h2>
                                </template>
                                <div class="flex w-full justify-between items-center mb-2">
                                    <h2 class="text-3xl text-bold text-gray-700 dark:text-gray-400">{{ all }}</h2>
                                    <UIcon name="i-heroicons-globe-alt" class="text-6xl" />
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div class="bg-blue-600 h-2.5 rounded-full" :style="`width: ${allPercentage}%`">
                                    </div>
                                </div>
                            </UCard>
                            <UCard class="w-full">
                                <template #header>
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Events</h2>
                                </template>
                                <div class="flex w-full justify-between items-center mb-2">
                                    <h2 class="text-3xl text-bold text-gray-700 dark:text-gray-400">{{ eventsMe.length
                                        }}</h2>
                                    <UIcon name="i-heroicons-calendar" class="text-6xl" />
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div class="bg-blue-600 h-2.5 rounded-full" :style="`width: ${EventPercentage}%`">
                                    </div>
                                </div>
                            </UCard>
                            <UCard class="w-full">
                                <template #header>
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Projects</h2>
                                </template>
                                <div class="flex w-full justify-between items-center mb-2">
                                    <h2 class="text-3xl text-bold text-gray-700 dark:text-gray-400">{{ projectsMe.length
                                        }}</h2>
                                    <UIcon name="i-heroicons-calendar" class="text-6xl" />
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div class="bg-blue-600 h-2.5 rounded-full" :style="`width: ${ProjectPercentage}%`">
                                    </div>
                                </div>
                            </UCard>
                        </div>
                        <UCard>
                            <template #header>
                                <div class="flex w-full justify-between">
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Events</h2>
                                    <NuxtLink to="">
                                        see more...
                                    </NuxtLink>
                                </div>
                            </template>
                            <UCarousel ref="carouselRef" :items="eventsMe" v-slot="{ item, index }"
                                :ui="{ item: 'w-full' }"
                                :prev-button="{ color: 'gray', icon: 'i-heroicons-arrow-left-20-solid', }"
                                :next-button="{ color: 'gray', icon: 'i-heroicons-arrow-right-20-solid', class: '-right-12' }"
                                arrows class="rounded-lg overflow-hidden">
                                <div class="px-8">
                                    <span
                                        class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Title</span>
                                    <h3
                                        class="ms-2 font-semibold self-center text-gray-500 text-md whitespace-nowrap dark:text-white/60">
                                        {{
                                            item.title
                                        }}
                                    </h3>

                                    <span
                                        class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Date</span>
                                    <h3
                                        class="ms-2 font-semibold self-center text-gray-500 text-md whitespace-nowrap dark:text-white/60">
                                        {{
                                            new Date(item.date).toLocaleDateString() }}
                                    </h3>

                                    <span class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">At</span>
                                    <h3
                                        class="ms-2 font-semibold self-center text-gray-500 text-md whitespace-nowrap dark:text-white/60">
                                        {{
                                            item.at
                                        }}
                                    </h3>

                                    <span
                                        class="mt-4 text-sm text-gray-400 whitespace-nowrap dark:text-white">Accessbility</span>
                                    <h3
                                        class="ms-2 font-semibold self-center text-gray-500 text-md whitespace-nowrap dark:text-white/60">
                                        {{
                                            item.canSee
                                        }}
                                    </h3>
                                </div>
                            </UCarousel>
                        </UCard>
                        <UCard>
                            <template #header>
                                <div class="flex w-full justify-between">
                                    <h2 class="text-xl font-semibold dark:text-gray-200">Projects</h2>
                                    <NuxtLink to="">
                                        see more...
                                    </NuxtLink>
                                </div>
                            </template>
                            <div v-if="Project" class="px-8 my-4">
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
                                    <!-- <Icon name="solar:check-circle-bold" class="w-6 h-6 text-green-400" v-if="!Project" />
              <Icon name="solar:close-circle-bold" class="w-6 h-6 text-red-600" v-else /> -->
                                </h3>
                                <!-- <div>
              <div class="flex justify-between mb-1">
                <span class="text-base font-medium text-blue-700 dark:text-white">Flowbite</span>
                <span class="text-sm font-medium text-blue-700 dark:text-white">45%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div class="bg-blue-600 h-2.5 rounded-full" style="width: 45%"></div>
              </div>
            </div> -->
                            </div>
                        </UCard>
                    </div>
                </div>
                <Footer />
            </div>
        </main>
    </div>
</template>
<style scoped></style>