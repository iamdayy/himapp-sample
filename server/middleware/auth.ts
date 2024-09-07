export default defineEventHandler(async (event) => {
  if (checkAuth(event)) {
    event.context.auth = await ensureAuth(event);
    event.context.organizer = event.context.auth.profile.organizer;
  }
});
