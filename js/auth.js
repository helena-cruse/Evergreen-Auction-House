const API_BASE = "https://v2.api.noroff.dev";

const STATIC_API_KEY = "437d718d-c441-4331-bb1c-32e578850a80";

const STORAGE_KEY = {
  TOKEN: "evergreen_token",
  PROFILE: "evergreen_profile",
};

export function saveAuth({ accessToken, name, email, avatar }) {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEY.TOKEN, accessToken);
  }

  const profile = { name, email, avatar };
  localStorage.setItem(STORAGE_KEY.PROFILE, JSON.stringify(profile));
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEY.TOKEN);
}

export function getProfile() {
  const raw = localStorage.getItem(STORAGE_KEY.PROFILE);
  return raw ? JSON.parse(raw) : null;
}

export function getProfileName() {
  return getProfile()?.name || null;
}

export function getApiKey() {
  return STATIC_API_KEY;
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY.TOKEN);
  localStorage.removeItem(STORAGE_KEY.PROFILE);
}

export async function registerUser({ name, email, password, avatar }) {
  const body = {
    name,
    email: email.trim(),
    password,
  };

  if (avatar) {
    body.avatar =
      typeof avatar === "string"
        ? { url: avatar, alt: `Avatar for ${name}` }
        : avatar;
  }

  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  console.log("Register response:", response.status, data);

  if (!response.ok) {
    const msg =
      data?.errors?.map((e) => e.message).join(" ") ||
      data?.message ||
      `Registration failed (status ${response.status}).`;
    throw new Error(msg);
  }

  return data;
}

export async function loginUser({ email, password }) {
  const cleanEmail = email.trim();

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: cleanEmail, password }),
  });

  const data = await response.json().catch(() => null);
  console.log("Login response:", response.status, data);

  if (!response.ok) {
    const msg =
      data?.errors?.map((e) => e.message).join(" ") ||
      data?.message ||
      `Login failed (status ${response.status}).`;
    throw new Error(msg);
  }

  const { accessToken, name, avatar } = data.data;

  saveAuth({
    accessToken,
    name,
    email: cleanEmail,
    avatar,
  });

  return {
    accessToken,
    name,
    email: cleanEmail,
    avatar,
  };
}
