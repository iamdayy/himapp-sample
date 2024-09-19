export default defineEventHandler(async (event) => {
  const isAuthenticated = checkAuth(event);

  if (isAuthenticated) {
    event.context.user = await ensureAuth(event);
    event.context.organizer = event.context.user.member.organizer;
  }
});
