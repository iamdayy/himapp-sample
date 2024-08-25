<script setup lang='ts'>
// This script section is currently empty but can be used for component logic if needed in the future
</script>

<template>
    <!-- Main container for the authentication layout -->
    <div class="relative min-h-screen bg-gray-200/40 dark:bg-indigo-900/40">
        <!-- Centered content wrapper -->
        <div class="absolute w-full max-w-md px-4 py-8 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <!-- Navigation tabs for Login and Register -->
            <ul
                class="flex flex-row gap-3 font-sans font-semibold text-center text-white dark:text-gray-400 mx-auto w-full bg-[#102770] rounded-xl mb-12">
                <!-- Login tab -->
                <li class="w-1/2 m-1">
                    <nuxt-link to="/login"
                        class="inline-block w-full px-4 py-3 rounded-lg hover:bg-[#42538a] hover:text-white"
                        active-class="bg-[#ffeba7] text-[#102770] hover:bg-[#ffeba7] hover:text-[#102770]">Login</nuxt-link>
                </li>
                <!-- Register tab -->
                <li class="w-1/2 m-1">
                    <nuxt-link to="/register"
                        class="inline-block w-full px-4 py-3 rounded-lg hover:bg-[#42538a] hover:text-white"
                        active-class="bg-[#ffeba7] text-[#102770] hover:bg-[#ffeba7] hover:text-[#102770]">Register</nuxt-link>
                </li>
            </ul>
            <!-- 3D card wrapper for content -->
            <div class="mx-auto card-3d-wrap">
                <div class="w-full h-full card-3d-wrapper">
                    <!-- Slot for injecting page-specific content -->
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
/* Style for elements with mix-blend-mode: difference */
.block-diff {
    display: block;
    mix-blend-mode: difference;
}

/* 3D card wrap styles */
.card-3d-wrap {
    position: relative;
    width: 100%;
    max-width: 340px;
    height: auto;
    min-height: 510px;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
    perspective: 1000px;
}

/* 3D card wrapper styles */
.card-3d-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
    transition: transform 700ms 400ms ease-out;
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .card-3d-wrap {
        max-width: 100%;
    }
}
</style>