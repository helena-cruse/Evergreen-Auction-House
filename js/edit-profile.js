import {
  isLoggedIn,
  getToken,
  getApiKey,
  getProfileName,
  getProfile,
  saveAuth,
} from "./auth.js";
import { fetchProfile } from "./api.js";

const form = document.getElementById("editProfileForm");
const nameInput = document.getElementById("editProfileName");
const emailInput = document.getElementById("editProfileEmail");
const bioInput = document.getElementById("editProfileBio");
const avatarUrlInput = document.getElementById("editProfileAvatarUrl");
const avatarPreview = document.getElementById("editProfileAvatarPreview");
const statusEl = document.getElementById("editProfileStatus");
const saveBtn = document.getElementById("editProfileSaveBtn");

function setStatus(message, isError) {
  if (!statusEl) return;
  statusEl.textContent = message || "";
  statusEl.className =
    "min-h-[1.25rem] text-xs mt-1 " +
    (isError ? "text-red-800" : "text-evergreenDark/80");
}

function updateAvatarPreview(url) {
  if (!avatarPreview || !url) return;
  avatarPreview.src = url;
}

async function loadProfile() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const token = getToken();
  const apiKey = getApiKey();
  const profileName = getProfileName();

  if (!token || !profileName || !apiKey) {
    window.location.href = "login.html";
    return;
  }

  setStatus("Loading profile...", false);

  try {
    const profile = await fetchProfile(
      profileName,
      { includeListings: false, includeWins: false },
      token,
      apiKey
    );

    if (nameInput) nameInput.value = profile.name || "";
    if (emailInput) emailInput.value = profile.email || "";
    if (bioInput) bioInput.value = profile.bio || "";

    const avatarUrl =
      profile.avatar && profile.avatar.url
        ? profile.avatar.url
        : "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg";

    if (avatarPreview) avatarPreview.src = avatarUrl;
    if (avatarUrlInput)
      avatarUrlInput.value =
        profile.avatar && profile.avatar.url ? profile.avatar.url : "";

    setStatus("", false);
  } catch (error) {
    console.error("Failed to load profile for editing:", error);
    setStatus(
      error && error.message
        ? error.message
        : "Could not load profile. Please try again later.",
      true
    );
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const token = getToken();
  const apiKey = getApiKey();
  const profileName = getProfileName();

  if (!token || !profileName || !apiKey) {
    setStatus("Missing auth token or API key. Please log in again.", true);
    setTimeout(() => {
      window.location.href = "login.html";
    }, 900);
    return;
  }

  const bio = bioInput ? bioInput.value.trim() : "";
  const avatarUrl = avatarUrlInput ? avatarUrlInput.value.trim() : "";

  const body = {};
  if (bio) {
    body.bio = bio;
  }

  if (avatarUrl) {
    body.avatar = {
      url: avatarUrl,
      alt: "Avatar for " + profileName,
    };
  }

  setStatus("Saving changes...", false);
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
  }

  try {
    const response = await fetch(
      "https://v2.api.noroff.dev/auction/profiles/" + profileName,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          "X-Noroff-API-Key": apiKey,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json().catch(function () {
      return null;
    });

    console.log("Edit profile response:", response.status, data);

    if (!response.ok) {
      let msg = "Failed to update profile (status " + response.status + ").";
      if (
        data &&
        data.errors &&
        Array.isArray(data.errors) &&
        data.errors.length
      ) {
        msg = data.errors
          .map(function (e) {
            return e.message;
          })
          .join(" ");
      } else if (data && data.message) {
        msg = data.message;
      }
      throw new Error(msg);
    }

    const updated = data && (data.data || data);

    const existing = getProfile() || {};
    saveAuth({
      accessToken: getToken(),
      name: existing.name || updated.name,
      email: existing.email || updated.email,
      avatar: updated.avatar || existing.avatar,
    });

    if (updated.avatar && updated.avatar.url) {
      updateAvatarPreview(updated.avatar.url);
    }

    setStatus("Profile updated successfully!", false);

    setTimeout(function () {
      window.location.href = "profile.html";
    }, 900);
  } catch (error) {
    console.error("Edit profile error:", error);
    setStatus(
      error && error.message ? error.message : "Something went wrong.",
      true
    );
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save changes";
    }
  }
}

if (avatarUrlInput) {
  avatarUrlInput.addEventListener("input", function () {
    const url = avatarUrlInput.value.trim();
    if (url) {
      updateAvatarPreview(url);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadProfile();
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});
