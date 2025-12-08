# Evergreen Auction House

Semester Project 2 – Front-End Development

## Description

Evergreen Auction House is a front-end application built for Semester Project 2.  
The website allows users to register, log in, browse listings, view single listings, place bids, and create their own listings. All data is retrieved from the Noroff Auction API.

The goal of the project was to build a functional and responsive user interface using HTML, Tailwind CSS, and JavaScript, while working with live API data and authentication.

## Features

### Authentication

- Register new users
- Log in with email and password
- Token is stored in LocalStorage
- Logged-in users see different UI elements than visitors
- The "Unregistered users can browse listings" message is hidden when logged in

### Listings

- Fetch and display all listings from the Noroff Auction API
- Each listing card shows title, image, seller name, and number of bids
- Clicking a listing card opens the single listing page

### Single Listing Page

- Displays all listing details including:
  - Title
  - Description
  - Seller
  - Bids
  - Time remaining
- Image carousel:
  - Shows one image at a time
  - Left and right arrows for navigation
- Bid functionality for logged-in users

### Create Listing

- Form to create a new listing with:
  - Title
  - Description
  - End date
  - Image URL
- Sends data to the API
- Shows validation or error messages if needed

### Profile Page

- Displays the logged-in user’s information
- Shows:
  - User’s own listings
  - User’s bids
- Loads all profile data from the API using the stored token

## Credits System

The Noroff Auction API uses a credit-based system.  
All new users start with 1000 credits.

Credits affect:

- Bidding (users must have enough credits to place bids)
- Displaying the user's remaining balance on the profile page

## Technologies Used

- HTML5
- CSS with Tailwind (CDN)
- JavaScript
- Noroff Auction API
- Git and GitHub
- VS Code
- Netlify

## API Usage

The project communicates with the Noroff Auction API at:

`https://v2.api.noroff.dev`

All requests are made using `fetch` with basic error handling, and authenticated requests include a bearer token and a static API key when required.

### Authentication

- `POST /auth/register` – Creates a new user (name, email, password, optional avatar).
- `POST /auth/login` – Authenticates a user and returns an access token.  
  The token and profile data are stored in `localStorage` for later use.

### Listings

- `GET /auction/listings`  
  Used for the main feed. Supports the following query parameters:

  - `limit`, `page`, `sort`, `sortOrder`
  - `_seller=true` to include seller data
  - `_active=true` to filter active listings
  - `_bids=true` to include bid information

- `GET /auction/listings/:id`  
  Retrieves a single listing with optional `_seller` and `_bids` data.

### Profile

- `GET /auction/profiles/:name`  
  Used to load the logged-in user's profile, listings, and wins.  
  Supports:
  - `_listings=true`
  - `_wins=true`

Authenticated requests include:

- `Authorization: Bearer <token>`
- `X-Noroff-API-Key: <api-key>`

### Search

- `GET /auction/listings/search?q=<term>&_seller=true`
- `GET /auction/profiles/search?q=<term>`

Used for the site's search functionality.

### Bids

- `POST /auction/listings/:id/bids`  
  Places a bid on a listing.  
  Requires authentication and sends `{ amount: Number }` in the request body.

## Running the Project

1. Clone the repository:
2. Open the project in VS Code
3. Use a local server such as Live Server
4. Open `index.html`

No build tools are required.

## Testing

The project has been manually tested for:

- Registering and logging in
- Token storage and logout
- Viewing listings and single listings
- Carousel functionality with one or more images
- Creating a listing
- Placing bids
- API error handling
- Responsive design (mobile, tablet, desktop)

## Author

Helena Cruse  
Front-End Development, Noroff  
2025
