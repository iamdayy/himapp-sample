// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  nitro: {
    preset: "bun",
  },
  runtimeConfig: {
    mongodb_uri: process.env.MONGODB_URI,
    mongodb_username: process.env.MONGODB_USERNAME,
    mongodb_password: process.env.MONGODB_PASSWORD,
    dbName: process.env.DBNAME,
    storageDir: process.env.STORAGE_DIR,
    public: {
      appname: process.env.APPNAME,
      api_uri: process.env.PUBLIC_URI_API,
      public_uri: process.env.PUBLIC_URI,
    },
  },
  devtools: { enabled: true },
  ssr: false,
  image: {
    providers: {
      imagekit: {
        name: "localProvider",
        provider: "~/providers/localProvider.ts",
        options: {
          // ... provider options
          baseURL: process.env.PUBLIC_URI,
        },
      },
    },
  },
  modules: [
    "@nuxt/ui",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxt/image",
    "@sidebase/nuxt-auth",
    "@samk-dev/nuxt-vcalendar",
    "nuxt-pdfmake",
    "nuxt-tiptap-editor",
    "@vueuse/nuxt",
    "nuxt-file-storage",
  ],
  fileStorage: {
    mount: process.env.STORAGE_DIR,
  },
  icon: {
    collections: ["heroicons", "uil", "ion", "ph"],
  },
  ui: {},
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
  },
  auth: {
    baseURL: "/api",
    globalAppMiddleware: true,
    provider: {
      type: "refresh",
      endpoints: {
        signIn: { path: "/signin", method: "post" },
        signOut: { path: "/signout", method: "get" },
        getSession: { path: "/session", method: "get" },
        refresh: { path: "/refresh", method: "post" },
      },
      token: {
        type: "Bearer",
        cookieName: "auth.token",
        headerName: "Authorization",
        maxAgeInSeconds: 36000,
        sameSiteAttribute: "lax",
      },
      refreshToken: {
        refreshRequestTokenPointer: "/refreshToken",
        maxAgeInSeconds: 2592000,
      },
      sessionDataType: {
        username: "string",
        key: "string",
        token: "string",
        profile: {
          NIM: "number",
          fullName: "string",
          avatar: "string",
          class: "string",
          semester: "number",
          birth: {
            place: "string",
            date: "Date",
          },
          sex: "'female' | 'male'",
          religion: "string",
          citizen: "string",
          phone: "string",
          email: "string",
          address: "IAddress",
          isRegistered: "boolean",
          enteredYear: "number",
          events: {
            _id: "number | string",
            title: "string",
            date: "Date",
            at: "string",
            canSee:
              "'Admin' | 'Departement' | 'Internal' | 'All' | 'External' | 'No'",
            description: "string",
            committee: "ICommittee[]",
          },
          projects: "IProject[]",
          isAdministrator: "IAdministrator",
          isDepartement: "IDepartement",
        },
      },
    },
    sessionRefresh: {
      enableOnWindowFocus: true,
      enablePeriodically: 1000 * 60 * 60,
    },
  },
});
