export default defineAppConfig({
  ui: {
    card: {
      background: "bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm",
      divide: "",
      ring: "",
      shadow: "shadow-md",
      body: {
        padding: "px-2 md:px-8 sm:px-2",
      },
    },
    slideover: {
      background: "bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm",
      divide: "",
      ring: "",
      shadow: "shadow-md",
      width: "max-w-[45vw] md:max-w-[20vw]",
    },
    dropdown: {
      background: "bg-white/90 dark:bg-gray-900/95 backdrop-blur-sm",
      ring: "",
      shadow: "shadow-md",
    },
    verticalNavigation: {
      active: "",
    },
  },
});
