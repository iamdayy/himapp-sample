<script setup lang='ts'>
import type { IReqAuth } from "~/types/IRequestPost";

// Authentication composable
const { signIn } = useAuth()

// Toast notification composable
const toast = useToast();

// Form data reactive reference
const Form = ref<IReqAuth>({
    username: "",
    password: "",
    password_confirmation: "",
    NIM: 0,
});

// Page metadata
definePageMeta({
    pageTransition: {
        name: "flip"
    },
    layout: "auth",
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/'
    }
});

/**
 * Handles user login
 * Attempts to sign in the user with provided credentials
 * Redirects to dashboard on success, shows error toast on failure
 */
const login = async () => {
    try {
        await signIn({
            username: Form.value.username,
            password: Form.value.password
        }, { callbackUrl: '/dashboard' });
    } catch (error: any) {
        toast.add({ title: "Failed to login, please check username/password" })
    }
}

// Set page head metadata
useHead({
    title: "Login | Himatika"
});
</script>

<template>
    <div
        class="shadow-xl card bg-gradient-to-bl from-indigo-50 via-white to-teal-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900">
        <div class="card-wrap">
            <h4 class="mb-5 text-orange-400">LOGIN</h4>
            <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                <nuxtImg class="w-auto h-10 mx-auto" src="/img/logo.png" alt="Himatika" />
            </div>

            <div class="px-2 mt-6 overflow-y-scroll sm:mx-auto sm:w-full sm:max-w-sm no-scrollbar max-h-96">
                <div class="space-y-6">
                    <!-- Username input -->
                    <div>
                        <label for="username-login"
                            class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Username</label>
                        <div class="mt-2">
                            <UInput id="username-login" color="gray" name="username" variant="outline" type="text"
                                autocomplete="username" required v-model="Form.username" />
                        </div>
                    </div>

                    <!-- Password input -->
                    <div>
                        <div class="flex items-center justify-between">
                            <label for="password-login"
                                class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Password</label>
                            <div class="text-sm">
                                <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot
                                    password?</a>
                            </div>
                        </div>
                        <div class="mt-2">
                            <UInput id="password-login" name="password" color="gray" variant="outline" type="password"
                                autocomplete="current-password" required v-model="Form.password" />
                        </div>
                    </div>

                    <!-- Login button -->
                    <div>
                        <button @click="login"
                            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign
                            in</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Poppins:400,500,600,700,800,900');

/* Card styles */
.card {
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 12px;
    left: 0;
    top: 0;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -o-backface-visibility: hidden;
    backface-visibility: hidden;
}

.card-wrap {
    position: relative;
    width: 100%;
    display: block;
    padding-left: 1rem;
    padding-right: 1rem;
    z-index: 1;
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    -o-backface-visibility: hidden;
    backface-visibility: hidden;
}

/* Heading styles */
.card-wrap h4 {
    position: relative;
    width: 100%;
    display: block;
    text-align: center;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    letter-spacing: 3px;
    font-size: 22px;
    line-height: 1.7;
    color: #c2890f;
    transform: translate3d(0, 0, 35px) perspective(100px);
}

/* Animated background for heading */
.card-wrap h4:before {
    position: absolute;
    content: '';
    z-index: -1;
    background: linear-gradient(217deg, #448ad5, #b8eaf9);
    width: 70px;
    height: 70px;
    display: block;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 6px 20px 0 rgba(16, 39, 112, .3);
    animation: border-transform 6s linear infinite;
}

/* Animation for heading background */
@keyframes border-transform {

    0%,
    100% {
        border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
    }

    14% {
        border-radius: 40% 60% 54% 46% / 49% 60% 40% 51%;
    }

    28% {
        border-radius: 54% 46% 38% 62% / 49% 70% 30% 51%;
    }

    42% {
        border-radius: 61% 39% 55% 45% / 61% 38% 62% 39%;
    }

    56% {
        border-radius: 61% 39% 67% 33% / 70% 50% 50% 30%;
    }

    70% {
        border-radius: 50% 50% 34% 66% / 56% 68% 32% 44%;
    }

    84% {
        border-radius: 46% 54% 50% 50% / 35% 61% 39% 65%;
    }
}

/* Additional heading styles */
.card-wrap h2 {
    position: relative;
    width: 100%;
    display: block;
    text-align: center;
    font-family: 'Poppins', sans-serif;
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 36px;
    line-height: 1.1;
    color: #102770;
    transform: translate3d(0, 0, 30px) perspective(100px);
}
</style>