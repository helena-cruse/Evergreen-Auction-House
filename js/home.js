import { fetchListings } from "./api.js";

const listingsGrid = document.getElementById("listingsGrid");
const sortSelect = document.getElementById("sortSelect");

let listingsData = [];

function getHighestBid(listing) {
  if (!listing.bids || listing.bids.length === 0) {
    return null;
  }
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

function getListingImage(listing) {
  if (listing.media && listing.media.length > 0 && listing.media[0].url) {
    return listing.media[0].url;
  }
  return "https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg";
}

function renderListings(listings) {
  if (!listingsGrid) return;

  if (!listings || listings.length === 0) {
    listingsGrid.innerHTML =
      '<p class="col-span-full text-sm text-center text-evergreenDark/80">No listings found.</p>';
    return;
  }

  const html = listings
    .map((listing) => {
      const imageUrl = getListingImage(listing);
      const highestBid = getHighestBid(listing);
      const bidCount = listing._count?.bids ?? listing.bids?.length ?? 0;
      const timeRemaining = formatTimeRemaining(listing.endsAt);
      const tag = listing.tags?.[0] ?? "Auction";

      return `
        <article
          class="bg-evergreenCard rounded-xl shadow-sm overflow-hidden flex flex-col border border-evergreenDark/20"
        >
          <div
            class="h-40 bg-cover bg-center"
            style="background-image: url('${imageUrl}');"
          ></div>

          <div class="p-3.5 text-sm flex-1 flex flex-col gap-1.5">
            <h3 class="font-heading text-base leading-snug line-clamp-2">
              ${listing.title}
            </h3>

            <p class="text-xs text-evergreenDark/80">
              Seller: <span class="font-semibold">${
                listing.seller?.name ?? "Unknown"
              }</span>
            </p>

            <p class="font-semibold text-sm">
              ${
                highestBid !== null
                  ? `Current bid: ${highestBid},-`
                  : "No bids yet"
              }
            </p>

            <p class="text-[11px] uppercase tracking-wide text-evergreenDark/80">
              ${timeRemaining}
            </p>

            <div class="mt-2 flex gap-2 text-xs flex-wrap">
              <span class="px-2 py-0.5 rounded-full bg-evergreenBg/60">
                ${bidCount} bid${bidCount === 1 ? "" : "s"}
              </span>
              <span class="px-2 py-0.5 rounded-full border border-evergreenDark/30">
                ${tag}
              </span>
            </div>

            <a
              href="single-listing.html?id=${listing.id}"
              class="mt-3 w-full bg-evergreenDark text-evergreenTextLight text-xs py-1.5 rounded-full 
                     text-center font-medium hover:bg-black/80 transition"
            >
              View listing
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  listingsGrid.innerHTML = html;
}

function sortListings(option) {
  const sorted = [...listingsData];

  switch (option) {
    case "endingSoon":
      sorted.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
      break;

    case "priceLowHigh":
      sorted.sort((a, b) => {
        return (getHighestBid(a) ?? 0) - (getHighestBid(b) ?? 0);
      });
      break;

    case "priceHighLow":
      sorted.sort((a, b) => {
        return (getHighestBid(b) ?? 0) - (getHighestBid(a) ?? 0);
      });
      break;

    case "newest":
    default:
      sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
      break;
  }

  renderListings(sorted);
}

async function initHomePage() {
  if (!listingsGrid) return;

  listingsGrid.innerHTML =
    '<p class="col-span-full text-sm text-center text-evergreenDark/80">Loading listings...</p>';

  try {
    const data = await fetchListings({
      limit: 21,
      sort: "created",
      sortOrder: "desc",
      includeBids: true,
      active: true,
    });

    listingsData = data;
    sortListings(sortSelect.value);
  } catch (err) {
    listingsGrid.innerHTML =
      '<p class="col-span-full text-center text-red-700">Failed to load listings.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHomePage();

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortListings(e.target.value);
    });
  }
});
