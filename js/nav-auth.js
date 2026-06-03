import {
  isLoggedIn,
  getToken,
  getApiKey,
  getProfileName,
  logout,
} from "./auth.js";
import { fetchProfile } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const profileLinks = document.querySelectorAll(".nav-profile-link");
  const creditWrapper = document.getElementById("headerCreditWrapper");
  const creditValueEl = document.getElementById("headerCreditValue");
  const registerBtn = document.getElementById("headerRegisterBtn");
  const loginBtn = document.getElementById("headerLoginBtn");
  const logoutBtn = document.getElementById("headerLogoutBtn");
  const profileBtn = document.getElementById("headerProfileBtn");

  const loggedIn = isLoggedIn();

  profileLinks.forEach((link) => {
    link.href = loggedIn ? "profile.html" : "login.html";
  });

  if (!loggedIn) {
    creditWrapper?.classList.add("hidden");
    logoutBtn?.classList.add("hidden");
    profileBtn?.classList.add("hidden");
    registerBtn?.classList.remove("hidden");
    loginBtn?.classList.remove("hidden");
    return;
  }

  registerBtn?.classList.add("hidden");
  loginBtn?.classList.add("hidden");
  logoutBtn?.classList.remove("hidden");
  profileBtn?.classList.remove("hidden");

  try {
    const token = getToken();
    const apiKey = getApiKey();
    const profileName = getProfileName();

    const profile = await fetchProfile(profileName, {}, token, apiKey);

    if (creditValueEl) {
      creditValueEl.textContent = profile?.credits ?? 0;
    }

    creditWrapper?.classList.remove("hidden");
  } catch (error) {
    console.error("Failed to load credits:", error);
    creditWrapper?.classList.add("hidden");
  }

  logoutBtn?.addEventListener("click", () => {
    logout();
    window.location.href = "index.html";
  });
});
