export function $api<T>(
  request: Parameters<typeof $fetch<T>>[0],
  opts?: Parameters<typeof $fetch<T>>[1]
) {
  const authState = useAuthState();
  const auth = useAuth();

  if (!authState.token.value) {
    auth.refresh();
  }
  return $fetch<T>(request, {
    ...opts,
    headers: {
      Authorization: auth.token.value ? auth.token.value : "",
      ...opts?.headers,
    },
  });
}
