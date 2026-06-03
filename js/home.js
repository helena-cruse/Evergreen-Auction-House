import { fetchListings } from "./api.js";

const listingsGrid = document.getElementById("listingsGrid");
const sortSelect = document.getElementById("sortSelect");
const categoryInputs = document.querySelectorAll(
  "aside input[type='checkbox']"
);
const priceRangeInput = document.getElementById("priceRangeInput");
const priceRangeValue = document.getElementById("priceRangeValue");

const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;

const endingSoonInput = Array.from(categoryInputs).find((input) =>
  input.closest("label")?.textContent.toLowerCase().includes("ending within")
);

let listingsData = [];

function getHighestBid(listing) {
  if (!listing.bids || listing.bids.length === 0) return null;
  return listing.bids.reduce((max, bid) => Math.max(max, bid.amount), 0);
}

function isEnded(endsAt) {
  return new Date(endsAt) <= new Date();
}

function formatTimeRemaining(endsAt) {
  const diff = new Date(endsAt) - new Date();

  if (diff <= 0) return "Ended";

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
  return `${minutes} min left`;
}

function getListingImage(listing) {
  return (
    listing.media?.find((item) => item?.url)?.url ||
    "https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg"
  );
}

function getSelectedCategories() {
  return Array.from(categoryInputs)
    .filter((input) => input.checked)
    .map((input) => input.closest("label")?.textContent.trim().toLowerCase())
    .filter((value) => value && !value.includes("ending within"));
}

function matchesCategory(listing, selectedCategories) {
  if (selectedCategories.length === 0) return true;

  const searchableText = [
    listing.title,
    listing.description,
    ...(listing.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  return selectedCategories.some((category) =>
    searchableText.includes(category)
  );
}

function getFilteredListings() {
  const selectedCategories = getSelectedCategories();
  const maxPrice = Number(priceRangeInput?.value || 500);

  if (priceRangeValue) {
    priceRangeValue.textContent = maxPrice >= 500 ? "$500+" : `$${maxPrice}`;
  }

  return listingsData.filter((listing) => {
    const highestBid = getHighestBid(listing) ?? 0;
    const timeUntilEnd = new Date(listing.endsAt) - new Date();

    const categoryMatch = matchesCategory(listing, selectedCategories);
    const priceMatch = maxPrice >= 500 ? true : highestBid <= maxPrice;
    const endingSoonMatch = endingSoonInput?.checked
      ? !isEnded(listing.endsAt) && timeUntilEnd <= THREE_DAYS
      : true;

    return categoryMatch && priceMatch && endingSoonMatch;
  });
}

function renderListings(listings) {
  if (!listingsGrid) return;

  if (!listings || listings.length === 0) {
    listingsGrid.innerHTML = `
      <div class="col-span-full bg-evergreenCard rounded-xl border border-evergreenDark/20 p-8 text-center shadow-sm">
        <p class="font-heading text-xl mb-2">No auctions matched your filters.</p>
        <p class="text-sm text-evergreenDark/80">Try changing the category, price range or sort option.</p>
      </div>
    `;
    return;
  }

  listingsGrid.innerHTML = listings
    .map((listing) => {
      const imageUrl = getListingImage(listing);
      const highestBid = getHighestBid(listing);
      const bidCount = listing._count?.bids ?? listing.bids?.length ?? 0;
      const timeRemaining = formatTimeRemaining(listing.endsAt);
      const ended = isEnded(listing.endsAt);
      const tag = listing.tags?.[0] ?? "Auction";

      return `
        <article class="group bg-evergreenCard rounded-2xl shadow-md overflow-hidden flex flex-col border border-evergreenDark/20 hover:-translate-y-1 hover:shadow-xl transition duration-200">
          <a href="single-listing.html?id=${
            listing.id
          }" class="block relative h-48 bg-evergreenBg overflow-hidden">
            <img
              src="${imageUrl}"
              alt="${
                listing.media?.[0]?.alt || listing.title || "Auction listing"
              }"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              loading="lazy"
            />
            <div class="absolute left-3 top-3">
              <span class="px-3 py-1 rounded-full text-[11px] font-semibold ${
                ended
                  ? "bg-red-900 text-red-50"
                  : "bg-evergreenDark text-evergreenTextLight"
              }">
                ${timeRemaining}
              </span>
            </div>
          </a>

          <div class="p-4 flex-1 flex flex-col gap-3">
            <div>
              <p class="text-[11px] uppercase tracking-[0.18em] text-evergreenDark/70 mb-1">${tag}</p>
              <h3 class="font-heading text-lg leading-snug line-clamp-2">
                ${listing.title || "Untitled auction"}
              </h3>
            </div>

            <p class="text-xs text-evergreenDark/80">
              Seller: <span class="font-semibold">${
                listing.seller?.name ?? "Unknown"
              }</span>
            </p>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-xl bg-evergreenBg/70 p-3">
                <p class="uppercase tracking-wide text-evergreenDark/60 text-[10px]">Highest bid</p>
                <p class="font-semibold text-sm">
                  ${highestBid !== null ? `${highestBid},-` : "No bids"}
                </p>
              </div>
              <div class="rounded-xl bg-evergreenBg/70 p-3">
                <p class="uppercase tracking-wide text-evergreenDark/60 text-[10px]">Bids</p>
                <p class="font-semibold text-sm">${bidCount}</p>
              </div>
            </div>

            <a
              href="single-listing.html?id=${listing.id}"
              class="mt-auto w-full bg-evergreenDark text-evergreenTextLight text-xs py-2.5 rounded-full text-center font-semibold hover:bg-black transition"
            >
              View auction
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

function sortListings(option) {
  const sorted = [...getFilteredListings()];

  switch (option) {
    case "endingSoon":
      sorted.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
      break;
    case "priceLowHigh":
      sorted.sort((a, b) => (getHighestBid(a) ?? 0) - (getHighestBid(b) ?? 0));
      break;
    case "priceHighLow":
      sorted.sort((a, b) => (getHighestBid(b) ?? 0) - (getHighestBid(a) ?? 0));
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

  listingsGrid.innerHTML = `
    <div class="col-span-full bg-evergreenCard rounded-xl p-8 text-center shadow-sm">
      <p class="font-heading text-xl mb-2">Loading auctions...</p>
      <p class="text-sm text-evergreenDark/80">Finding active listings from Evergreen Auction House.</p>
    </div>
  `;

  try {
    listingsData = await fetchListings({
      limit: 21,
      sort: "created",
      sortOrder: "desc",
      includeBids: true,
      active: true,
    });

    sortListings(sortSelect?.value || "newest");
  } catch (err) {
    listingsGrid.innerHTML = `
      <div class="col-span-full bg-red-100 border border-red-700/30 text-red-900 rounded-xl p-8 text-center">
        <p class="font-heading text-xl mb-2">Could not load auctions.</p>
        <p class="text-sm">Please refresh the page or try again later.</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHomePage();

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortListings(e.target.value);
    });
  }

  categoryInputs.forEach((input) => {
    input.addEventListener("change", () => {
      sortListings(sortSelect?.value || "newest");
    });
  });

  if (priceRangeInput) {
    priceRangeInput.addEventListener("input", () => {
      sortListings(sortSelect?.value || "newest");
    });
  }
});
