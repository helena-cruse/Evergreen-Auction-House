export const API_BASE = "https://v2.api.noroff.dev";

export async function fetchListings({
  limit = 21,
  page = 1,
  sort = "created",
  sortOrder = "desc",
  active = true,
  includeBids = true,
} = {}) {
  const url = new URL(`${API_BASE}/auction/listings`);
  const params = url.searchParams;

  params.set("limit", limit);
  params.set("page", page);
  params.set("sort", sort);
  params.set("sortOrder", sortOrder);

  params.set("_seller", "true");

  if (active) params.set("_active", "true");
  if (includeBids) params.set("_bids", "true");

  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("Error fetching listings:", response.status, errorBody);
    throw new Error("Failed to fetch listings");
  }

  const json = await response.json();
  return json.data || [];
}

export async function fetchListingById(id, { includeBids = true } = {}) {
  const url = new URL(`${API_BASE}/auction/listings/${id}`);

  url.searchParams.set("_seller", "true");

  if (includeBids) {
    url.searchParams.set("_bids", "true");
  }

  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error("Error fetching listing:", response.status, errorBody);
    throw new Error(
      errorBody.errors?.[0]?.message || "Failed to fetch listing"
    );
  }

  const json = await response.json();
  return json.data;
}

export async function fetchProfile(
  name,
  { includeListings = true, includeWins = true } = {},
  token,
  apiKey
) {
  const url = new URL(`${API_BASE}/auction/profiles/${name}`);

  if (includeListings) url.searchParams.set("_listings", "true");
  if (includeWins) url.searchParams.set("_wins", "true");

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (apiKey) headers["X-Noroff-API-Key"] = apiKey;

  const response = await fetch(url, { headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Error fetching profile:", response.status, data);
    throw new Error(
      (data && data.errors && data.errors[0]?.message) ||
        data?.message ||
        "Failed to fetch profile"
    );
  }

  return data.data || data;
}

export async function searchListings(query) {
  const url = new URL(`${API_BASE}/auction/listings/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("_seller", "true");

  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Error searching listings:", response.status, data);
    throw new Error(
      (data && data.errors && data.errors[0]?.message) ||
        data?.message ||
        "Failed to search listings"
    );
  }

  return data.data || [];
}

export async function searchProfiles(query, token, apiKey) {
  const url = new URL(`${API_BASE}/auction/profiles/search`);
  url.searchParams.set("q", query);

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (apiKey) headers["X-Noroff-API-Key"] = apiKey;

  const response = await fetch(url, { headers });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Error searching profiles:", response.status, data);
    throw new Error(
      (data && data.errors && data.errors[0]?.message) ||
        data?.message ||
        "Failed to search profiles"
    );
  }

  return data.data || [];
}

export async function placeBid(listingId, amount, token, apiKey) {
  const response = await fetch(
    `${API_BASE}/auction/listings/${listingId}/bids`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": apiKey,
      },
      body: JSON.stringify({ amount: Number(amount) }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Error placing bid:", response.status, data);
    throw new Error(
      (data && data.errors && data.errors[0]?.message) ||
        data?.message ||
        "Failed to place bid"
    );
  }

  return data.data || data;
}
