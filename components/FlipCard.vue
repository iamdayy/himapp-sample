<script setup lang='ts'>
const slots = defineSlots();
const props = defineProps({
    img: String,
});
const randomCubicBezier = computed(() => {
    const R1 = ((Math.random() * 0.699) + 0.300).toFixed(3);
    const R2 = ((Math.random() * 0.199) + 0.100).toFixed(3);
    const R3 = ((Math.random() * 0.100) + 0.200).toFixed(3);
    const R4 = ((Math.random() * 0.100) + 0.300).toFixed(3);
    return `cubic-bezier(${R1}, ${R2}, ${R3},${R4})`
});
const randomWalk = computed(() => {
    const x = Math.floor(Math.random() * -25) + 'px';
    const y = Math.floor(Math.random() * -35) + 'px';
    return `translateY(${x}) translateX(${y})`
});

</script>
<template>
    <div class="mx-16 wrapper">
        <div class="card">
            <div class="front">
                <slot name="front" />
            </div>
            <div class="right">
                <slot name="back" />
            </div>
        </div>
        <div class="img-wrapper">
            <NuxtImg :src='img' alt='' class="object-cover aspect-square" width="224" height="224" />
        </div>
    </div>
</template>
<style scoped>
.wrapper {
    width: 280px;
    height: 480px;
    perspective: 800px;
    position: relative;
}

.card {
    width: 100%;
    height: 450px;
    position: relative;
    transform-style: preserve-3d;
    transform: translateZ(-140px);
    transition: transform 350ms cubic-bezier(0.390, 0.575, 0.565, 1.000);
    cursor: pointer;
}

.card>div {
    position: absolute;
    width: 100%;
    height: 450px;
    padding: 34px 21px;
    transition: all 350ms cubic-bezier(0.390, 0.575, 0.565, 1.000);
}

.front {
    background-image: linear-gradient(180deg, rgb(255 138 76) 0%, rgba(92, 91, 94, 0) 95%);
    transform: rotateY(0deg) translateZ(160px);
    border-radius: 34px 8px 0;
}

.right {
    background-image: linear-gradient(0deg, rgb(255 138 76) 0%, rgba(92, 91, 94, 0) 95%);
    opacity: 0.08;
    transform: rotateY(90deg) translateZ(160px);
    border-radius: 0 0 3px 34px;
}

.card:hover {
    transform: translateZ(-160px) rotateY(-90deg);
}

.card:hover .front {
    opacity: 0;
}

.card:hover .right {
    opacity: 1;
}

img {
    transform-origin: top right;
    transition: transform 300ms cubic-bezier(0.390, 0.575, 0.565, 1.000);
    transition-delay: 100ms;
    transform: translateX(50%);
    max-width: 180px;
    pointer-events: none;
    border-radius: 9999px !important;
}

.img-wrapper {
    animation: float 4s v-bind('randomCubicBezier') infinite alternate;
    position: absolute;
    transform-style: preserve-3d;
    top: 0;
    right: 0;
    pointer-events: none;
    backface-visibility: hidden;
    width: 160px;
    height: 160px;
}

@keyframes float {
    0% {
        transform: translateZ(20px);
    }

    100% {
        transform: v-bind('randomWalk') translateZ(30px) scale(1.001);
    }
}

.card:hover~.img-wrapper img {
    transform: scale(0.9) translateX(45%) translateY(195%);
}
</style>