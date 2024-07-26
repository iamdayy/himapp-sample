<script setup lang='ts'>
import { ModalsAddEvents, ModalsEditEvents, ModalsRegisteredUsers } from "#components";
import type { IEvent, IProfile } from "~/types";

definePageMeta({
    middleware: "auth",
    layout: 'dashboard'
})

useHead({
    title: "Dashboard | Himatika"
});

const toast = useToast();
const Modal = useModal();

const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value == 'dark' ? true : false);


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
const Event = ref<IEvent>();
const event = computed<IEvent>({
    get() {
        if (Event.value) {
            return Event.value;
        }
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
    },
    set(newVal) {
        Event.value = newVal
    }
})
const pickDetail = (id: string) => {
    if (events.value) {
        const index = events.value.findIndex((event) => event.title === id);
        event.value = events.value[index];
    }
}

const pickDate = ref<Date | null>(null);

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

const AddModal = () => {
    Modal.open(ModalsAddEvents, {
        "onTrigger-refresh"() {
            refreshEvents();
        }
    })
}

const EditModal = () =>
    Modal.open(ModalsEditEvents, {
        event: event.value,
        "onTrigger-refresh"() {
            refreshEvents();
        }
    })

const registeredModal = () => {
    Modal.open(ModalsRegisteredUsers, {
        registered: event.value?.registered,
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
        <UCard class="px-8 mt-6">
            <UButton label="New" size="xl" class="text-2xl my-3 font-bold text-gray-700 dark:text-gray-700"
                :ui="{ rounded: 'rounded-full' }" @click="AddModal" v-if="isAdmin || isDept" block />
            <div class="flex flex-col w-full gap-3 py-12 md:flex-row">
                <ClientOnly>
                    <VCalendar :attributes="attributes" class="mx-auto shadow-lg md:max-w-sm" v-if="events"
                        @dayclick="(day: any) => pickDate = day.date" :is-dark="isDarkMode">
                        <template #footer>
                            <div class="px-2 pb-3">
                                <div class="mx-auto">
                                    <div class="pt-2 border-t border-gray-800 dark:border-gray-700">
                                        <div v-for="event, i in events?.filter((event: IEvent) => new Date(event.date).toDateString() == new Date(pickDate!).toDateString())"
                                            :key="i"
                                            class="flex flex-col gap-2 px-4 py-2 cursor-pointer sm:gap-6 sm:flex-row sm:items-center hover:bg-gray-200 rounded-3xl"
                                            @click="pickDetail(event.title)">
                                            <p
                                                class="text-sm font-normal text-gray-500 sm:text-right dark:text-gray-400 shrink-0">
                                                {{ `${new Date(event.date).getHours()}:${new
                                                    Date(event.date).getMinutes()}`
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
                </ClientOnly>
                <div class="w-full px-8 py-4 bg-gray-100 border border-gray-400 rounded-lg shadow-lg dark:bg-gray-800">
                    <h5 v-if="!event"
                        class="my-24 mb-4 text-3xl font-semibold text-center text-yellow-300 dark:text-yellow-200">No
                        Agenda
                        Selected</h5>
                    <div v-else>
                        <div class="flex justify-between w-full">
                            <h5 class="mb-4 text-2xl font-medium text-gray-500 dark:text-gray-400">{{ event?.title }}
                            </h5>
                            <UButton icon="i-heroicons-pencil-square" variant="link" @click="EditModal"
                                v-if="isAdmin || isDept" />
                        </div>
                        <ul role="list" class="space-y-5 my-7">
                            <li class="flex items-center">
                                <Icon name="solar:calendar-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        new Date(event.date).toLocaleDateString() }}</span>
                            </li>
                            <li class="flex items-center">
                                <Icon name="solar:clock-circle-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        new Date(event?.date).toLocaleTimeString() }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:map-point-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        event?.at }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:eye-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        event?.canSee }}</span>
                            </li>
                            <li class="flex">
                                <Icon name="solar:document-outline"
                                    class="flex-shrink-0 w-4 h-4 text-blue-600 dark:text-blue-500" />
                                <span
                                    class="text-base font-normal leading-tight text-gray-500 dark:text-gray-400 ms-3">{{
                                        event?.description }}</span>
                            </li>
                            <li v-if="event.committee">
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
                                            <tr v-for="ev, i in event.committee">
                                                <td class="px-6 py-4 border-gray-200 border-e dark:border-gray-600">
                                                    {{ (ev.user as IProfile).fullName }}
                                                </td>
                                                <td class="px-6 py-4 border-gray-200 border-e dark:border-gray-600">
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
                            <li v-if="event.registered">
                                <UButton label="Registered"
                                    class="mx-auto text-xl text-gray-700 font-semibold dark:text-gray-700" block
                                    @click="registeredModal" v-if="isAdmin || isDept" />
                            </li>
                        </ul>
                        <UButton type="submit"
                            v-if="canMeRegister(event.canRegister, event.date) && !isMeRegistered(event)"
                            class="text-2xl my-3 font-semibold" variant="outline" block
                            @click="register(event?._id as string)" label="Register This" />
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>
<style scoped></style>