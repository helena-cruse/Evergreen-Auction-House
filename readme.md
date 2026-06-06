# Evergreen Auction House

Evergreen Auction House is an auction platform developed as Semester Project 2 during my Front-End Development studies at Noroff.

The project combines authentication, listing creation, bidding functionality and profile management through the Noroff Auction API. It became the largest and most complex project I worked on during the programme and gave me practical experience building a complete frontend application around live API data.

## Live Site

https://evergreen-auction.netlify.app

## Repository

https://github.com/helena-cruse/Evergreen-Auction-House

---

## Project Overview

Evergreen Auction House allows users to create auction listings, place bids and manage their own profile through a responsive web application.

Visitors can browse active listings without logging in, while registered users gain access to bidding, listing creation and profile management features.

The application was built with a focus on creating a clear browsing experience where users can quickly evaluate listings, monitor bidding activity and manage their own auctions.

---

## Key Features

### Authentication

Users can:

* Register a new account
* Log in and log out
* Access protected functionality
* Store authentication data locally

### Auction Listings

Users can:

* Browse active listings
* Open individual auction pages
* View seller information
* View bid history
* See auction end dates and time remaining

### Bidding

Authenticated users can:

* Place bids on active listings
* View the current highest bid
* Track bidding activity
* Manage their available credits

### Create Listing

Authenticated users can:

* Create new auction listings
* Add descriptions and images
* Set auction end dates
* Publish listings directly through the API

### Profile Area

Users can:

* View profile information
* See listings they have created
* View bidding activity
* Monitor account credits

---

## Portfolio 2 Improvements

For Portfolio 2, I revisited the project and focused on improving the browsing experience and overall usability.

Improvements included:

* Improved listing presentation and visual hierarchy
* Added working price range filtering
* Added an ending-soon filter for auctions ending within three days
* Improved browsing and discovery of active listings
* Refined overall layout and responsive behaviour

The goal was not to rebuild the application, but to improve the parts users interact with most frequently.

---

## Technologies Used

* HTML
* Tailwind CSS
* JavaScript
* Noroff Auction API
* Git
* GitHub
* Netlify
* VS Code

---

## API

The application uses the Noroff Auction API.

Base URL:

```txt
https://v2.api.noroff.dev
```

Main functionality includes:

* User authentication
* Listing retrieval
* Listing creation
* Profile data
* Search functionality
* Bid placement

Authenticated requests use:

```txt
Authorization: Bearer <token>
X-Noroff-API-Key: <api-key>
```

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/helena-cruse/Evergreen-Auction-House.git
```

### Run locally

Open the project in Visual Studio Code and launch a local development server such as Live Server.

No build tools are required.

---

## What I Learned

This project taught me how different parts of a larger application depend on each other.

Working with authentication, API communication, profile management and auction functionality at the same time forced me to think more carefully about user flows and application structure. It also highlighted how important filtering, navigation and information hierarchy become when users are working with larger amounts of content.

Revisiting the project for Portfolio 2 showed me how much stronger an application can become through iteration and refinement rather than adding new features.

Helena Cruse

Portfolio:
https://portfolio2-helena-cruse.netlify.app

GitHub:
https://github.com/helena-cruse

LinkedIn:
https://www.linkedin.com/in/helena-cruse2001/

<img width="1470" height="841" alt="Screenshot 2026-06-06 at 09 31 41" src="https://github.com/user-attachments/assets/6f2da113-3331-49a4-8db7-8954be5a324b" />
<img width="1470" height="841" alt="Screenshot 2026-06-06 at 09 32 16" src="https://github.com/user-attachments/assets/0a2d183f-89af-4973-ba2b-dc792780f647" />

