# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## AI Smart Sales & Support Agent

This frontend implements the SaaS app UI for "AI Smart Sales & Support Agent for MSMEs".

### Run locally

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Backend base API: configured with `VITE_API_URL` in `.env` (defaults to http://localhost:5000)

### Tech stack

- React (JSX)
- Vite
- Tailwind CSS
- Recharts
- Axios
- React Context API (AuthContext & AppContext)
- Lucide icons

### Project Structure

- `src/`
  - `components/` (Sidebar, Topbar, Button, Modal, Badge, Loader, ProtectedRoute)
  - `context/` (AuthContext.jsx, AppContext.jsx)
  - `pages/` (Login, Register, Dashboard, Leads, Conversations, AIChat, Invoices, Analytics)
  - `utils/` (axios.js)

### Important behaviors

- JWT stored in localStorage; auto-auth via token decode on refresh
- Axios interceptor emits `app:logout` event on 401 which triggers logout
- All data fetched directly from backend (no mock data)
- Graceful API error handling (returns `{ ok: false, message }`)

### Notes for Backend

Required API routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/leads`, `POST /api/leads`, `PUT /api/leads/:id`, `DELETE /api/leads/:id`
- `GET /api/conversations/:leadId`
- `POST /api/ai/reply`
- `GET /api/invoices`, `POST /api/invoices`, `PUT /api/invoices/:id`, `DELETE /api/invoices/:id`
- `GET /api/analytics` (optional)

If you need help wiring additional fields or adjusting endpoints, I can update the frontend accordingly.

