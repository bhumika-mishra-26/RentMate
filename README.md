# Rent & Flatmate Finder 🏠🤖

Rent & Flatmate Finder is a modern full-stack web application designed to connect room owners and looking tenants in India. Leveraging an **AI Compatibility Matching Engine** powered by Google Gemini, the platform helps tenants find compatible roommates and rooms based on locations, budgets, dates, and furnishing preferences, while enabling real-time communications and streamlined administrative control.

---

## 📖 Project Overview

### For Tenants:
* **AI Matches**: View custom compatibility scores (0–100%) and personalized explanations detailing why a room matches your habits/needs.
* **Smart Searching & Filtering**: Search and filter listings by location, budget limits, room type, and furnishing preferences. Sort matches by newest first, rent limits, or AI compatibility.
* **Instant Signal Sending**: Signal interest to landlords with a single click. Start messaging as soon as the landlord accepts.
* **Chat Portal**: Engage in real-time conversations with room owners using interactive typing indicators and message logs.

### For Landlords / Owners:
* **Dashboard Control**: Monitor active listings, available rooms, filled rooms, pending interests, and accepted signals.
* **Multer/Cloudinary Photo Uploads**: Publish rooms with high-quality images stored securely on Cloudinary.
* **Streamlined Signal Review**: View tenant profile details (budgets, target move-in date) alongside their compatibility rating and explanation cards, then accept or decline signals.

---

## 🛠️ Technology Stack

### Backend
* **Core Runtime**: Node.js & Express.js
* **Database & ORM**: PostgreSQL database connected via Prisma ORM
* **Security & Auth**: JWT authentication, bcrypt password hashing, Helmet headers, and Express Rate Limiting
* **Real-time communication**: Socket.IO for chat events
* **Transactional Email notifications**: Nodemailer via SMTP (supports Brevo or local Ethereal)
* **Images Upload**: Multer stream handler with Cloudinary storage integration
* **AI engine**: Google Gemini API (`gemini-1.5-flash`)

### Frontend
* **Core UI**: React (Vite environment)
* **Styling**: Tailwind CSS
* **Icons**: React Icons
* **API Integration**: Axios HTTP clients
* **Client Sockets**: Socket.IO Client for messaging portals

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
# Backend server port
PORT=5000

# Authentication secrets
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# PostgreSQL Connection String (e.g. Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Cloudinary credentials for photo uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI compatibility matching (Google AI Studio key)
GEMINI_API_KEY=your_google_gemini_api_key

# SMTP configuration for transaction emails (Optional - falls back to Ethereal/console logging if omitted)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_verified_email@domain.com
SMTP_PASS=your_brevo_smtp_key
EMAIL_FROM="Rent Finder <your_brevo_verified_email@domain.com>"
```

---

## 📂 Folder Structure

```
Rent-Flatmate-Finder/
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Database SQL migrations
│   │   ├── schema.prisma     # Prisma database schemas
│   │   └── seed.js           # Seeds system admin user
│   ├── src/
│   │   ├── config/           # Database, Mailer, and Cloudinary setups
│   │   ├── controllers/      # Express controllers (Auth, Admin, Listing, Chat, Sockets)
│   │   ├── middlewares/      # Token auth check, role-authorization checks
│   │   ├── routes/           # Express API endpoints mapping
│   │   ├── services/         # Business logic layer (Gemini, Email, Senders)
│   │   ├── utils/            # Hashing and token generators
│   │   └── sockets/          # Socket.io chat handlers
│   ├── server.js             # Main server entrypoint
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/       # Reusable layout and status badges
    │   ├── contexts/         # Authentication and Socket connection states
    │   ├── layouts/          # Dashboard structures
    │   ├── pages/            # View pages (BrowseListings, Dashboards, Profiles, Chat)
    │   ├── services/         # Client Axios API routes (adminService, listingService)
    │   ├── AppRoutes.jsx     # Navigation routes mappings
    │   └── main.jsx          # Vite React entrypoint
    ├── vercel.json           # Client routing fallback rules
    └── package.json
```

---

## 🛢️ Database Schema & Relationships

```mermaid
erDiagram
    User ||--|| TenantProfile : "has"
    User ||--o{ RoomListing : "creates"
    User ||--o{ InterestRequest : "sends"
    User ||--o{ InterestRequest : "receives"
    User ||--o{ Message : "sends"
    User ||--o{ Message : "receives"
    
    TenantProfile ||--o{ CompatibilityScore : "evaluates"
    RoomListing ||--o{ ListingPhoto : "contains"
    RoomListing ||--o{ CompatibilityScore : "evaluates"
    RoomListing ||--o{ InterestRequest : "targets"
    
    InterestRequest ||--o{ Message : "groups"

    User {
        String id PK
        String name
        String email UK
        String phone UK
        String password
        Role role "OWNER / TENANT / ADMIN"
        Boolean isDisabled
        DateTime createdAt
    }

    TenantProfile {
        String id PK
        String preferredLocation
        Int minBudget
        Int maxBudget
        DateTime moveInDate
        String userId FK
    }

    RoomListing {
        String id PK
        String title
        String location
        Int rent
        DateTime availableFrom
        String roomType
        String furnishingStatus
        String description
        ListingStatus status "AVAILABLE / FILLED"
        Boolean isDeleted
        String ownerId FK
    }

    ListingPhoto {
        String id PK
        String imageUrl
        String listingId FK
    }

    CompatibilityScore {
        String id PK
        Int score
        String explanation
        String tenantId FK
        String listingId FK
        DateTime createdAt
    }

    InterestRequest {
        String id PK
        String tenantId FK
        String ownerId FK
        String listingId FK
        InterestStatus status "PENDING / ACCEPTED / REJECTED"
        DateTime createdAt
    }

    Message {
        String id PK
        String content
        String senderId FK
        String receiverId FK
        String interestId FK
        DateTime createdAt
    }

    EmailNotification {
        String id PK
        String to
        String subject
        String body
        String status "SENT / FAILED"
        DateTime createdAt
    }
```

---

## 🤖 AI Matching & Compatibility Fallback

The **AI Compatibility Engine** evaluates matches using a multi-tiered approach:

### 1. The System Prompt (Gemini API)
When a tenant requests listing detail, the backend compiles metadata and triggers a query to Google Gemini:

```
You are an AI assistant for a room rental platform in India.
Analyze the compatibility between this tenant and listing and write a concise, friendly 2-3 sentence explanation of the match.

Tenant Profile:
- Preferred Location: [Tenant Location]
- Budget Range: [Tenant Min Budget] - [Tenant Max Budget]/month
- Move-in Date: [Tenant Move-in Date]

Listing Details:
- Title: [Listing Title]
- Location: [Listing Location]
- Rent: [Listing Rent]/month
- Room Type: [Listing Room Type]
- Furnishing: [Listing Furnishing Status]
- Available From: [Listing Available Date]

Compatibility Score: [Calculated Score]/100

Write the explanation from the perspective of the platform, addressing the tenant directly. Keep it under 60 words. Be honest if the match is poor.
```

### 2. Graceful Fallback (Rule Engine)
If the Gemini API key is missing, network connections fail, or query thresholds are hit, the backend falls back to a deterministic score and explanation:

* **Budget Match (60 Points Max)**:
  * Rent fits perfectly inside Budget Range: `60 points`
  * Rent exceeds max budget by up to 50%: `60 * (1 - deviation) points`
  * Rent exceeds max budget by > 50%: `0 points`
  * Rent is below minimum budget preference: graded scale up to `60 points` based on proximity.
* **Location Match (40 Points Max)**:
  * Listing location matches preferred area name perfectly: `40 points`
  * Partial match/shared words (e.g., neighbor area matches): `25 points`
  * Complete mismatch: `0 points`

---

## 🔌 API Endpoints Map

### Authentication
* `POST /api/auth/register` - Create owner/tenant. Registers credentials and returns JWT.
* `POST /api/auth/login` - Sign in. Blocks access if `isDisabled` is set to true.
* `POST /api/auth/logout` - Clear token session.
* `GET /api/auth/me` - Fetch logged-in user context.

### Room Listings
* `GET /api/listings` - Search active listings. Supports queries for `location`, `maxRent`, `minRent`, `roomType`, `furnishingStatus`, `keyword`, and `sortBy` ("rent-low", "rent-high", "newest").
* `GET /api/listings/my` - Owner's rooms.
* `GET /api/listings/:id` - View single listing.
* `POST /api/listings` - Publish a room (Owners only).
* `PUT /api/listings/:id` - Update room parameters.
* `DELETE /api/listings/:id` - Soft-delete listing (Marks `isDeleted = true`).

### Uploads
* `POST /api/upload/photo` - Multer-driven listing photo upload to Cloudinary. Restricts files to image types under 5MB.

### Sockets & Chat
* `GET /api/chat/conversations` - Retrieve active accepted matches lists.
* `GET /api/chat/:interestId` - Fetch message history logs.
* **Socket Event**: `join_room` - Join room channels.
* **Socket Event**: `send_message` - Dispatch text payload.
* **Socket Event**: `typing` - Broadcast real-time typing indicators.

### System Administration
* `GET /api/admin/stats` - Fetch user/listing counts and registration telemetry.
* `GET /api/admin/users` - Search platform accounts.
* `PATCH /api/admin/user/:id/toggle` - Toggle active/suspended toggle (`isDisabled`).
* `DELETE /api/admin/user/:id` - Delete account and dependants.
* `GET /api/admin/listings` - System-wide listings overview.
* `PATCH /api/admin/listing/:id/fill` - Manually close room matches.
* `DELETE /api/admin/listing/:id` - Admin soft delete room listing.

---

## 🚀 Deployment Guide

### Database (Neon PostgreSQL)
1. Set up a free PostgreSQL database on **[Neon](https://neon.tech)**.
2. Retrieve your connection string `postgresql://...` and set it as `DATABASE_URL` in `.env`.
3. Run `npx prisma db push` to synchronize schemas.

### Backend (Render)
1. Create a web service on **[Render](https://render.com)**.
2. Select your repository, set the root directory to `backend/`, and use the build command `npm install` and start command `npm start`.
3. Add environment variables for `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `GEMINI_API_KEY`.

### Frontend (Vercel)
1. Connect your repository to **[Vercel](https://vercel.com)**.
2. Set the root folder to `frontend/`.
3. Vercel will build the Vite app using configuration rules in `frontend/vercel.json` to handle React Router routing properly.
