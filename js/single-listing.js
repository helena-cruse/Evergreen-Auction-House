import { fetchListingById, placeBid } from "./api.js";
import { getProfileName, getToken, isLoggedIn, getApiKey } from "./auth.js";

const listingTitleEl = document.getElementById("listingTitle");
const listingIdEl = document.getElementById("listingId");
const listingSellerEl = document.getElementById("listingSeller");
const listingTimeEl = document.getElementById("listingTime");
const listingPriceEl = document.getElementById("listingPrice");
const listingBidsCountEl = document.getElementById("listingBidsCount");
const listingTagsEl = document.getElementById("listingTags");
const listingDescriptionEl = document.getElementById("listingDescription");
const bidsListEl = document.getElementById("bidsList");

const listingCarouselEl = document.getElementById("listingCarousel");
const prevImageBtn = document.getElementById("prevImageBtn");
const nextImageBtn = document.getElementById("nextImageBtn");
const carouselCounterEl = document.getElementById("carouselCounter");

const endedMessageEl = document.getElementById("endedMessage");
const ownerMessageEl = document.getElementById("ownerMessage");
const notLoggedInMessageEl = document.getElementById("notLoggedInMessage");
const bidFormSectionEl = document.getElementById("bidFormSection");
const bidForm = document.getElementById("bidForm");
const bidAmountInput = document.getElementById("bidAmount");
const bidStatusEl = document.getElementById("bidStatus");

let currentListing = null;

let carouselMedia = [];
let activeIndex = 0;
let galleryIntervalId = null;
let carouselControlsInitialized = false;

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getHighestBid(listing) {
  if (!listing?.bids || listing.bids.length === 0) return null;
  return listing.bids.reduce((max, bid) => {
    return bid.amount > max ? bid.amount : max;
  }, 0);
}

function formatTimeRemaining(endsAt) {
  const end = new Date(endsAt);
  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `Ends in ${days} day${days > 1 ? "s" : ""}`;
  if (hours > 0) return `Ends in ${hours} hour${hours > 1 ? "s" : ""}`;

  const minutes = Math.floor(diff / (1000 * 60));
  return `Ends in ${minutes} min`;
}

function renderGallery(listing) {
  const media = listing.media || [];

  if (galleryIntervalId) {
    clearInterval(galleryIntervalId);
    galleryIntervalId = null;
  }

  listingCarouselEl.innerHTML = "";
  carouselMedia = [];
  activeIndex = 0;

  let sources = media;

  if (sources.length === 0 || !sources[0].url) {
    sources = [
      {
        url: "https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg",
        alt: listing.title || "Listing image",
      },
    ];
  }

  sources.forEach((item, index) => {
    if (!item?.url) return;

    const img = document.createElement("img");
    img.src = item.url;
    img.alt = item.alt || listing.title || `Listing image ${index + 1}`;
    img.className = "carousel-image";

    listingCarouselEl.appendChild(img);
    carouselMedia.push(img);
  });

  if (carouselMedia.length === 0) return;

  updateCarouselDisplay();

  if (!carouselControlsInitialized) {
    if (prevImageBtn) {
      prevImageBtn.addEventListener("click", () => {
        goToSlide(activeIndex - 1, { resetTimer: true });
      });
    }
    if (nextImageBtn) {
      nextImageBtn.addEventListener("click", () => {
        goToSlide(activeIndex + 1, { resetTimer: true });
      });
    }
    carouselControlsInitialized = true;
  }

  if (carouselMedia.length > 1) {
    startCarouselAutoplay();
  } else {
    if (carouselCounterEl) {
      carouselCounterEl.textContent = "1 / 1";
    }
  }
}

function updateCarouselDisplay() {
  carouselMedia.forEach((img, index) => {
    if (index === activeIndex) {
      img.classList.add("carousel-image--active");
    } else {
      img.classList.remove("carousel-image--active");
    }
  });

  if (carouselCounterEl && carouselMedia.length > 0) {
    carouselCounterEl.textContent = `${activeIndex + 1} / ${
      carouselMedia.length
    }`;
  }
}

function goToSlide(index, { resetTimer = false } = {}) {
  if (carouselMedia.length === 0) return;

  if (index < 0) {
    activeIndex = carouselMedia.length - 1;
  } else if (index >= carouselMedia.length) {
    activeIndex = 0;
  } else {
    activeIndex = index;
  }

  updateCarouselDisplay();

  if (resetTimer && carouselMedia.length > 1) {
    startCarouselAutoplay();
  }
}

function startCarouselAutoplay() {
  if (galleryIntervalId) {
    clearInterval(galleryIntervalId);
  }
  galleryIntervalId = setInterval(() => {
    goToSlide(activeIndex + 1);
  }, 1300);
}

function renderBids(listing) {
  const bids = listing.bids || [];

  if (bids.length === 0) {
    bidsListEl.innerHTML =
      '<p class="text-xs text-evergreenDark/80">No bids yet.</p>';
    return;
  }

  const sorted = [...bids].sort(
    (a, b) => new Date(b.created) - new Date(a.created)
  );

  bidsListEl.innerHTML = sorted
    .map(
      (bid) => `
      <div class="flex justify-between items-center text-xs border-b border-evergreenDark/20 py-1">
        <span>
          <span class="font-semibold">${bid.bidder?.name || "Unknown"}</span>
        </span>
        <span class="font-semibold">${bid.amount},-</span>
      </div>
    `
    )
    .join("");
}

function renderListing(listing) {
  currentListing = listing;

  listingTitleEl.textContent = listing.title || "Listing";
  listingIdEl.textContent = listing.id || "";
  listingSellerEl.textContent = listing.seller?.name || "Unknown";

  const highestBid = getHighestBid(listing);
  const bidsCount = listing._count?.bids ?? listing.bids?.length ?? 0;

  listingPriceEl.textContent =
    highestBid !== null
      ? `Current bid: ${highestBid},-`
      : "No bids yet – be the first!";
  listingBidsCountEl.textContent = `${bidsCount} bid${
    bidsCount === 1 ? "" : "s"
  }`;

  listingTimeEl.textContent = formatTimeRemaining(listing.endsAt);

  const tags = listing.tags || [];
  if (tags.length === 0) {
    listingTagsEl.innerHTML =
      '<span class="px-2 py-0.5 rounded-full border border-evergreenDark/30 text-[11px]">No tags</span>';
  } else {
    listingTagsEl.innerHTML = tags
      .map(
        (tag) =>
          `<span class="px-2 py-0.5 rounded-full border border-evergreenDark/30 text-[11px]">${tag}</span>`
      )
      .join("");
  }

  listingDescriptionEl.textContent =
    listing.description || "No description provided.";

  renderGallery(listing);
  renderBids(listing);
  updateBidSectionState();
}

function isAuctionEnded() {
  if (!currentListing?.endsAt) return false;
  const end = new Date(currentListing.endsAt);
  return end <= new Date();
}

function isCurrentUserSeller() {
  const profileName = getProfileName();
  if (!profileName || !currentListing?.seller?.name) return false;
  return profileName.toLowerCase() === currentListing.seller.name.toLowerCase();
}

function updateBidSectionState() {
  const loggedIn = isLoggedIn();

  endedMessageEl.classList.add("hidden");
  ownerMessageEl.classList.add("hidden");
  notLoggedInMessageEl.classList.add("hidden");
  bidFormSectionEl.classList.add("hidden");

  if (isAuctionEnded()) {
    endedMessageEl.classList.remove("hidden");
    return;
  }

  if (!loggedIn) {
    notLoggedInMessageEl.classList.remove("hidden");
    return;
  }

  if (isCurrentUserSeller()) {
    ownerMessageEl.classList.remove("hidden");
    return;
  }

  bidFormSectionEl.classList.remove("hidden");
}

async function handleBidSubmit(event) {
  event.preventDefault();
  if (!currentListing) return;

  const token = getToken();
  const apiKey = getApiKey();

  if (!token || !apiKey) {
    bidStatusEl.textContent =
      "You must be logged in with a valid API key to place a bid.";
    bidStatusEl.className = "text-xs text-red-800";
    return;
  }

  const amount = Number(bidAmountInput.value);
  const highestBid = getHighestBid(currentListing) ?? 0;

  if (!amount || amount <= highestBid) {
    bidStatusEl.textContent =
      "Your bid must be higher than the current highest bid.";
    bidStatusEl.className = "text-xs text-red-800";
    return;
  }

  bidStatusEl.textContent = "Placing bid...";
  bidStatusEl.className = "text-xs text-evergreenDark/80";

  try {
    await placeBid(currentListing.id, amount, token, apiKey);
    bidAmountInput.value = "";
    bidStatusEl.textContent = "Bid placed successfully!";
    bidStatusEl.className = "text-xs text-green-800";

    const refreshed = await fetchListingById(currentListing.id, {
      includeBids: true,
    });
    renderListing(refreshed);
  } catch (error) {
    bidStatusEl.textContent = error.message || "Failed to place bid.";
    bidStatusEl.className = "text-xs text-red-800";
  }
}

async function initSingleListing() {
  const id = getQueryId();
  if (!id) {
    listingTitleEl.textContent = "Listing not found";
    listingDescriptionEl.textContent =
      "Missing listing ID in the URL. Please go back to the listings page.";
    return;
  }

  try {
    const listing = await fetchListingById(id, { includeBids: true });
    renderListing(listing);
  } catch (error) {
    listingTitleEl.textContent = "Listing not found";
    listingDescriptionEl.textContent =
      error.message || "We couldn't load this listing.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSingleListing();

  if (bidForm) {
    bidForm.addEventListener("submit", handleBidSubmit);
  }
});
