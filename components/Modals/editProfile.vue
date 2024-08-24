<script setup lang='ts'>
import type { IProfile } from '~/types';

const toast = useToast();
const modal = useModal();
const { $api } = useNuxtApp();

const emit = defineEmits(["triggerRefresh", "returnObject"]);
const loading = ref<boolean>(false);
const props = defineProps({
    Member: Object as PropType<IProfile>,
    NIM: Number
});

const Member = ref<IProfile>({
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
});
const member = computed({
    get() {
        if (typeof props.Member == 'object') {
            return props.Member;
        }
        return Member.value;
    },
    set(val) {
        Member.value = val
    }
})

const Save = async () => {
    loading.value = true;
    try {
        const added = await $api("/api/profile", {
            method: "put",
            query: {
                NIM: props.NIM
            },
            body: member.value
        });
        if (added.statusCode != 200) {
            toast.add({ title: "Failed to update Member", description: added.statusMessage });
        }
        emit("triggerRefresh");
        toast.add({ title: added.statusMessage! });
        modal.close();
    } catch (error: any) {
        toast.add({ title: "Failed to update Member", description: error.message });
        loading.value = false;
    }
}
onMounted(async () => {
    if (props.NIM) {
        member.value = await $api<IProfile>('/api/profile', {
            query: {
                NIM: props.NIM
            }
        });
    }

})
</script>
<template>
    <UModal>
        <UCard>
            <template #header>
                <div class="flex justify-between w-full">
                    <h2 class="text-xl font-semibold dark:text-gray-200">Edit Member</h2>
                    <UButton icon="i-heroicons-x-mark" :padded="false" variant="link" color="gray"
                        @click="modal.close" />
                </div>
            </template>
            <div class="p-6 space-y-6">
                <div class="grid grid-cols-6 gap-6">
                    <div class="col-span-6">
                        <label for="fullName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Full
                            Name</label>
                        <UInput type="text" name="fullName" id="fullName" placeholder="Andrea Hirata"
                            v-model="member.fullName" required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="email"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                        <UInput type="email" name="email" id="email" placeholder="example@company.com"
                            v-model="member.email" required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="phone-number"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone
                            Number</label>
                        <UInput type="text" name="phone-number" id="phone-number" placeholder="e.g. +(12)3456 789"
                            v-model="member.phone" required />
                    </div>
                    <div class="col-span-6 sm:col-span-6">
                        <label for="birth"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Birth</label>
                        <div class="flex">
                            <UInput type="text" name="birth" id="birth" placeholder="Jakarta"
                                v-model="member.birth.place" required />
                            <VDatePicker id="date" v-model="member.birth.date" mode="date">
                                <template #default="{ togglePopover }">
                                    <button @click="togglePopover">
                                        <Icon name="solar:calendar-date-outline"
                                            class="w-6 h-6 mx-2 text-gray-400 hover:text-blue-600" />
                                    </button>
                                </template>
                            </VDatePicker>
                            <label class="block my-auto text-sm font-medium text-gray-900 dark:text-white">
                                {{ new Date(member.birth.date).toLocaleDateString() }}
                            </label>
                        </div>
                    </div>
                    <div class="col-span-3 sm:col-span-2">
                        <label for="sex"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sex</label>
                        <USelect id="sex"
                            :options="[{ key: 'male', label: 'Laki-Laki' }, { key: 'female', label: 'Perempuan' }]"
                            v-model="member.sex" />
                    </div>
                    <div class="col-span-3 sm:col-span-2">
                        <label for="religion"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Religion</label>
                        <UInput type="text" name="religion" id="religion" placeholder="Islam" v-model="member.religion"
                            required />
                    </div>
                    <div class="col-span-6 sm:col-span-2">
                        <label for="citizen"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Citizen</label>
                        <UInput type="text" name="citizen" id="citizen" placeholder="indonesia" v-model="member.citizen"
                            required />
                    </div>
                    <!--  -->
                    <!--  -->
                    <!-- Address Section -->
                    <!--  -->
                    <!--  -->
                    <div class="inline-flex items-center justify-center w-full col-span-6">
                        <hr class="w-full h-px my-2 bg-gray-800 border-0 dark:bg-gray-700">
                        <span
                            class="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">Address</span>
                    </div>
                    <div class="col-span-6">
                        <label for="full-address"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Full
                            Address</label>
                        <UTextarea id="full-address" rows="4" v-model="member.address.fullAddress"
                            placeholder="e.g jl.kebayoran lama no. 32" required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="village"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Village</label>
                        <UInput type="text" name="village" id="village" placeholder="Paesan"
                            v-model="member.address.village" required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="district"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">District</label>
                        <UInput type="text" name="district" id="district" placeholder="Kedungwuni"
                            v-model="member.address.district" required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="city"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City</label>
                        <UInput type="text" name="city" id="city" placeholder="Pekalongan" v-model="member.address.city"
                            required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="province"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Province</label>
                        <UInput type="text" name="province" id="province" placeholder="Jawa Tengah"
                            v-model="member.address.province" required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="country"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Country</label>
                        <UInput type="text" name="country" id="country" placeholder="indonesia"
                            v-model="member.address.country" required />
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="zip" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Zip
                            Code</label>
                        <UInput type="number" name="zip" id="zip" placeholder="31100" v-model="member.address.zip"
                            required />
                    </div>
                    <!--  -->
                    <!--  -->
                    <!-- Academic Section -->
                    <!--  -->
                    <!--  -->
                    <div class="inline-flex items-center justify-center w-full col-span-6">
                        <hr class="w-full h-px my-2 bg-gray-800 border-0 dark:bg-gray-700">
                        <span
                            class="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">Academic</span>
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label for="NIM"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">NIM</label>
                        <UInput type="number" name="NIM" id="NIM" placeholder="10220023" v-model="member.NIM"
                            required />
                    </div>
                    <div class="col-span-3 sm:col-span-1">
                        <label for="semester"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Semester</label>
                        <UInput type="number" name="semester" id="semester" placeholder="1" v-model="member.semester"
                            required />
                    </div>
                    <div class="col-span-3 sm:col-span-2">
                        <label for="class"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Class</label>
                        <UInput type="text" name="class" id="class" placeholder="IM24A" v-model="member.class"
                            required />
                    </div>
                </div>
                <UButton type="submit" block @click="$props.NIM ? Save() : $emit('returnObject', member)"
                    :loading="loading">
                    Save
                </UButton>
            </div>
        </UCard>
    </UModal>
</template>
<style scoped></style>