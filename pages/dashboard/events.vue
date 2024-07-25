<script setup lang='ts'>
import { ModalsAddEvents, ModalsRegisteredEvents } from "#components";
import type { IEvent, IProfile } from "~/types";
const toast = useToast();
const Modal = useModal();
definePageMeta({
    middleware: "auth",
    layout: 'dashboard'
})
useHead({
    title: "Dashboard | Himatika"
});

const { canMeRegister } = useCanMeRegister();


const { data: user } = useAuth();

const { events, refreshEvents } = useEvents();
const { isDept } = useDept();
const { isAdmin } = useRole();

const selectedRegistered = ref<Array<any>>([]);

const registerForm = ref({
    NIM: user.value?.profile.NIM,
    id: ""
})

const Event = ref<IEvent | null>(null);
const event = computed<IEvent | null>({
    get() {
        if (Event.value) {
            return Event.value;
        }
        return null;
    },
    set(newVal) {
        Event.value = newVal
    }
})
const pickDetail = (id: string) => {
    if (events.value) {
        const index = events.value.findIndex((event) => event.title === id);
        Event.value = events.value[index];
    }
}

const pickDay = (day: any) => {
    pickDate.value = day.day;
}
const pickDate = ref<number | null>(null);

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


const isMeRegistered = (event: IEvent) => {
    const nim = user.value?.profile.NIM;
    const found = event.registered?.find((registered) => (registered.profile as IProfile).NIM == nim);
    if (!found) {
        return false;
    } else {
        return true;
    }
}

const newEvent = () => {
    Modal.open(ModalsAddEvents, {
        "onTrigger-refresh"() {
            refreshEvents();
        }
    })
}
const registeredEvent = () => {
    Modal.open(ModalsRegisteredEvents, {
        registered: Event.value?.registered,
        onChangeCheckItem(val) {
            selectedRegistered.value = val
        }
    })
}

const register = async (id: string) => {
    registerForm.value.id = id;
    try {
        const response = await $fetch("/api/event/register", {
            method: "post",
            body: registerForm.value
        });
        refreshEvents();
        toast.add({ title: response.statusMessage! });
    } catch (error: any) {
        toast.add({ title: "Failed to register " + Event.value?.title });
    }
}
</script>
<template>
    <div class="items-center justify-center mb-24 ">
        <div class="mx-auto text-center">
            <h2 class="text-4xl font-extrabold leading-tight tracking-tight text-gray-600 dark:text-white">
                Agenda
            </h2>
        </div>
        <UCard class="mt-6">
            <UButton label="New" class="mx-auto" @click="newEvent" v-if="isAdmin || isDept" />
            <div class="flex flex-col w-full gap-3 px-8 py-12 md:flex-row">
                <VCalendar :attributes="attributes" class="mx-auto shadow-lg md:max-w-sm" transparent
                    @dayclick="pickDay" :is-dark="{ selector: ':root', darkClass: 'dark' }">
                    <template #footer>
                        <div class="px-2 pb-3">
                            <div class="mx-auto">
                                <div class="pt-2 border-t border-gray-800 dark:border-gray-700">
                                    <div v-for="event, i in events?.filter((event: IEvent) => new Date(event.date).getDate() == pickDate)"
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
                <div class="w-full px-8 py-4 bg-gray-100 border border-gray-400 rounded-lg shadow-lg dark:bg-gray-800">
                    <h5 v-if="!Event"
                        class="my-24 mb-4 text-3xl font-semibold text-center text-yellow-300 dark:text-yellow-200">No
                        Agenda
                        Selected</h5>
                    <div v-else>
                        <div class="flex justify-between w-full">
                            <h5 class="mb-4 text-2xl font-medium text-gray-500 dark:text-gray-400">{{ Event?.title }}
                            </h5>
                            <!-- <ModalsEventsEdit :identifier="Event._id as string" @trigger-refresh="refreshEvents"
                                v-if="isAdmin || isDept" /> -->
                        </div>
                        <ul role="list" class="space-y-5 my-7">
                            <li class="flex items-center">
                                <Icon name="solar:calendar-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        new Date(Event.date).toLocaleDateString() }}</span>
                            </li>
                            <li class="flex items-center">
                                <Icon name="solar:clock-circle-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        new Date(Event?.date).toLocaleTimeString() }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:map-point-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        Event?.at }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:eye-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        Event?.canSee }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:document-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        Event?.description }}</span>
                            </li>
                            <li v-if="Event.committee">
                                <span class="flex">
                                    <Icon name="solar:users-group-two-rounded-outline"
                                        class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                    <span
                                        class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">
                                        Committee</span>
                                </span>
                                <div class="relative my-3 mt-6 overflow-auto sm:rounded-lg ms-8 max-h-48 no-scrollbar">
                                    <table
                                        class="w-full text-sm text-left text-gray-500 bg-gray-100 rtl:text-right dark:text-gray-400 dark:bg-gray-700">
                                        <tbody>
                                            <tr v-for="event, i in Event.committee">
                                                <td class="px-6 py-4 border-gray-200 border-e dark:border-gray-600">
                                                    {{ (event.user as IProfile).fullName }}
                                                </td>
                                                <td class="px-6 py-4 border-gray-200 border-e dark:border-gray-600">
                                                    as
                                                </td>
                                                <td class="px-6 py-4">
                                                    {{ event.job }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </li>

                            <UButton label="Registered" class="mx-auto" block @click="registeredEvent"
                                v-if="isAdmin || isDept" />
                        </ul>
                        <button type="submit"
                            v-if="canMeRegister(Event.canRegister, Event.date) && !isMeRegistered(Event)"
                            @click="register(Event?._id as string)"
                            class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Register this
                        </button>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>
<style scoped></style>