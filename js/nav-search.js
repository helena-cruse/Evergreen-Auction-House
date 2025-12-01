import { API_BASE } from "./api.js";
import { getToken, getApiKey } from "./auth.js";

const searchIconBtn = document.getElementById("navSearchBtn");
const searchWrapper = document.getElementById("searchDropdown");
const searchInput = document.getElementById("navSearchInput");
const resultsBox = document.getElementById("navSearchResults");
const closeSearchBtn = document.getElementById("closeSearchBtn");

let debounceTimer = null;

function clearResults() {
  resultsBox.innerHTML = "";
}

function setMessage(msg) {
  resultsBox.innerHTML = `<p class="text-xs text-center py-2 text-evergreenDark/70">${msg}</p>`;
}

function toggleDropdown(show) {
  if (!searchWrapper) return;
  if (show) searchWrapper.classList.remove("hidden");
  else searchWrapper.classList.add("hidden");
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

  if (listings.length === 0 && profiles.length === 0) {
    return setMessage("No matching results found.");
  }

  const container = document.createElement("div");
  container.className = "space-y-3";

  if (listings.length > 0) {
    const section = document.createElement("div");
    section.innerHTML = `<p class="text-xs font-semibold text-evergreenDark/70 px-2">Listings</p>`;

    listings.slice(0, 6).forEach((item) => {
      const div = document.createElement("a");
      div.href = `single-listing.html?id=${item.id}`;
      div.className =
        "block px-3 py-2 hover:bg-evergreenDark/10 rounded-lg cursor-pointer text-sm";
      div.innerHTML = `
        <span class="font-medium">${item.title}</span>
        <br />
        <span class="text-xs text-evergreenDark/60">${
          item.description?.slice(0, 50) || ""
        }</span>
      `;
      section.appendChild(div);
    });

    container.appendChild(section);
  }

  if (profiles.length > 0) {
    const section = document.createElement("div");
    section.innerHTML = `<p class="text-xs font-semibold text-evergreenDark/70 px-2">Users</p>`;

    profiles.slice(0, 6).forEach((profile) => {
      const div = document.createElement("a");
      div.href = `profile.html?user=${profile.name}`;
      div.className =
        "block px-3 py-2 hover:bg-evergreenDark/10 rounded-lg cursor-pointer text-sm";
      div.innerHTML = `
        <span class="font-medium">${profile.name}</span>
        <br />
        <span class="text-xs text-evergreenDark/60">${profile.email}</span>
      `;
      section.appendChild(div);
    });

    container.appendChild(section);
  }

  resultsBox.appendChild(container);
}

async function runSearch(query) {
  if (!query.trim()) {
    clearResults();
    return;
  }

  setMessage("Searching...");

  const [listings, profiles] = await Promise.all([
    searchListings(query),
    searchProfiles(query),
  ]);

  renderResults(listings, profiles);
}

searchInput?.addEventListener("input", (e) => {
  const value = e.target.value;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runSearch(value), 300);
});

searchIconBtn?.addEventListener("click", () => {
  toggleDropdown(true);
  searchInput?.focus();
});

closeSearchBtn?.addEventListener("click", () => {
  toggleDropdown(false);
  searchInput.value = "";
  clearResults();
});

document.addEventListener("click", (event) => {
  if (
    !searchWrapper.contains(event.target) &&
    !searchIconBtn.contains(event.target)
  ) {
    toggleDropdown(false);
  }
});
