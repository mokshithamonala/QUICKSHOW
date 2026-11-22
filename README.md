# 🎬 QUICKSHOW — Full-Stack Movie Discovery & Cinema Ticket Booking Platform

**QUICKSHOW** is a full-stack movie discovery and cinema ticket booking platform designed to provide users with a seamless movie browsing, authentication, and online booking experience.

The platform combines a modern React interface with a Node.js and Express backend, MongoDB database, Clerk authentication, TMDB movie data, and Razorpay payment integration.

🌐 **Live Website:** https://quickshow-frontend-oh96.onrender.com

---

## 🚀 Project Overview

QUICKSHOW aims to simplify the movie discovery and ticket booking experience through an intuitive interface and integrated backend services.

Users can explore movies, discover movie information, authenticate securely, and interact with the booking and payment workflows.

The application follows a full-stack architecture with separate frontend and backend workspaces.

## ✨ Key Features

- 🎥 **Movie Discovery:** Browse and explore movies using TMDB integration.
- 🔍 **Movie Search:** Discover movies through search functionality.
- 🔐 **Authentication:** Secure user authentication using Clerk.
- 🎟️ **Ticket Booking:** Movie ticket booking workflow.
- 💳 **Payment Integration:** Razorpay integration with test payment support.
- 👤 **User Management:** Authentication-based user access.
- 🛡️ **Admin Authorization:** Admin access management using configured email addresses and Clerk public metadata.
- ⚡ **Background Workflows:** Inngest integration for event-driven workflows.
- 📱 **Responsive Interface:** React-based frontend designed for different screen sizes.

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | Clerk |
| Movie Data | TMDB API |
| Payments | Razorpay |
| Background Jobs | Inngest |
| Package Management | npm Workspaces |
| Deployment | Render |
| Version Control | Git, GitHub |

## 🏗️ Project Architecture

```text
QUICKSHOW/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── server.js
│   ├── configs/
│   ├── middleware/
│   ├── inngest/
│   └── package.json
│
├── package.json
├── .env.example
└── README.md
```

The project uses npm workspaces to manage the frontend and backend within a single repository.

## ⚙️ Getting Started

Follow these instructions to run QUICKSHOW locally.

### 1. Clone the Repository

```bash
git clone https://github.com/mokshithamonala/QUICKSHOW.git
```

### 2. Navigate to the Project

```bash
cd QUICKSHOW
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create the necessary `.env` files based on the provided `.env.example` template.

Configure the required frontend and backend environment variables.

### 5. Run the Application

**Run the backend:**

```bash
npm start
```

**Run the frontend and backend together in development mode:**

```bash
npm run dev
```

**Run the frontend and backend separately:**

```bash
npm run dev:client
```

```bash
npm run dev:server
```

**Build the frontend:**

```bash
npm run build
```

## 🔑 Environment Variables

Configure the following variables before running the application.

### Backend Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB connection string |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key, if required by backend |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |
| `TMDB_ACCESS_TOKEN` | TMDB API read access token |
| `TMDB_API_KEY` | TMDB API key |
| `RAZORPAY_KEY_ID` | Razorpay test/live key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret |
| `INNGEST_EVENT_KEY` | Inngest event key |
| `INNGEST_SIGNING_KEY` | Inngest signing key |

### Frontend Environment Variables

| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_CURRENCY` | Application currency symbol |
| `VITE_API_URL` | Deployed backend API base URL |

**Important:** Never expose secret keys in frontend environment variables or commit real credentials to GitHub.

## 🌐 Deployment

QUICKSHOW is deployed using Render.

The frontend and backend are deployed as separate services.

### Frontend Deployment

- Platform: Render Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `client/dist`
- Environment: Production

### Backend Deployment

- Platform: Render Web Service
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Environment: Production

### Production Configuration

After deploying both services:

1. Configure the frontend `VITE_API_URL` with the deployed backend URL.
2. Configure backend CORS to allow the deployed frontend origin.
3. Configure the production authentication domain in Clerk.
4. Verify MongoDB connectivity.
5. Configure Razorpay test credentials and webhook settings where required.

## 💳 Payment Integration

QUICKSHOW integrates Razorpay to support the payment workflow.

The project includes configurable payment modes:

- `razorpay_test` — Razorpay test mode.
- `razorpay_live` — Razorpay live mode.
- `simulated` — Simulated payment mode for offline development.

Live payments require valid production credentials and appropriate gateway configuration.

## 🔐 Security

- Environment-based configuration for sensitive credentials.
- Clerk-based authentication.
- Backend-side authorization checks.
- Admin access control.
- Secure handling of payment credentials.
- CORS configuration for frontend/backend communication.

Never commit `.env` files or expose private API keys.

## 🔮 Future Enhancements

- Enhanced movie recommendation system.
- Improved personalized movie discovery.
- Advanced booking management.
- Enhanced user dashboard.
- Additional cinema and theatre discovery capabilities.
- Improved performance and scalability.

## 👩‍💻 Developer

**Sai Mokshitha Monala**

- GitHub: https://github.com/mokshithamonala
- Project: [QUICKSHOW](https://github.com/mokshithamonala/QUICKSHOW)
- Live Application: https://quickshow-frontend-oh96.onrender.com

---

⭐ If you find QUICKSHOW interesting, consider giving the repository a star!

**QUICKSHOW — Discover Movies. Book Tickets. Enjoy the Experience.**
