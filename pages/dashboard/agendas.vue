<script setup lang='ts'>
import { ModalsAddAgenda, ModalsEditAgenda, ModalsRegisteredUsers } from "#components";
import type { IAgenda, IProfile } from "~/types";

/**
 * Define page metadata
 */
definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
})

/**
 * Set page title
 */
useHead({
    title: "Dashboard"
});

/**
 * Initialize composables
 */
const toast = useToast();
const Modal = useModal();
const colorMode = useColorMode();
const { canMeRegister } = useCanMeRegister();
const { data: user } = useAuth();
const { agendas, refreshAgendas } = useAgendas();
const { isDept } = useDept();
const { isAdmin } = useRole();

/**
 * Computed property to determine if dark mode is active
 */
const isDarkMode = computed(() => colorMode.value == 'dark');

/**
 * Ref to store selected registered users
 */
const selectedRegistered = ref<Array<any>>([]);

/**
 * Form data for event registration
 */
const registerForm = ref({
    NIM: user.value?.profile.NIM,
    id: ""
})

/**
 * Ref to store the current event
 */
const Agenda = ref<IAgenda>();

/**
 * Computed property to get and set the current event
 */
const agenda = computed<IAgenda | undefined>({
    get() {
        if (Agenda.value) {
            return Agenda.value;
        }
        if (agendas.value) {
            const parseDate = (date: string) => new Date(date.replace(/(\d{2})\/(\d{2})\/(\d{4})/g, '$2/$1/$3'));
            const diff = (date: any, now: Date) => (parseDate(date).getTime() - now.getTime());
            const evs = agendas.value?.sort(({ date: date1 }, { date: date2 }) => {
                const diff1 = diff(date1, new Date);
                const diff2 = diff(date2, new Date);
                if (diff1 < 0) return 1;
                if (diff2 < 0) return -1;
                return diff1 - diff2;
            });
            return evs![0];
        }
        return undefined;
    },
    set(newVal) {
        Agenda.value = newVal
    }
})

/**
 * Function to select an event by its ID
 * @param {string} id - The ID of the event to select
 */
const pickDetail = (id: string) => {
    if (agendas.value) {
        const index = agendas.value.findIndex((agenda) => agenda.title === id);
        agenda.value = agendas.value[index];
    }
}

/**
 * Ref to store the picked date
 */
const pickDate = ref<Date | null>(null);

/**
 * Computed property to generate calendar attributes
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
 * Function to check if the current user is registered for an event
 * @param {IEvent} event - The event to check registration for
 * @returns {boolean} - True if the user is registered, false otherwise
 */
const isMeRegistered = (agenda: IAgenda): boolean => {
    const nim = user.value?.profile.NIM;
    const found = agenda.registered?.find((registered) => (registered.profile as IProfile).NIM == nim);
    return !!found;
}

/**
 * Function to open the Add Agenda modal
 */
const AddModal = () => {
    Modal.open(ModalsAddAgenda, {
        "onTrigger-refresh"() {
            refreshAgendas();
        }
    })
}

/**
 * Function to open the Edit Agenda modal
 */
const EditModal = () =>
    Modal.open(ModalsEditAgenda, {
        agenda: agenda.value!,
        "onTrigger-refresh"() {
            refreshAgendas();
        }
    })

/**
 * Function to open the Registered Users modal
 */
const registeredModal = () => {
    Modal.open(ModalsRegisteredUsers, {
        registered: agenda.value?.registered!,
        onChangeCheckItem(val) {
            selectedRegistered.value = val
        }
    })
}

/**
 * Function to register for an agenda
 * @param {string} id - The ID of the agenda to register for
 */
const register = async (id: string) => {
    registerForm.value.id = id;
    try {
        const response = await $fetch("/api/agenda/register", {
            method: "post",
            body: registerForm.value
        });
        refreshAgendas();
        toast.add({ title: response.statusMessage! });
    } catch (error: any) {
        toast.add({ title: "Failed to register " + agenda.value?.title });
    }
}


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
 * Detect large screen using windowSize
 */
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

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

/**
 * Computed property for responsive UI sizes
 */
const responsiveUISizes = computed(() => ({
    button: isMobile.value ? 'sm' : 'xl',
    input: isMobile.value ? 'sm' : 'md',
}));
</script>
<template>
    <div class="items-center justify-center mb-24 ">
        <div class="mx-auto text-center">
            <h2 class="text-4xl font-extrabold leading-tight tracking-tight text-gray-600 dark:text-white">
                Agenda
            </h2>
        </div>
        <UCard class="px-8 mt-6">
            <UButton label="New" :size="responsiveUISizes.button"
                class="my-3 text-lg font-bold text-gray-700 md:text-2xl dark:text-gray-700"
                :ui="{ rounded: 'rounded-full' }" @click="AddModal" v-if="isAdmin || isDept" block />
            <div class="flex flex-col w-full gap-3 py-4 md:py-12 md:flex-row">
                <ClientOnly>
                    <VCalendar :attributes="attributes" class="mx-auto shadow-lg md:max-w-sm" v-if="agendas"
                        @dayclick="(day: any) => pickDate = day.date" :expanded="isMobile" :is-dark="isDarkMode">
                        <template #footer>
                            <div class="px-2 pb-3">
                                <div class="mx-auto">
                                    <div class="pt-2 border-t border-gray-800 dark:border-gray-700">
                                        <div v-for="event, i in agendas?.filter((event: IAgenda) => new Date(event.date).toDateString() == new Date(pickDate!).toDateString())"
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
                <div :class="['px-4 py-4 border-gray-400', responsiveClasses.eventDetailsWrapper]">
                    <h5 v-if="!agenda"
                        class="my-12 mb-4 text-2xl font-semibold text-center text-yellow-300 dark:text-yellow-200">
                        No Agenda Selected
                    </h5>
                    <div v-else>
                        <div class="flex items-center justify-between mb-4">
                            <h5 :class="['font-medium text-gray-500 dark:text-gray-400', responsiveClasses.eventTitle]">
                                {{ agenda?.title }}
                            </h5>
                            <UButton v-if="isAdmin || isDept" icon="i-heroicons-pencil-square" color="gray"
                                variant="ghost" :ui="{ rounded: 'rounded-full' }" @click="EditModal"
                                :size="responsiveUISizes.button" />
                        </div>
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
                                        {{ agenda?.at }}
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
                            <li class="flex gap-2 mt-4">
                                <UButton class="flex-1" color="blue" block variant="solid"
                                    :size="responsiveUISizes.button" icon="i-heroicons-user-plus"
                                    :disabled="!canMeRegister(agenda.canRegister, agenda.date) || isMeRegistered(agenda)"
                                    @click="register(agenda?._id as string)">
                                    Register
                                </UButton>
                                <UButton class="flex-1" color="gray" block variant="solid"
                                    :size="responsiveUISizes.button" icon="i-heroicons-users"
                                    :disabled="!canMeRegister(agenda.canRegister, agenda.date) || !isMeRegistered(agenda) || isAdmin || isDept"
                                    @click="registeredModal">
                                    Registered
                                </UButton>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>
<style scoped></style>