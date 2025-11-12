
# 🛡️ ami-authenticated

**`ami-authenticated`** is a modern, lightweight authentication + authorization SDK built for JavaScript and React applications.
It simplifies handling **login**, **signup**, **OTP-based password recovery**, **token storage**, and **role-based route protection** — all in one place.

---

## 🚀 Features

✅ Simple cookie-based token and user management
✅ Built-in forgot-password → OTP → reset-password flow
✅ Easy route-based access control (RBAC)
✅ Handles unauthorized redirects automatically
✅ Works perfectly with React, Vue, or vanilla JS apps
✅ Zero UI dependencies — plug into any design system

---

## 📦 Installation

Install with npm:

```bash
npm install ami-authenticated
```

or using Yarn:

```bash
yarn add ami-authenticated
```

---

## ⚙️ Initialization

Before using the SDK, initialize your HTTP client **once** (usually inside your root component, like `App.jsx`):

```jsx
import { createHttpClient } from "ami-authenticated";

createHttpClient({
  baseURL: "http://localhost:4000/api", // your backend base URL
  redirectHandler: (path) => (window.location.href = path),
  onUnauthorized: (error) => {
    console.warn("Session expired:", error);
    window.location.href = "/login";
  },
});
```

✅ This automatically:

* Configures Axios for API calls
* Injects tokens into every request
* Handles `401 Unauthorized` globally
* Redirects users when sessions expire

---

## 🧩 Core Modules Overview

The SDK consists of **four main services** that cover every part of the authentication + authorization process.

---

### 1️⃣ AuthService — Core Cookie Manager

Manages your authentication state, tokens, and recovery flows using secure cookies.

| Method                                | Description                                             |
| ------------------------------------- | ------------------------------------------------------- |
| `setAuthDetail({ token, user })`      | Saves authenticated user & JWT token                    |
| `getAuthDetail()`                     | Returns stored auth object                              |
| `clearAuthDetail()`                   | Removes stored auth info                                |
| `setFlow({ step, email })`            | Sets current flow stage (`otp`, `reset-password`, etc.) |
| `getFlow()`                           | Returns current flow step                               |
| `setForgotPassword({ email, token })` | Stores password reset token/email                       |
| `getForgotPassword()`                 | Retrieves reset info                                    |
| `clearForgotPassword()`               | Clears password recovery info                           |
| `clearAuth()`                         | Clears all auth & flow data                             |

**Example:**

```js
import { AuthService } from "ami-authenticated";

// Save login details
AuthService.setAuthDetail({
  token: res.token,
  user: res.user, // includes roles
});
```

---

### 2️⃣ AuthFlowManager — Simplified Flow Controller

Handles high-level authentication flow like login, OTP, and reset-password transitions.

| Method                                  | Purpose                            |
| --------------------------------------- | ---------------------------------- |
| `startForgotPassword(email, tempToken)` | Begins forgot-password flow        |
| `startOtpFlow(email)`                   | Moves to OTP stage                 |
| `startResetPassword(email, token)`      | Begins reset-password step         |
| `completeAuth({ token, user })`         | Finalizes login, clears temp flows |
| `cancelFlows()`                         | Cancels ongoing OTP/reset state    |

**Example:**

```js
import { AuthFlowManager } from "ami-authenticated";

AuthFlowManager.completeAuth({
  token: res.token,
  user: res.user,
});
```

---

### 3️⃣ ApiService — Auth-Aware HTTP Client

Built on top of Axios. Automatically attaches your token for all requests.

| Method                      | Description                    |
| --------------------------- | ------------------------------ |
| `get(url, config?)`         | GET request                    |
| `post(url, data?, config?)` | POST request                   |
| `put(url, data?, config?)`  | PUT request                    |
| `delete(url, config?)`      | DELETE request                 |
| `upload(url, file, extra?)` | Upload via multipart/form-data |

**Example:**

```js
import { ApiService } from "ami-authenticated";

const profile = await ApiService.get("/auth/me");
console.log(profile.user);
```

---

### 4️⃣ Route Manager — Authentication & Authorization Control

The `handleRouteAccess()` function automatically manages route access based on user state, roles, and recovery steps.

**Example:**

```js
import { handleRouteAccess } from "ami-authenticated";

handleRouteAccess(
  window.location.pathname,
  (path) => (window.location.href = path),
  {}, // optional route config (see below)
  "/" // default redirect after login
);
```

✅ It ensures:

* Logged-in users can’t revisit `/login` or `/register`
* Users in OTP flow can’t skip steps
* Unauthenticated users are redirected to `/login`

---

## 🔐 Authorization (Role-Based Access)

Beyond authentication, `ami-authenticated` supports **role-based access control (RBAC)**.

You can restrict routes or features to specific roles like `"admin"`, `"manager"`, or `"user"` with just a few lines.

---

### 🧱 1️⃣ Backend Response with Roles

Your backend should return roles in the login/register API or inside the JWT.

```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "123",
    "email": "admin@example.com",
    "name": "Admin User",
    "roles": ["admin"]
  }
}
```

Then finalize authentication on the frontend:

```js
AuthFlowManager.completeAuth({
  token: res.token,
  user: res.user, // includes roles
});
```

---

### 🧩 2️⃣ Route Configuration with Roles

Define route-level role restrictions using `routeConfig`:

```js
const routeConfig = {
  "/": { roles: ["user", "admin"] },
  "/admin": { roles: ["admin"], redirect: "/unauthorized" },
  "/reports": { roles: ["manager", "auditor"], requireAll: true },
};
```

Integrate it with route guard:

```js
useEffect(() => {
  handleRouteAccess(
    location.pathname,
    (p) => navigate(p),
    routeConfig,
    "/"
  );
}, [location, navigate]);
```

✅ This automatically:

* Redirects unauthorized users
* Prevents logged-in users from accessing public routes
* Enforces multi-role validation with `requireAll`

---

### 🧠 3️⃣ Role Utility Helpers

| Function            | Description                                  |
| ------------------- | -------------------------------------------- |
| `hasRole("admin")`  | Returns `true` if current user has that role |
| `getUserRoles()`    | Returns user’s roles array                   |
| `isAuthenticated()` | Checks if user is logged in                  |
| `getCurrentUser()`  | Returns the full user object                 |

**Example:**

```js
import { hasRole, getUserRoles } from "ami-authenticated";

if (hasRole("admin")) {
  console.log("Welcome, Admin!");
} else {
  console.log("Your roles:", getUserRoles());
}
```

---

### 🧱 4️⃣ Protect Components in React

Example route protection:

```jsx
<Route
  path="/admin"
  element={
    hasRole("admin") ? <AdminDashboard /> : <Navigate to="/unauthorized" />
  }
/>
```

---

## 💡 Example React Integration

A minimal setup example using React Router:

```jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { createHttpClient, handleRouteAccess } from "ami-authenticated";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Otp from "./pages/Otp";
import ResetPassword from "./pages/ResetPassword";

const routeConfig = {
  "/": { roles: ["user", "admin"] },
  "/admin": { roles: ["admin"], redirect: "/unauthorized" },
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    createHttpClient({
      baseURL: "http://localhost:4000/api",
      redirectHandler: (path) => navigate(path),
      onUnauthorized: () => navigate("/login"),
    });
  }, [navigate]);

  useEffect(() => {
    handleRouteAccess(location.pathname, (p) => navigate(p), routeConfig, "/");
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp" element={<Otp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
```

---

## 🔑 Password Recovery Flow (3 Steps)

| Step                | Component            | Function            | API                     |
| ------------------- | -------------------- | ------------------- | ----------------------- |
| 1️⃣ Forgot Password | `ForgotPassword.jsx` | `handleSubmit()`    | `/auth/forgot-password` |
| 2️⃣ Verify OTP      | `Otp.jsx`            | `handleVerifyOtp()` | `/auth/verify-otp`      |
| 3️⃣ Reset Password  | `ResetPassword.jsx`  | `handleReset()`     | `/auth/reset-password`  |

Each step updates the flow automatically via `AuthFlowManager`.

---

## 🧼 Logout Example

```js
import { AuthService } from "ami-authenticated";

function handleLogout() {
  AuthService.clearAuth();
  window.location.href = "/login";
}
```

---

## 🧾 Environment & Security Notes

* Designed for browser-based apps (React, Vue, etc.)
* Uses secure cookies: `SameSite=Strict; Secure`
* Supports SSR-safe configuration
* No localStorage used (safer for tokens)

---

## 🧰 Tech Stack

* Axios for HTTP client
* Secure cookies for session persistence
* React-first design but framework-agnostic
* Built for simplicity and flexibility

---

## ❤️ Author

Developed with ❤️ by **Priyansh Nihalani**
Helping developers build secure, modern auth flows faster ⚡

---

## 📄 License

MIT License © 2025 Priyansh Nihalani

---

