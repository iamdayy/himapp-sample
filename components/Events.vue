<script setup lang='ts'>
import type { IEvent, IProfile } from '~/types';


const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value == 'dark' ? true : false);

const { data: events } = useAsyncData(() => $fetch<IEvent[]>("/api/event"));
const date = ref<Date>();
const Event = ref<IEvent>();
const event = computed<IEvent | undefined>({
    get() {
        if (Event.value) {
            return Event.value;
        }
        if (events.value) {
            const parseDate = (date: string) => new Date(date.replace(/(\d{2})\/(\d{2})\/(\d{4})/g, '$2/$1/$3'));

            const diff = (date: any, now: Date) => (parseDate(date).getTime() - now.getTime());
            const evs = events.value?.sort(({ date: date1 }, { date: date2 }) => {
                const diff1 = diff(date1, new Date);
                const diff2 = diff(date2, new Date);
                if (diff1 < 0) return 1;
                if (diff2 < 0) return -1;

                return diff1 - diff2;
            });
            const eventsNow = evs![0];
            return eventsNow!;

        }
        return undefined;
    },
    set(newVal) {
        Event.value = newVal
    }
})
const attributes = computed(() => [
    ...<[]>events.value?.map(event => ({
        dot: 'green',
        content: 'green',
        dates: event.date,
        popover: {
            label: event.title
        }
    }))
]);
const pickDetail = (id: string) => {
    if (events.value) {
        const index = events.value.findIndex((event) => event.title === id);
        event.value = events.value[index];
    }
}
</script>
<template>
    <UCard>
        <template #header>
            <h2 class="text-4xl font-extrabold dark:text-white">Events</h2>
        </template>
        <div class="flex flex-col w-full gap-3 px-8 py-12 md:flex-row">
            <clientOnly>
                <VCalendar v-if="events" :attributes="attributes" class="mx-auto shadow-lg md:max-w-sm"
                    :is-dark="isDarkMode" @dayclick="day => date = day.date">
                    <template #footer>
                        <div class="px-2 pb-3">
                            <div class="mx-auto">
                                <div class="pt-2 border-t border-gray-800 dark:border-gray-700">
                                    <div v-for="event, i in events?.filter((event: IEvent) => new Date(event.date).toDateString() == new Date(date!).toDateString())"
                                        :key="i"
                                        class="flex flex-col gap-2 px-4 py-2 cursor-pointer sm:gap-6 sm:flex-row sm:items-center hover:bg-gray-200 rounded-3xl"
                                        @click="pickDetail(event.title)">
                                        <p
                                            class="text-sm font-normal text-gray-500 sm:text-right dark:text-gray-400 shrink-0">
                                            {{ `${new Date(event.date).getHours()}:${new Date(event.date).getMinutes()}`
                                            }}
                                        </p>
                                        <h3 class="text-lg font-semibold text-gray-600 dark:text-white">
                                            {{ event.title }}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </VCalendar>
            </clientOnly>
            <div class="items-center justify-center w-full px-8 py-4 ml-2 border-gray-400">
                <h5 v-if="!event"
                    class="my-24 mb-4 text-3xl font-semibold text-center text-yellow-300 dark:text-yellow-200">No
                    Agenda
                    Selected</h5>
                <div v-else>
                    <h5 class="mb-4 text-2xl font-medium text-gray-500 dark:text-gray-400">{{ event?.title }}</h5>
                    <ul role="list" class="space-y-5 my-7">
                        <li class="flex items-center">
                            <Icon name="solar:calendar-outline"
                                class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                            <span class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                new Date(event.date).toLocaleDateString() }}</span>
                        </li>
                        <li class="flex items-center">
                            <Icon name="solar:clock-circle-outline"
                                class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                            <span class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                new Date(event?.date).toLocaleTimeString() }}</span>
                        </li>
                        <li class="flex">
                            <Icon name="solar:map-point-outline"
                                class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                            <span class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                event?.at }}</span>
                        </li>
                        <li class="flex">
                            <Icon name="solar:lock-keyhole-unlocked-outline"
                                class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                            <span class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                event?.canSee }}</span>
                        </li>
                        <li class="flex">
                            <Icon name="solar:document-outline"
                                class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                            <span class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                event?.description }}</span>
                        </li>
                        <li v-if="event.committee">
                            <span class="flex">
                                <Icon name="solar:users-group-two-rounded-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">
                                    Committee</span>
                            </span>
                            <div class="relative my-3 mt-6 overflow-auto sm:rounded-lg ms-8 max-h-48">
                                <table
                                    class="w-full text-sm text-left text-gray-500 bg-gray-100 shadow-md rtl:text-right dark:text-gray-400 dark:bg-gray-800">
                                    <tbody>
                                        <tr v-for="ev, i in event.committee">
                                            <td class="px-6 py-4 border-gray-200 dark:border-gray-600 border-e">
                                                {{ (ev.user as IProfile).fullName }}
                                            </td>
                                            <td class="px-6 py-4 border-gray-200 dark:border-gray-600 border-e">
                                                as
                                            </td>
                                            <td class="px-6 py-4">
                                                {{ ev.job }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </UCard>
</template>
