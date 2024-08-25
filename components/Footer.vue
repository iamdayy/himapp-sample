<script setup lang='ts'>
// No setup logic needed for this component
</script>

<template>
    <!-- Footer component -->
    <footer class="w-full pt-8 mb-4">
        <div class="container px-4 mx-auto">
            <!-- Organization information section -->
            <div class="flex flex-col items-center md:flex-row">
                <!-- Organization logo -->
                <NuxtImg class="object-contain w-32 mb-4 md:mb-0" src="/img/logo.png" alt="Logo" />
                <div class="w-full text-center md:pl-4 md:text-left">
                    <!-- Organization name -->
                    <h4 class="text-2xl font-bold text-gray-600 md:text-3xl text-uppercase dark:text-gray-300">Himpunan
                        Mahasiswa
                        Informatika</h4>
                    <!-- Contact information -->
                    <h5 class="mt-2 mb-2 text-base text-gray-500 md:text-lg dark:text-gray-400">
                        <span>
                            Jl. Karangdowo No.9, Karangdowo Kec.Kedungwuni, Pekalongan, Jawa Tengah 51173 <br />
                        </span>
                        <span>
                            Email : him.tekom123@gmail.com <br />
                        </span>
                        <span>
                            Tlp/Wa : 088227561673
                        </span>
                    </h5>
                    <!-- Social media buttons -->
                    <div class="mt-4 mb-6">
                        <!-- Instagram button -->
                        <button
                            class="items-center justify-center w-10 h-10 mr-2 font-normal text-gray-500 bg-white rounded-full shadow-lg outline-none align-center focus:outline-none dark:bg-gray-800 hover:text-gray-600 dark:text-gray-400 hover:dark:text-gray-500"
                            type="button">
                            <UIcon name="i-uil-instagram" />
                        </button>
                        <!-- Facebook button -->
                        <button
                            class="items-center justify-center w-10 h-10 mr-2 font-normal text-gray-500 bg-white rounded-full shadow-lg outline-none align-center focus:outline-none dark:bg-gray-800 hover:text-gray-600 dark:text-gray-400 hover:dark:text-gray-500"
                            type="button">
                            <UIcon name="i-uil-facebook" />
                        </button>
                        <!-- TikTok button -->
                        <button
                            class="items-center justify-center w-10 h-10 mr-2 font-normal text-gray-500 bg-white rounded-full shadow-lg outline-none align-center focus:outline-none dark:bg-gray-800 hover:text-gray-600 dark:text-gray-400 hover:dark:text-gray-500"
                            type="button">
                            <UIcon name="i-ion-logo-tiktok" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Horizontal line separator -->
        <hr class="mx-auto my-6">
        <!-- Copyright section -->
        <div class="container px-4 mx-auto">
            <div class="text-center">
                <div class="py-1 text-sm font-semibold text-gray-700 dark:text-gray-400">
                    Copyright © <span id="get-current-year">2024</span>
                    <a href="https://iamdayy.web.app" class="text-blueGray-500 hover:text-blueGray-800"> Iamdayy</a>.
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
/* Responsive adjustments can be added here if needed */
@media (max-width: 768px) {
    /* Mobile-specific styles */
}
</style>