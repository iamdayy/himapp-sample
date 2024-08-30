<script setup lang='ts'>
import type { IProfile } from '~/types';

const toast = useToast();
const modal = useModal();
const { $api } = useNuxtApp();

const emit = defineEmits(["triggerRefresh"]);
const loading = ref<boolean>(false);
const colleger = ref<IProfile>({
    fullName: "",
    NIM: 0,
    email: "",
    phone: "",
    avatar: "/profile-blank.png",
    religion: "",
    sex: "male",
    birth: {
        place: "",
        date: new Date()
    },
    citizen: "",
    address: {
        fullAddress: "",
        village: "",
        district: "",
        city: "",
        province: "",
        country: "",
        zip: 0o0
    },
    class: "",
    semester: 1,
    status: "free",
});

const addColleger = async () => {
    loading.value = true;
    try {
        const added = await $api("/api/profile", {
            method: "post",
            body: colleger.value
        });
        if (added.statusCode != 200) {
            toast.add({ title: "Failed to add new Colleger", description: added.statusMessage });
        }
        emit("triggerRefresh");
        toast.add({ title: added.statusMessage! });
        modal.close();
    } catch (error: any) {
        toast.add({ title: "Failed to add new Colleger", description: error.message });
        loading.value = false;
    }
}

// Responsive design
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 640);
const isTablet = computed(() => width.value >= 640 && width.value < 1024);

// Responsive UI sizes based on screen width
const responsiveUISizes = computed(() => ({
    input: isMobile.value ? 'sm' : 'md',
    button: isMobile.value ? 'sm' : isTablet.value ? 'md' : 'lg',
    select: isMobile.value ? 'sm' : 'md',
}));
</script>
<template>
    <UModal :fullscreen="isMobile">
        <UCard :ui="{ background: 'bg-gray-200 dark:bg-gray-800' }">
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 class="text-xl font-semibold dark:text-gray-200">New Member</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div class="p-4 space-y-4 sm:p-6 sm:space-y-6">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-6 sm:gap-6">
                    <div class="col-span-1 sm:col-span-6">
                        <label for="fullName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Full
                            Name</label>
                        <UInput type="text" name="fullName" id="fullName" placeholder="Andrea Hirata"
                            v-model="colleger.fullName" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-3">
                        <label for="email"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                        <UInput type="email" name="email" id="email" placeholder="example@company.com"
                            v-model="colleger.email" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-3">
                        <label for="phone-number"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone
                            Number</label>
                        <UInput type="text" name="phone-number" id="phone-number" placeholder="e.g. +(12)3456 789"
                            v-model="colleger.phone" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-6">
                        <label for="birth"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Birth</label>
                        <div class="flex flex-col sm:flex-row">
                            <UInput type="text" name="birth" id="birth" placeholder="Jakarta"
                                v-model="colleger.birth.place" required :size="responsiveUISizes.input"
                                class="mb-2 sm:mb-0 sm:mr-2" />
                            <div class="flex items-center">
                                <VDatePicker id="date" v-model="colleger.birth.date" mode="date">
                                    <template #default="{ togglePopover }">
                                        <button @click="togglePopover">
                                            <Icon name="solar:calendar-date-outline"
                                                class="w-6 h-6 mx-2 text-gray-400 hover:text-blue-600" />
                                        </button>
                                    </template>
                                </VDatePicker>
                                <label class="block text-sm font-medium text-gray-900 dark:text-white">
                                    {{ colleger.birth.date.toLocaleDateString() }}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-1 sm:col-span-2">
                        <label for="sex"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sex</label>
                        <USelect id="sex"
                            :options="[{ key: 'male', label: 'Laki-Laki' }, { key: 'female', label: 'Perempuan' }]"
                            v-model="colleger.sex" :size="responsiveUISizes.select" />
                    </div>
                    <div class="col-span-1 sm:col-span-2">
                        <label for="religion"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Religion</label>
                        <UInput type="text" name="religion" id="religion" placeholder="Islam"
                            v-model="colleger.religion" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-2">
                        <label for="citizen"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Citizen</label>
                        <UInput type="text" name="citizen" id="citizen" placeholder="indonesia"
                            v-model="colleger.citizen" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="inline-flex items-center justify-center w-full col-span-1 sm:col-span-6">
                        <hr class="w-full h-px my-2 bg-gray-800 border-0 dark:bg-gray-700">
                        <span
                            class="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-gray-200 left-1/2 dark:text-white dark:bg-gray-800">Address</span>
                    </div>
                    <div class="col-span-1 sm:col-span-6">
                        <label for="full-address"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Full
                            Address</label>
                        <UTextarea id="full-address" rows="4" v-model="colleger.address.fullAddress"
                            placeholder="e.g jl.kebayoran lama no. 32" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-3">
                        <label for="village"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Village</label>
                        <UInput type="text" name="village" id="village" placeholder="Paesan"
                            v-model="colleger.address.village" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-3">
                        <label for="district"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">District</label>
                        <UInput type="text" name="district" id="district" placeholder="Kedungwuni"
                            v-model="colleger.address.district" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-3">
                        <label for="city"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City</label>
                        <UInput type="text" name="city" id="city" placeholder="Pekalongan"
                            v-model="colleger.address.city" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-3">
                        <label for="province"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Province</label>
                        <UInput type="text" name="province" id="province" placeholder="Jawa Tengah"
                            v-model="colleger.address.province" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-3">
                        <label for="country"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Country</label>
                        <UInput type="text" name="country" id="country" placeholder="indonesia"
                            v-model="colleger.address.country" required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-3">
                        <label for="zip" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Zip
                            Code</label>
                        <UInput type="number" name="zip" id="zip" placeholder="31100" v-model="colleger.address.zip"
                            required :size="responsiveUISizes.input" />
                    </div>
                    <div class="inline-flex items-center justify-center w-full col-span-1 sm:col-span-6">
                        <hr class="w-full h-px my-2 bg-gray-800 border-0 dark:bg-gray-700">
                        <span
                            class="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">Academic</span>
                    </div>
                    <div class="col-span-1 sm:col-span-3">
                        <label for="NIM"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                        <UInput type="number" name="NIM" id="NIM" placeholder="10220023" v-model="colleger.NIM" required
                            :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-1">
                        <label for="semester"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Semester</label>
                        <UInput type="number" name="semester" id="semester" placeholder="1" v-model="colleger.semester"
                            required :size="responsiveUISizes.input" />
                    </div>
                    <div class="col-span-1 sm:col-span-2">
                        <label for="class"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Class</label>
                        <UInput type="text" name="class" id="class" placeholder="IM24A" v-model="colleger.class"
                            required :size="responsiveUISizes.input" />
                    </div>
                </div>
                <UButton type="submit" @click="addColleger" block :loading="loading" :size="responsiveUISizes.button">
                    Add New Colleger
                </UButton>
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>