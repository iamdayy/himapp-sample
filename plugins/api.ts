export default defineNuxtPlugin((nuxtApp) => {
  const { refresh } = useAuth();
  const config = useRuntimeConfig();
  const api = $fetch.create({
    baseURL: config.public.public_uri,
    onRequest({ request, options, error }) {
      const token = useCookie("auth.token");
      if (token.value) {
        const headers = (options.headers ||= {});
        if (Array.isArray(headers)) {
          headers.push(["Authorization", `Bearer ${token.value}`]);
        } else if (headers instanceof Headers) {
          headers.set("Authorization", `Bearer ${token.value}`);
        } else {
          headers.Authorization = `Bearer ${token.value}`;
        }
      }
    },
    async onResponse({ request, response, options }) {
      if (response.status === 401) {
        if (response.status === 401) {
          try {
            await refresh();
            await api(request, options as any);
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
