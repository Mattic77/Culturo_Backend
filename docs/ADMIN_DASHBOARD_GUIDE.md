# 🛡️ Culturo Admin Dashboard - Developer Guide

This document provides the blueprint for building a **separate, dedicated web application** for administrators to manage the Culturo platform.

## 🎯 Purpose
The Admin Dashboard allows platform administrators to manage content (Quizzes, Categories, Countries), monitor users (Progression, Roles, Bans), and track overall platform statistics (Battles played, Active sessions) without interfering with the main mobile/web game client.

---

## 🏗️ Technical Recommendations
- **Framework:** React.js, Next.js, or Vue.js.
- **Styling:** Tailwind CSS or Material UI for rapid dashboard development.
- **State Management:** Redux Toolkit or React Query (highly recommended for caching API responses).
- **Routing:** React Router (if using React) or Next.js App Router.

---

## 🔐 Authentication & Authorization
**Important:** The admin dashboard MUST enforce strict Role-Based Access Control (RBAC).

1. **Login Flow:** The admin logs in via the standard `/auth/login` endpoint.
2. **Role Check:** Upon login, decode the JWT or fetch the profile via `GET /users/getme`. You MUST verify that `userType === 'admin'`.
3. **Guard:** If `userType !== 'admin'`, immediately log the user out and show an "Unauthorized" error. Do not let non-admin users access the dashboard interface.
4. **Token Storage:** Store the JWT securely (e.g., in HTTP-only cookies or secure local storage) and attach it as a `Bearer` token to all API requests.

---

## 🚀 Key Modules & Features

### 1. 👥 User Management
- **Feature:** View, search, and manage registered users.
- **Endpoints Needed:**
  - `GET /users/admin/all`: Fetch a paginated list of all users with level data.
  - `PATCH /users/admin/user-type/:id`: Change user role (e.g., promote to 'admin' or demote to 'user').
  - `GET /users/admin/stats`: Fetch high-level user statistics (active today, new this week).
  - `GET /users/profile/:id`: View specific user details (Level, XP, Online/Offline Rank).
- **UI Elements:** Data table with search by email/username, pagination, and a detailed profile view modal.

### 2. 📚 Category & Content Management
- **Feature:** Add, edit, or remove game categories (e.g., History, Geography).
- **Endpoints Needed:**
  - `GET /category`: List all categories. Note: Categories now have an `incid` (auto-incrementing integer) which can be used to map fixed background colors on the frontend.
  - `POST /category/create`: Add a new category (supports multipart/form-data for icon uploads).
  - `PATCH /category/:id`: Update category name or icon.
  - `DELETE /category/:id`: Remove a category.
- **UI Elements:** Grid or list view of categories, form for uploading images and defining names.

### 3. 🌍 Country & Continent Management
- **Feature:** Manage regions and flags.
- **Endpoints Needed:**
  - `GET /continent` / `GET /country`: List regions.
  - `POST /continent` / `POST /country`: Add new ones manually (though seeded automatically).
  - `PATCH /country/:id`: Update flag icons or names.
- **UI Elements:** Searchable data table.

### 4. 🧠 Quiz (Questions) Management
- **Feature:** The core content engine. Add new trivia questions, set difficulty, and link them to Categories/Countries.
- **Endpoints Needed:**
  - `GET /quiz`: List quizzes (with filters for Category, Country, Difficulty).
  - `POST /quiz`: Add a new question.
  - `PATCH /quiz/:id`: Edit a question or its correct answer.
  - `DELETE /quiz/:id`: Remove a bad question.
- **UI Elements:** Complex form requiring dropdowns for Category/Country selection, radio buttons for Difficulty (Easy, Medium, Hard), a text input for the Question, a text input for the Correct Answer, and an array of inputs for Suggested Answers.

### 5. 📈 Progression & Rank Management
- **Feature:** Monitor game balance and manage player tiers.
- **Endpoints Needed:**
  - `GET /progression/ranks`: See all available ranks.
  - `POST /progression/ranks`: Create a new rank.
  - `PATCH /progression/ranks/:id`: Update rank requirements.
  - `DELETE /progression/ranks/:id`: Remove a rank.
- **UI Elements:** CRUD interface for the tier list.

### 6. 📊 Platform Analytics
- **Feature:** Global overview of platform health.
- **Endpoints Needed:**
  - `GET /admin/stats`: Total games, battles, active users, and popular categories.
- **UI Elements:** Charts showing daily active users (DAU), total matches played, and top-performing categories.

---

## 🎨 Design System Notes (Categories & Colors)
The backend `Category` model recently received an `incid` (Incremental ID) attribute. 
**Frontend Use Case:** Use this `incid` to map dynamic but consistent colors to categories.
*Example:* 
```javascript
const categoryColors = {
  1: 'bg-blue-500',   // History
  2: 'bg-green-500',  // Geography
  3: 'bg-yellow-500', // Science
  default: 'bg-gray-500'
}
const color = categoryColors[category.incid] || categoryColors.default;
```

---

## 🛠️ Typical Development Workflow
1. **Initialize App:** Set up the React/Next.js boilerplate.
2. **Auth Layer:** Build the Login screen and set up the Axios/Fetch interceptor to attach the JWT.
3. **Layout:** Build a sidebar navigation (Users, Categories, Quizzes, Settings).
4. **CRUD Screens:** Build the data tables and forms for each module.
5. **Deployment:** Deploy the dashboard on a subdomain (e.g., `admin.culturo-game.com`) using Vercel, Netlify, or AWS Amplify.
