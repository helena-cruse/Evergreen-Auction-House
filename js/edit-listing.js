import { API_BASE, fetchListingById } from "./api.js";
import { isLoggedIn, getToken, getApiKey, getProfileName } from "./auth.js";

const form = document.getElementById("editListingForm");
const titleInput = document.getElementById("editListingTitle");
const descriptionInput = document.getElementById("editListingDescription");
const tagsInput = document.getElementById("editListingTags");
const endsAtInput = document.getElementById("editListingEndsAt");
const statusEl = document.getElementById("editListingStatus");
const routeInfoEl = document.getElementById("editListingRouteInfo");
const submitBtn = document.getElementById("editListingSubmitBtn");
const deleteBtn = document.getElementById("deleteListingBtn");

const MEDIA_URL_SELECTOR = ".media-url-input";
const MEDIA_ALT_SELECTOR = ".media-alt-input";

let currentListingId = null;
let currentListing = null;

function setStatus(text, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = text || "";
  statusEl.className =
    "min-h-[1.25rem] text-xs text-center " +
    (isError ? "text-red-800" : "text-evergreenDark/80");
}

function getListingIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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

async function loadListing() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  currentListingId = getListingIdFromQuery();
  if (!currentListingId) {
    setStatus("Missing listing ID in the URL.", true);
    return;
  }

  if (routeInfoEl) {
    routeInfoEl.textContent = `Route PUT: /auction/listings/${currentListingId}`;
  }

  const token = getToken();
  const apiKey = getApiKey();
  const profileName = getProfileName();

  if (!token || !apiKey || !profileName) {
    setStatus("Missing authentication data. Please log in again.", true);
    return;
  }

  setStatus("Loading listing...");

  try {
    const listing = await fetchListingById(currentListingId, {
      includeBids: true,
      includeSeller: true,
    });

    currentListing = listing;

    const sellerName = listing.seller?.name;
    if (!sellerName || sellerName.toLowerCase() !== profileName.toLowerCase()) {
      setStatus("You can only edit listings that you have created.", true);
      if (form) {
        form.classList.add("opacity-60", "pointer-events-none");
      }
      if (deleteBtn) deleteBtn.disabled = true;
      return;
    }

    if (titleInput) titleInput.value = listing.title || "";
    if (descriptionInput) descriptionInput.value = listing.description || "";
    if (tagsInput && Array.isArray(listing.tags)) {
      tagsInput.value = listing.tags.join(", ");
    }

    if (endsAtInput && listing.endsAt) {
      const endDate = new Date(listing.endsAt);
      if (!Number.isNaN(endDate.getTime())) {
        endsAtInput.value = endDate.toISOString().slice(0, 10);
      }
    }

    const urlInputs = document.querySelectorAll(MEDIA_URL_SELECTOR);
    const altInputs = document.querySelectorAll(MEDIA_ALT_SELECTOR);
    const media = Array.isArray(listing.media) ? listing.media : [];

    urlInputs.forEach((input, index) => {
      const mediaItem = media[index];
      if (!mediaItem) return;
      input.value = mediaItem.url || "";
      if (altInputs[index]) {
        altInputs[index].value = mediaItem.alt || "";
      }
    });

    setStatus("");
  } catch (error) {
    console.error("Failed to load listing:", error);
    setStatus(
      error.message || "Could not load listing. Please try again.",
      true
    );
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!currentListingId) return;

  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const token = getToken();
  const apiKey = getApiKey();

  if (!token || !apiKey) {
    setStatus("Missing authentication details. Please log in again.", true);
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
    description,
    tags: tags.length ? tags : undefined,
    endsAt: endsAtIso,
  };

  if (media.length) {
    body.media = media;
  }

  setStatus("Saving changes...");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
  }

  try {
    const response = await fetch(
      `${API_BASE}/auction/listings/${currentListingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json().catch(() => null);
    console.log("Edit listing response:", response.status, data);

    if (!response.ok) {
      let msg = "Failed to update listing.";
      if (data && Array.isArray(data.errors) && data.errors.length) {
        msg = data.errors.map((e) => e.message).join(" ");
      } else if (data && data.message) {
        msg = data.message;
      }
      throw new Error(msg);
    }

    const updated = data && (data.data || data);

    setStatus("Listing updated successfully!");
    if (updated && updated.id) {
      setTimeout(() => {
        window.location.href = `single-listing.html?id=${updated.id}`;
      }, 900);
    }
  } catch (error) {
    console.error("Edit listing error:", error);
    setStatus(error.message || "Something went wrong.", true);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save changes";
    }
  }
}

async function handleDelete() {
  if (!currentListingId) return;

  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this listing? This cannot be undone."
  );
  if (!confirmDelete) return;

  const token = getToken();
  const apiKey = getApiKey();

  if (!token || !apiKey) {
    setStatus("Missing authentication details. Please log in again.", true);
    return;
  }

  setStatus("Deleting listing...");

  try {
    const response = await fetch(
      `${API_BASE}/auction/listings/${currentListingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      let msg = "Failed to delete listing.";
      let data = null;
      try {
        data = await response.json();
      } catch (_) {}
      if (data && Array.isArray(data.errors) && data.errors.length) {
        msg = data.errors.map((e) => e.message).join(" ");
      } else if (data && data.message) {
        msg = data.message;
      }
      throw new Error(msg);
    }

    setStatus("Listing deleted successfully!");
    setTimeout(() => {
      window.location.href = "profile.html";
    }, 900);
  } catch (error) {
    console.error("Delete listing error:", error);
    setStatus(error.message || "Something went wrong.", true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadListing();

  if (form) {
    form.addEventListener("submit", handleSubmit);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDelete);
  }
});
