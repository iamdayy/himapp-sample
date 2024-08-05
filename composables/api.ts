export function $api<T>(
  request: Parameters<typeof $fetch<T>>[0],
  opts?: Parameters<typeof $fetch<T>>[1]
) {
  const auth = useAuth();

  if (!auth.token.value) {
    auth.refresh();
  }
  return $fetch<T>(request, {
    ...opts,
    headers: {
      authorization: auth.token.value ? auth.token.value : "",
      ...opts?.headers,
    },
  });
}
