export default defineNuxtPlugin((nuxtApp) => {
  const { token } = useAuthState();
  const config = useRuntimeConfig();
  const { refresh } = useAuth();
  const api = $fetch.create({
    baseURL: config.public.public_uri,
    onRequest({ request, options, error }) {
      if (token.value) {
        const headers = (options.headers ||= {});
        if (Array.isArray(headers)) {
          headers.push(["Authorization", token.value]);
        } else if (headers instanceof Headers) {
          headers.set("Authorization", token.value);
        } else {
          headers.Authorization = token.value;
        }
      }
    },
    async onResponseError({ request, response, options }) {
      if (response.status === 401) {
        if (response.status === 401) {
          try {
            refresh();
            options.headers = { Authorization: token.value! };
          } catch (error) {
            console.error("Token refresh failed:", error);
          }
        }
      }
    },
  });

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api,
    },
  };
});
