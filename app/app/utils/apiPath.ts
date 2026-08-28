export function getApiPath(path: string): string {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/zyka")) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `/zyka${cleanPath}`;
  }
  return path;
}
