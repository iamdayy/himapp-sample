<script setup lang='ts'>
import { useWindowSize } from '@vueuse/core';
import type { IAgenda } from '~/types';

/**
 * Access the color mode of the application
 */
const colorMode = useColorMode();

/**
 * Access the API instance from the Nuxt app
 */
const { $api } = useNuxtApp();

/**
 * Computed property to determine if dark mode is active
 */
const isDarkMode = computed(() => colorMode.value === 'dark');

/**
 * Fetch agendas data from the API
 */
const { data: agendas } = useAsyncData(() => $api<IAgenda[]>("/api/agenda"));

/**
 * Reactive reference for the selected date
 */
const date = ref<Date>();

/**
 * Reactive reference for the selected agenda
 */
const Agenda = ref<IAgenda>();

/**
 * Computed property to get and set the current agenda
 */
const agenda = computed<IAgenda | undefined>({
    get() {
        if (Agenda.value) {
            return Agenda.value;
        }
        if (agendas.value) {
            const parseDate = (date: string) => new Date(date.replace(/(\d{2})\/(\d{2})\/(\d{4})/g, '$2/$1/$3'));
            const diff = (date: any, now: Date) => (parseDate(date).getTime() - now.getTime());
            const agds = agendas.value?.sort(({ date: date1 }, { date: date2 }) => {
                const diff1 = diff(date1, new Date());
                const diff2 = diff(date2, new Date());
                if (diff1 < 0) return 1;
                if (diff2 < 0) return -1;
                return diff1 - diff2;
            });
            return agds![0];
        }
        return undefined;
    },
    set(newVal) {
        Agenda.value = newVal;
    }
});

/**
 * Computed property to generate calendar attributes for agendas
 */
const attributes = computed(() => [
    ...<[]>agendas.value?.map(agenda => ({
        dot: 'green',
        content: 'green',
        dates: agenda.date,
        popover: {
            label: agenda.title
        }
    }))
]);

/**
 * Function to select an agenda by its ID
 * @param {string} id - The ID of the agenda to select
 */
const pickDetail = (id: string) => {
    if (agendas.value) {
        const index = agendas.value.findIndex((agenda) => agenda.title === id);
        agenda.value = agendas.value[index];
    }
};

/**
 * Headers for the committee table
 */
const committeeHeaders = [
    {
        key: 'name',
        label: 'Name'
    },
    {
        key: 'job',
        label: 'Job'
    }
];

/**
 * Use VueUse's useWindowSize composable for responsive design
 */
const { width } = useWindowSize();

/**
 * Computed property to determine if the screen is mobile
 */
const isMobile = computed(() => width.value < 768);

/**
 * Computed property for responsive UI size
 */
const uiSize = computed(() => isMobile.value ? 'sm' : 'md');

/**
 * Computed property for responsive class names
 */
const responsiveClasses = computed(() => ({
    cardHeader: isMobile.value ? 'text-2xl' : 'text-4xl',
    calendarWrapper: isMobile.value ? 'w-full' : 'w-1/3',
    eventDetailsWrapper: isMobile.value ? 'w-full mt-4' : 'w-2/3 ml-4',
    eventTitle: isMobile.value ? 'text-xl' : 'text-2xl',
    listItem: isMobile.value ? 'text-sm' : 'text-base',
    icon: isMobile.value ? 'w-3 h-3' : 'w-4 h-4',
}));
</script>

<template>
    <UCard>
        <template #header>
            <h2 :class="['font-extrabold dark:text-white', responsiveClasses.cardHeader]">Agendas</h2>
        </template>
        <div class="flex flex-col w-full gap-3 md:flex-row">
            <clientOnly>
                <div :class="['mx-auto shadow-lg', responsiveClasses.calendarWrapper]">
                    <VCalendar v-if="agendas" expanded :attributes="attributes" class="shadow-lg" :is-dark="isDarkMode"
                        @dayclick="day => date = day.date">
                        <template #footer>
                            <div class="px-2 pb-3">
                                <div class="mx-auto">
                                    <div class="pt-2 border-t border-gray-800 dark:border-gray-700">
                                        <div v-for="agenda, i in agendas?.filter((agenda: IAgenda) => new Date(agenda.date).toDateString() == new Date(date!).toDateString())"
                                            :key="i"
                                            class="flex flex-col gap-2 px-4 py-2 cursor-pointer md:flex-row md:items-center hover:bg-gray-200 rounded-3xl"
                                            @click="pickDetail(agenda.title)">
                                            <p
                                                class="text-xs font-normal text-gray-500 md:text-sm dark:text-gray-400 shrink-0">
                                                {{ `${new Date(agenda.date).getHours()}:${new
                                                    Date(agenda.date).getMinutes()}` }}
                                            </p>
                                            <h3
                                                class="text-base font-semibold text-gray-600 md:text-lg dark:text-white">
                                                {{ agenda.title }}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </VCalendar>
                </div>
            </clientOnly>
            <div :class="['px-4 py-4 border-gray-400', responsiveClasses.eventDetailsWrapper]">
                <h5 v-if="!agenda"
                    class="my-12 mb-4 text-2xl font-semibold text-center text-yellow-300 dark:text-yellow-200">
                    No Agenda Selected
                </h5>
                <div v-else>
                    <h5 :class="['mb-4 font-medium text-gray-500 dark:text-gray-400', responsiveClasses.eventTitle]">
                        {{ agenda?.title }}
                    </h5>
                    <ul role="list" class="my-5 space-y-3">
                        <li v-for="(item, index) in ['date', 'time', 'location', 'visibility', 'description']"
                            :key="index" class="flex items-center">
                            <Icon
                                :name="['solar:calendar-outline', 'solar:clock-circle-outline', 'solar:map-point-outline', 'solar:lock-keyhole-unlocked-outline', 'solar:document-outline'][index]"
                                :class="['flex-shrink-0 text-blue-600 dark:text-blue-500', responsiveClasses.icon]" />
                            <span
                                :class="['font-normal leading-tight text-gray-500 dark:text-gray-400 ms-2', responsiveClasses.listItem]">
                                <template v-if="item === 'date'">
                                    {{ new Date(agenda.date).toLocaleDateString('id-Id', { dateStyle: 'full' }) }}
                                </template>
                                <template v-else-if="item === 'time'">
                                    {{ new Date(agenda.date).toLocaleTimeString('id-Id', { timeStyle: 'full' }) }}
                                </template>
                                <template v-else-if="item === 'location'">
                                    {{ agenda.at }}
                                </template>
                                <template v-else-if="item === 'visibility'">
                                    {{ agenda?.canSee }}
                                </template>
                                <template v-else-if="item === 'description'">
                                    <TiptapShow :content="agenda.description" />
                                </template>
                            </span>
                        </li>
                        <li v-if="agenda.committee">
                            <span class="flex items-center">
                                <Icon name="solar:users-group-two-rounded-outline"
                                    :class="['flex-shrink-0 text-blue-600 dark:text-blue-500', responsiveClasses.icon]" />
                                <span
                                    :class="['font-normal leading-tight text-gray-500 dark:text-gray-400 ms-2', responsiveClasses.listItem]">
                                    Committee
                                </span>
                            </span>
                            <div class="relative my-2 mt-4 overflow-auto sm:rounded-lg ms-6 max-h-36 md:max-h-48">
                                <UTable :rows="agenda.committee" :columns="committeeHeaders"
                                    :ui="{ td: { base: responsiveClasses.listItem } }">
                                    <template #name-data="{ row }">
                                        {{ row.user.fullName }}
                                    </template>
                                </UTable>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </UCard>
</template>
