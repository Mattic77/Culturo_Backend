## GitHub Issue

Closes GH-15

## Description 📝

This PR expands the backend API to support a dedicated Admin Dashboard. It introduces administrative controls for user management, competitive rank management, and global platform analytics. It also includes a detailed guide for frontend developers.

## Type of Change

- [x] ✨ New feature (non-breaking change that adds functionality)
- [x] 📝 Documentation

## Changes

### 🛡️ Administrative Controls
- **`AdminModule`**: New module for global platform statistics (Total users, active today, game/battle counts, and category popularity).
- **`UserModule` Expansion**:
    - `GET /users/admin/all`: Paginated user list for admin management.
    - `GET /users/admin/stats`: User-specific growth analytics.
    - `PATCH /users/admin/user-type/:id`: Promote/Demote users (Admin role assignment).
- **`ProgressionModule` Expansion**:
    - Full CRUD for `Ranked` model (Create, Update, Delete competitive tiers).

### 📖 Documentation
- Created `docs/ADMIN_DASHBOARD_GUIDE.md`: A comprehensive blueprint for frontend developers to build the separate admin web application, including authentication flows and color mapping strategies.

### 🔒 Security
- All new administrative endpoints are protected with `AuthGuard` and `RolesGuard`, strictly requiring the `admin` user type.

## API Endpoints Summary 🚀

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `GET` | `/admin/stats` | Global platform health overview |
| **User** | `GET` | `/users/admin/all` | Manage all registered users |
| **User** | `PATCH` | `/users/admin/user-type/:id` | Update user roles |
| **Progression** | `POST/PATCH/DELETE` | `/progression/ranks` | Manage competitive tiers |

## Screenshots 📷 (if applicable)

(No UI changes)
