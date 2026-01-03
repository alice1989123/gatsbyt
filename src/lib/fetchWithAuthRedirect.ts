export async function fetchWithAuthRedirect(
  input: RequestInfo,
  init?: RequestInit
) {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/api/auth/login?next=${next}`;
  }

  return res;
}
