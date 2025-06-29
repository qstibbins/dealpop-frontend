export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  // Use path as-is if it's an absolute URL, otherwise prepend the base
  const url = path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}