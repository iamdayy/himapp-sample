<script setup lang='ts'>
definePageMeta({
    layout: 'client',
    auth: false
});
useHead({
    title: 'Home'
})
</script>
<template>
    <section class="relative min-h-screen px-6 pt-10 pb-8 isolate">
        <div class="absolute w-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <div class="text-center">
                <h1
                    class="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-8xl hero title dark:text-gray-200">
                    Himpunan
                    Mahasiswa Informatika</h1>
                <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 hero subtitle">Himpunan Mahasiswa
                    Informatika atau yang
                    sering
                    disebut HIMATIKA
                    merupakan suatu organisasi yang menghimpun Mahasiswa Informatika untuk mengembangkan, dan
                    mempraktekkan
                    ilmu
                    nya dalam bidang komputer.</p>
                <div class="flex items-center justify-center mt-10 gap-x-6">
                    <a href="#about" class="text-sm font-semibold leading-6 text-gray-900">Learn more <span
                            aria-hidden="true">→</span></a>
                </div>
            </div>
        </div>
    </section>
    <section class="py-12 overflow-x-hidden about" id="about">
        <About />
    </section>
    <section class="py-12 overflow-x-hidden about" id="about">
        <Post />
    </section>
    <section class="py-12" id="events" data-aos="fade-right">
        <Events />
    </section>
    <section class="py-12" id="projects" data-aos="zoom-in-up">
        <Projects />
    </section>
</template>
<style scoped>
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
</style>