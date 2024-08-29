<script setup lang='ts'>
// Define page metadata
definePageMeta({
    layout: 'client', // Use the 'client' layout for this page
    auth: false // No authentication required to access this page
});

// Set the page title
useHead({
    title: 'Home'
})
</script>

<template>
    <!-- Hero Section -->
    <section class="relative min-h-[80vh] md:min-h-screen px-4 sm:px-6 pt-10 pb-8 isolate">
        <div class="absolute w-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <div class="text-center">
                <h1
                    class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-6xl lg:text-8xl hero title dark:text-gray-200">
                    Himpunan
                    Mahasiswa Informatika</h1>
                <p
                    class="max-w-3xl mx-auto mt-4 text-base leading-7 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8 dark:text-gray-400 hero subtitle">
                    Himpunan Mahasiswa Informatika atau yang sering disebut HIMATIKA
                    merupakan suatu organisasi yang menghimpun Mahasiswa Informatika untuk mengembangkan, dan
                    mempraktekkan ilmu nya dalam bidang komputer.</p>
                <div class="flex items-center justify-center mt-8 sm:mt-10 gap-x-4 sm:gap-x-6">
                    <a href="#about"
                        class="text-sm font-semibold leading-6 text-gray-800 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
                        Learn more <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="py-8 overflow-x-hidden sm:py-12 about" id="about">
        <About />
    </section>

    <!-- Post Section -->
    <section class="py-8 overflow-x-hidden sm:py-12 about" id="about">
        <Post />
    </section>

    <!-- Events Section -->
    <section class="py-8 sm:py-12" id="events" data-aos="fade-right">
        <Agenda />
    </section>

    <!-- Projects Section -->
    <section class="py-8 sm:py-12" id="projects" data-aos="zoom-in-up">
        <Projects />
    </section>
</template>

<style scoped>
/* Hero animation */
.hero {
    animation: zoom-in-fade 2s ease-out;
}

.subtitle {
    animation-duration: 2.5s;
}

@keyframes zoom-in-fade {
    0% {
        opacity: 0%;
        transform: scale(1.5, 1.5);
    }

    100% {
        opacity: 100%;
        transform: scale(1, 1);
    }
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .hero.title {
        font-size: 2.5rem;
        /* Smaller font size for mobile */
    }

    .hero.subtitle {
        font-size: 1rem;
        line-height: 1.5;
    }
}
</style>