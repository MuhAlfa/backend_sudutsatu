AUTH Migration Summary
======================

Overview
--------
This project was migrated from a token-in-localStorage authentication model to a secure HttpOnly cookie-based authentication model.

Why
---
- Storing JWT or tokens in `localStorage` exposes them to XSS and client-side scripts.
- HttpOnly cookies prevent client-side JavaScript from reading the token and reduce token leakage risk.

What changed
------------
- Backend
  - `controllers/authController.js`: login now sets an HttpOnly cookie `token` and `logout` clears it.
  - `middlewares/authMiddleware.js`: middleware now reads token from `req.cookies.token` or Authorization header for backwards-compatibility.
  - `server.js`: `cookie-parser` added and CORS configured to accept credentials.

- Frontend
  - All authenticated fetch calls updated to use `credentials: 'include'` instead of attaching `Authorization` header with a token from `localStorage`.
  - `profile.js` (and other pages) now fetch `/api/auth/me` to obtain the current user's profile.
  - Login (`sudutsatu-frontend/script.js` and `assets/js/pages/auth.js`) uses `fetch(..., { credentials: 'include' })` and does NOT store tokens in `localStorage` anymore.
  - Removed the simulated `localStorage` login in `assets/js/pages/auth.html`.
  - Navbar (`index.html`) now queries `/api/auth/me` to decide logged-in state and uses `/api/auth/logout` to end sessions.
  - Guard pages (e.g. `admin-guard.js`, `search-venues.js`) validate session via `/api/auth/me` before granting access or navigating.

Files touched (examples)
-----------------------
- `controllers/authController.js`
- `middlewares/authMiddleware.js`
- `server.js`
- `sudutsatu-frontend/script.js`
- `sudutsatu-frontend/index.html`
- `sudutsatu-frontend/assets/js/pages/profile.js`
- `sudutsatu-frontend/assets/js/pages/*` (many pages updated to include credentials)

How to run & verify
-------------------
1. Install deps and start server:

```bash
cd SudutSatu
npm install
npm start
```

2. Open frontend (serve `sudutsatu-frontend` static files). If you're using a static server (like Live Server), open `index.html`.

3. Test login flow
- Go to login page `/pages/auth/login.html` and login with a valid user (backend DB).
- In browser DevTools -> Application -> Cookies, you should see a cookie named `token` for the API host (HttpOnly cookies won't be visible in JS console).

4. Test profile
- After login, open `profile.html`. The page will call `/api/auth/me` with credentials; it should return the logged-in user's real data (email, name, phone) and display it.

5. Test protected routes
- Visit admin pages (if user is admin) or user dashboard. The pages perform `/api/auth/me` and then call protected endpoints using `credentials: 'include'` — verify they load successfully.

Notes & next steps
------------------
- Backward compatibility: middleware still accepts `Authorization: Bearer <token>` for compatibility, but frontend no longer sets it.
- Production hardening: set cookie `secure: true` and tighten `sameSite` policy when deploying over HTTPS.
- Recommended: implement refresh-token flow if session lifetime needs to be extended without re-login.
- Pending: add server-side auth failure logging and minimal integration (E2E) tests.

If you'd like, I can now:
- Add server-side logging and a small integration test (login -> /auth/me -> protected endpoint), or
- Run a guided E2E verification walkthrough with commands you can run locally.
