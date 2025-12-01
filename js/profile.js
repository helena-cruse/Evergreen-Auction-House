import { fetchProfile, fetchListings } from "./api.js";
import {
  getToken,
  getApiKey,
  getProfileName,
  isLoggedIn,
  logout,
} from "./auth.js";

const profileMessageEl = document.getElementById("profileMessage");
const avatarEl = document.getElementById("profileAvatar");
const nameEl = document.getElementById("profileName");
const emailEl = document.getElementById("profileEmail");
const bioEl = document.getElementById("profileBio");
const creditsEl = document.getElementById("profileCredits");

const myListingsEl = document.getElementById("myListings");
const myBidsEl = document.getElementById("myBids");
const logoutBtn = document.getElementById("logoutBtn");

const editProfileBtn =
  document.getElementById("editProfileBtn") ||
  document.getElementById("profileEditBtn");
const editAvatarBtn =
  document.getElementById("editAvatarBtn") ||
  document.getElementById("profileEditAvatarBtn");
const createListingBtn =
  document.getElementById("createListingBtn") ||
  document.getElementById("profileCreateListingBtn");

const profileActionsWrapper = document.getElementById("profileActions");

const params = new URLSearchParams(window.location.search);
const viewedProfileName = params.get("user");
const loggedInName = getProfileName();

const isOwnProfile = !viewedProfileName || viewedProfileName === loggedInName;
const profileNameToFetch = viewedProfileName || loggedInName;

function setMessage(text, isError = false) {
  if (!profileMessageEl) return;
  profileMessageEl.textContent = text || "";
  profileMessageEl.className =
    "text-center text-sm min-h-[1.5rem] " +
    (isError ? "text-red-800" : "text-evergreenDark/90");
}

function formatEndsAt(endsAt) {
  if (!endsAt) return "";
  const end = new Date(endsAt);
  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `Ends in ${days} day${days > 1 ? "s" : ""}`;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `Ends in ${hours} hour${hours > 1 ? "s" : ""}`;

  const minutes = Math.floor(diff / (1000 * 60));
  return `Ends in ${minutes} min`;
}

function getFirstMediaUrl(mediaArray) {
  if (!Array.isArray(mediaArray) || mediaArray.length === 0) return null;
  return mediaArray[0]?.url || null;
}

function renderProfileHeader(profile) {
  if (!profile) return;

  const avatarUrl =
    profile.avatar?.url ||
    "https://images.pexels.com/photos/279211/pexels-photo-279211.jpeg";

  if (avatarEl) {
    avatarEl.src = avatarUrl;
    avatarEl.alt = profile.avatar?.alt || `${profile.name} avatar`;
  }

  if (nameEl) nameEl.textContent = profile.name || "";
  if (emailEl) emailEl.textContent = profile.email || "";

  if (bioEl) {
    if (profile.bio) {
      bioEl.textContent = profile.bio;
    } else {
      bioEl.textContent = isOwnProfile
        ? "No bio added yet. Edit your profile to add one."
        : "This user has not added a bio yet.";
    }
  }

  if (creditsEl) creditsEl.textContent = `${profile.credits ?? 0}`;
}

function renderListings(listings = [], ownProfile = true) {
  if (!myListingsEl) return;

  if (!listings.length) {
    myListingsEl.innerHTML = ownProfile
      ? '<p class="text-xs text-evergreenDark/80 text-center">You have no active listings yet.</p>'
      : '<p class="text-xs text-evergreenDark/80 text-center">This user has no active listings yet.</p>';
    return;
  }

  myListingsEl.innerHTML = listings
    .map((listing) => {
      const img =
        getFirstMediaUrl(listing.media) ||
        "https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg";
      const endsText = formatEndsAt(listing.endsAt);
      const bidCount = listing._count?.bids ?? listing.bids?.length ?? 0;

      const buttonLabel = ownProfile ? "Edit listing" : "View listing";
      const buttonHref = ownProfile
        ? `edit-listing.html?id=${listing.id}`
        : `single-listing.html?id=${listing.id}`;

      return `
      <article class="bg-evergreenCard rounded-lg shadow-md overflow-hidden text-xs flex flex-col">
        <div class="aspect-[4/3] bg-evergreenBg/60">
          <img src="${img}" alt="${
        listing.title || "Listing image"
      }" class="w-full h-full object-cover" />
        </div>
        <div class="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-heading text-sm mb-1">${
              listing.title || "Untitled"
            }</h3>
            <p class="text-[11px] text-evergreenDark/90 mb-1">
              ${
                listing.description
                  ? listing.description.slice(0, 60) +
                    (listing.description.length > 60 ? "…" : "")
                  : "No description."
              }
            </p>
            <p class="text-[11px] text-evergreenDark/80 italic">${endsText}</p>
          </div>
          <div class="mt-3 flex justify-between items-center">
            <span class="text-[11px] font-semibold">Bids: ${bidCount}</span>
            <a href="${buttonHref}" class="px-3 py-1 rounded-full bg-evergreenDark text-evergreenTextLight text-[11px] font-semibold hover:bg-black/80 transition">${buttonLabel}</a>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function renderBids(listings = [], ownProfile = true) {
  if (!myBidsEl) return;

  if (!listings.length) {
    myBidsEl.innerHTML = ownProfile
      ? '<p class="text-xs text-evergreenDark/80 text-center">You have not placed any bids yet.</p>'
      : '<p class="text-xs text-evergreenDark/80 text-center">This user has not placed any bids yet.</p>';
    return;
  }

  myBidsEl.innerHTML = listings
    .map((listing) => {
      const img =
        getFirstMediaUrl(listing.media) ||
        "https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg";
      const endsText = formatEndsAt(listing.endsAt);
      const bidCount = listing._count?.bids ?? listing.bids?.length ?? 0;

      return `
      <article class="bg-evergreenCard rounded-lg shadow-md overflow-hidden text-xs flex flex-col">
        <div class="aspect-[4/3] bg-evergreenBg/60">
          <img src="${img}" alt="${
        listing.title || "Listing image"
      }" class="w-full h-full object-cover" />
        </div>
        <div class="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-heading text-sm mb-1">${
              listing.title || "Untitled"
            }</h3>
            <p class="text-[11px] text-evergreenDark/90 mb-1">
              ${
                listing.description
                  ? listing.description.slice(0, 60) +
                    (listing.description.length > 60 ? "…" : "")
                  : "No description."
              }
            </p>
            <p class="text-[11px] text-evergreenDark/80 italic">${endsText}</p>
          </div>
          <div class="mt-3 flex justify-between items-center">
            <span class="text-[11px] font-semibold">Bids: ${bidCount}</span>
            <a href="single-listing.html?id=${
              listing.id
            }" class="px-3 py-1 rounded-full bg-evergreenDark text-evergreenTextLight text-[11px] font-semibold hover:bg-black/80 transition">View listing</a>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

async function fetchUserBidListings(username) {
  const listings = await fetchListings({
    limit: 100,
    sort: "created",
    sortOrder: "desc",
    includeBids: true,
    active: true,
  });

  if (!Array.isArray(listings)) return [];

  return listings.filter((listing) =>
    listing.bids?.some((bid) => {
      if (bid.bidderName) {
        return bid.bidderName === username;
      }
      if (bid.bidder && bid.bidder.name) {
        return bid.bidder.name === username;
      }
      return false;
    })
  );
}

async function initProfilePage() {
  if (!isLoggedIn()) {
    setMessage(
      "You must be logged in to view profiles. Please go to the login page.",
      true
    );
    return;
  }

  const token = getToken();
  const apiKey = getApiKey();

  if (!token || !profileNameToFetch) {
    setMessage("Missing authentication data. Please log in again.", true);
    return;
  }

  setMessage("Loading profile…");

  try {
    const profile = await fetchProfile(
      profileNameToFetch,
      { includeListings: true, includeWins: true },
      token,
      apiKey
    );

    const bidListings = await fetchUserBidListings(profile.name);

    setMessage("");
    renderProfileHeader(profile);
    renderListings(profile.listings || [], isOwnProfile);
    renderBids(bidListings, isOwnProfile);

    if (!isOwnProfile) {
      if (profileActionsWrapper) {
        profileActionsWrapper.classList.add("hidden");
      }

      const ownerEls = document.querySelectorAll(".profile-owner-only");
      ownerEls.forEach((el) => el.classList.add("hidden"));

      if (!profileActionsWrapper && !ownerEls.length) {
        if (editProfileBtn) editProfileBtn.classList.add("hidden");
        if (editAvatarBtn) editAvatarBtn.classList.add("hidden");
        if (createListingBtn) createListingBtn.classList.add("hidden");
      }
    }
  } catch (error) {
    console.error("Profile error:", error);
    setMessage(
      "Could not load profile. Please refresh the page or log in again.",
      true
    );
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logout();
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initProfilePage();
});
