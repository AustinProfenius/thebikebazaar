# BikeBazaar

A marketplace for bicycle lovers to browse, buy, and sell bikes and accessories.

## Features

- **Browse Listings** — View all bikes for sale with search functionality
- **User Accounts** — Sign up, log in, and manage your profile
- **Create Listings** — Post bikes for sale with title, condition, price, details, and images
- **Make Offers** — Submit offers on bikes you're interested in
- **Manage Listings** — Edit or delete your own listings

## Tech Stack

- **Runtime:** Node.js + Express
- **Database:** MongoDB (Mongoose ODM)
- **Views:** EJS templates
- **Auth:** bcrypt password hashing + express-session
- **File Uploads:** Multer
- **Validation:** express-validator

## Getting Started

### Prerequisites

- Node.js (v18+)
- A MongoDB instance (local or Atlas)

### Install & Run

```bash
git clone https://github.com/AustinProfenius/thebikebazaar.git
cd thebikebazaar
npm install
npm start
```

The app runs at `http://localhost:3000` by default.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | Falls back to hardcoded Atlas URI |

## Project Structure

```
├── app.js              # Express app setup and configuration
├── controllers/        # Route handlers
├── middlewares/         # Auth and validation middleware
├── models/             # Mongoose schemas (Bike, User, Offer)
├── routes/             # Express route definitions
├── views/              # EJS templates
│   ├── bike/           # Listing pages (index, new, edit, view)
│   ├── user/           # Auth pages (login, signup, profile)
│   ├── offers/         # Offer pages
│   └── partials/       # Shared header, footer, nav, flash
├── public/             # Static assets (CSS)
└── images/             # Uploaded images
```

## Live Site

[thebikebazaar.com](https://thebikebazaar.com)
