# 🏡 Airbnb Clone

> A production-inspired full-stack web application replicating core features
> of Airbnb — built with Node.js, Express.js, EJS & MongoDB.

---

## ✨ Features

- 🔐 **User Authentication** — Secure Register, Login & Logout functionality
- 🛡️ **JWT Authorization** — Token-based protected routes with ownership-based access control
- 🏘️ **Listings (CRUD)** — Create, Read, Update & Delete property listings with image support
- ⭐ **Reviews & Ratings** — Authenticated users can review and rate any listing
- 🗺️ **Map Integration** — Interactive map showing exact property location
- 🔍 **Search & Filter** — Find listings by location and preferences
- 📱 **Responsive UI** — Fully responsive design across all screen sizes

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🖥️ Frontend | HTML5, CSS3, JavaScript, EJS |
| ⚙️ Backend | Node.js, Express.js |
| 🗄️ Database | MongoDB, Mongoose |
| 🔐 Auth & Security | JWT (JSON Web Tokens) |
| 🏗️ Architecture | MVC (Model-View-Controller) |
| 🔧 Dev Tool | Nodemon |
| 🚀 Deployment | Render / Railway |

---

## 🔐 Auth Flow

1. User registers with **hashed password** securely stored in MongoDB
2. On login, a **JWT token** is generated & saved for session management
3. Every protected route **validates the token** before granting access
4. **Ownership check** — Only the listing owner can edit or delete their property
5. Unauthorized users are **redirected** with proper error handling

---

## 📁 Project Structure (MVC)

```
airbnb-clone/
│
├── 📂 models/          # Mongoose Schemas — User, Listing, Review
├── 📂 views/           # EJS Templates — All UI pages
│   ├── listings/       # Listing pages (index, show, new, edit)
│   ├── users/          # Login & Register pages
│   └── partials/       # Navbar, Footer, Flash messages
│
├── 📂 controllers/     # Business Logic — handles request & response
├── 📂 routes/          # Express Routers — listing, user, review routes
├── 📂 middleware/       # Auth & Authorization Middleware
├── 📂 public/          # Static files — CSS, JS, Images
│   ├── css/
│   └── js/
│
├── 📂 utils/           # Error Handling & Async Wrappers
├── .env                # Environment Variables
├── package.json
└── app.js              # 🚀 Entry Point
```

---

## 🚀 Run Locally

```bash
# Clone the repository
git clone https://github.com/Raj143verma/Wanderlust.git

# Navigate into the project
cd major project

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start the development server
nodemon app.js
```

---

⭐ **Star this repo** if you found it helpful!
