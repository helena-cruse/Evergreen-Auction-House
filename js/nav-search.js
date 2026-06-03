import { API_BASE } from "./api.js";
import { getToken, getApiKey } from "./auth.js";

const searchIconBtn = document.getElementById("navSearchBtn");
const searchWrapper = document.getElementById("searchDropdown");
const searchInput = document.getElementById("navSearchInput");
const resultsBox = document.getElementById("navSearchResults");
const closeSearchBtn = document.getElementById("closeSearchBtn");

let debounceTimer = null;

function clearResults() {
  if (!resultsBox) return;
  resultsBox.innerHTML = "";
}

function setMessage(message) {
  if (!resultsBox) return;
  resultsBox.innerHTML = `<p class="text-xs text-center py-3 text-evergreenDark/70">${message}</p>`;
}

function toggleDropdown(show) {
  if (!searchWrapper) return;

  searchWrapper.classList.toggle("hidden", !show);

  if (show) {
    searchInput?.focus();
  }
}

async function searchListings(query) {
  if (!query.trim()) return [];

  const url = new URL(`${API_BASE}/auction/listings/search`);
  url.searchParams.set("q", query);

  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Listing search failed:", response.status, data);
    return [];
  }

  return data?.data || [];
}

async function searchProfiles(query) {
  const token = getToken();
  const apiKey = getApiKey();

  if (!token || !apiKey) return [];

  const url = new URL(`${API_BASE}/auction/profiles/search`);
  url.searchParams.set("q", query);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": apiKey,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.warn("Profile search failed:", response.status);
    return [];
  }

  return data?.data || [];
}

function renderResults(listings = [], profiles = []) {
  clearResults();

  if (!resultsBox) return;

  if (listings.length === 0 && profiles.length === 0) {
    setMessage("No matching results found.");
    return;
  }

  const container = document.createElement("div");
  container.className = "space-y-4";

  if (listings.length > 0) {
    const section = document.createElement("div");
    section.innerHTML = `<p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-evergreenDark/60 px-2 mb-1">Listings</p>`;

    listings.slice(0, 6).forEach((item) => {
      const link = document.createElement("a");
      link.href = `single-listing.html?id=${item.id}`;
      link.className =
        "block px-3 py-2 hover:bg-evergreenDark/10 rounded-xl text-sm transition";

      link.innerHTML = `
        <span class="font-semibold">${item.title || "Untitled listing"}</span>
        <br />
        <span class="text-xs text-evergreenDark/60">
          ${item.description?.slice(0, 56) || "View auction details"}
        </span>
      `;

      section.appendChild(link);
    });

    container.appendChild(section);
  }

  if (profiles.length > 0) {
    const section = document.createElement("div");
    section.innerHTML = `<p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-evergreenDark/60 px-2 mb-1">Users</p>`;

    profiles.slice(0, 6).forEach((profile) => {
      const link = document.createElement("a");
      link.href = `profile.html?user=${profile.name}`;
      link.className =
        "block px-3 py-2 hover:bg-evergreenDark/10 rounded-xl text-sm transition";

      link.innerHTML = `
        <span class="font-semibold">${profile.name}</span>
        <br />
        <span class="text-xs text-evergreenDark/60">${
          profile.email || ""
        }</span>
      `;

      section.appendChild(link);
    });

    container.appendChild(section);
  }

  resultsBox.appendChild(container);
}

async function runSearch(query) {
  if (!query.trim()) {
    setMessage("Type to search listings.");
    return;
  }

  setMessage("Searching...");

  const [listings, profiles] = await Promise.all([
    searchListings(query),
    searchProfiles(query),
  ]);

  renderResults(listings, profiles);
}

searchInput?.addEventListener("input", (event) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runSearch(event.target.value), 300);
});

searchIconBtn?.addEventListener("click", () => {
  toggleDropdown(true);
  setMessage("Type to search listings.");
});

closeSearchBtn?.addEventListener("click", () => {
  toggleDropdown(false);

  if (searchInput) {
    searchInput.value = "";
  }

  clearResults();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toggleDropdown(false);
  }
});

document.addEventListener("click", (event) => {
  if (!searchWrapper || !searchIconBtn) return;

  if (
    !searchWrapper.contains(event.target) &&
    !searchIconBtn.contains(event.target)
  ) {
    toggleDropdown(false);
  }
});
