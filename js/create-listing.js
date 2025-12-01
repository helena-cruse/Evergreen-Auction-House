import { API_BASE } from "./api.js";
import { isLoggedIn, getToken, getApiKey } from "./auth.js";

const form = document.getElementById("createListingForm");
const titleInput = document.getElementById("listingTitle");
const descriptionInput = document.getElementById("listingDescription");
const tagsInput = document.getElementById("listingTags");
const endsAtInput = document.getElementById("listingEndsAt");
const statusEl = document.getElementById("createListingStatus");
const submitBtn = document.getElementById("createListingSubmitBtn");

const MEDIA_URL_SELECTOR = ".media-url-input";
const MEDIA_ALT_SELECTOR = ".media-alt-input";

function setStatus(text, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = text || "";
  statusEl.className =
    "min-h-[1.25rem] text-xs text-center " +
    (isError ? "text-red-800" : "text-evergreenDark/80");
}

function buildTags(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function buildMedia() {
  const urlInputs = document.querySelectorAll(MEDIA_URL_SELECTOR);
  const altInputs = document.querySelectorAll(MEDIA_ALT_SELECTOR);
  const media = [];

  urlInputs.forEach((input, index) => {
    const url = input.value.trim();
    const alt = altInputs[index]?.value.trim() || "";

    if (url) {
      media.push({
        url,
        alt: alt || "Listing image",
      });
    }
  });

  return media;
}

function validateForm() {
  const errors = [];

  const title = titleInput.value.trim();
  if (!title) {
    errors.push("Title is required.");
  }

  const rawDate = endsAtInput.value.trim();
  if (!rawDate) {
    errors.push("Please choose an end date.");
  } else {
    const endDate = new Date(rawDate);
    if (Number.isNaN(endDate.getTime())) {
      errors.push("End date is not valid.");
    } else {
      const now = new Date();
      if (endDate <= now) {
        errors.push("End date must be in the future.");
      }
    }
  }

  return errors;
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const token = getToken();
  const apiKey = getApiKey();

  if (!token || !apiKey) {
    setStatus(
      "Missing authentication details. Please log in again before creating a listing.",
      true
    );
    return;
  }

  const errors = validateForm();
  if (errors.length > 0) {
    setStatus(errors.join(" "), true);
    return;
  }

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const tags = buildTags(tagsInput.value);
  const media = buildMedia();

  const rawDate = endsAtInput.value.trim();
  const endDate = new Date(rawDate);
  const endsAtIso = endDate.toISOString();

  const body = {
    title,
    description: description || undefined,
    tags: tags.length ? tags : undefined,
    media: media.length ? media : undefined,
    endsAt: endsAtIso,
  };

  setStatus("Creating listing...");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";
  }

  try {
    const response = await fetch(`${API_BASE}/auction/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);
    console.log("Create listing response:", response.status, data);

    if (!response.ok) {
      let msg = "Failed to create listing.";
      if (data && Array.isArray(data.errors) && data.errors.length) {
        msg = data.errors.map((e) => e.message).join(" ");
      } else if (data && data.message) {
        msg = data.message;
      }
      throw new Error(msg);
    }

    const created = data && (data.data || data);

    setStatus("Listing created successfully!");
    if (created && created.id) {
      setTimeout(() => {
        window.location.href = `single-listing.html?id=${created.id}`;
      }, 900);
    }
  } catch (error) {
    console.error("Create listing error:", error);
    setStatus(error.message || "Something went wrong.", true);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create listing";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  if (endsAtInput) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const iso = d.toISOString().slice(0, 10);
    endsAtInput.value = iso;
  }

  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
});
