export function getTokenPayload(token) {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

export function getStoredTokenPayload() {
  const token = localStorage.getItem("token");
  return getTokenPayload(token);
}
