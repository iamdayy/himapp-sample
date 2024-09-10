export default defineEventHandler(async (event) => {
  if (checkAuth(event)) {
    event.context.user = await ensureAuth(event);
    event.context.organizer = event.context.user.profile.organizer;
  }
});
