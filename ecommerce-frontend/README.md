# Frontend setup — Multi-Vendor E-commerce

Generated to match your actual FastAPI backend contract (schemas, routers, enums as of this session).

## 1. Backend change required first

Add CORS to `main.py` — without it every request from React will be blocked by the browser:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 2. Create the Vite project

```bash
npm create vite@latest ecommerce-frontend -- --template react-ts
cd ecommerce-frontend

npm install react-router-dom axios zustand @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install -D tailwindcss @tailwindcss/vite
```

**vite.config.ts**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**src/index.css**
```css
@import "tailwindcss";
```

## 3. Drop in these files

Copy the `src/` folder from this package into your new Vite project's `src/`, and copy `.env.example` → `.env` (adjust if your backend runs elsewhere).

```
src/
├── constants/
│   └── enums.ts          # UserRole, OrderStatus, PaymentStatus — mirrors enums.py
├── types/
│   └── index.ts          # TS interfaces mirroring every schema in app/schemas/
├── api/
│   ├── client.ts         # axios instance, token handling, 401 redirect
│   ├── auth.ts           # register, login (OAuth2 form-encoded), me
│   ├── vendors.ts
│   ├── categories.ts
│   ├── products.ts       # includes multipart image upload
│   ├── cart.ts
│   ├── orders.ts
│   └── payments.ts
├── store/
│   └── useAuthStore.ts   # zustand auth store with session restore
└── routes/
    └── RoleRoute.tsx     # ProtectedRoute + role-gated route guard
```

This is the API/data layer only — no UI components, since I don't know your
design preferences yet. Build pages against these typed functions, e.g.:

```tsx
import { getAllProducts } from "@/api/products";
import { useQuery } from "@tanstack/react-query";

function ProductList() {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });
  // products is typed as ProductResponse[]
}
```

## 4. Backend contract notes (things that would otherwise bite you)

- **No `/api` prefix.** Endpoints are at root: `/auth/login`, `/products`, `/cart`, etc.
- **Login is form-encoded, not JSON.** `/auth/login` uses `OAuth2PasswordRequestForm` —
  field names are `username` (send the email here) and `password`. Handled in `api/auth.ts`.
- **Cart is CUSTOMER-only.** `require_customer` gates every `/cart/*` route — a
  logged-in vendor/admin gets a 403. Hide cart UI for non-customer roles.
- **Checkout returns an array.** `POST /orders/checkout` splits a multi-vendor
  cart into one `OrderResponse` per vendor, not a single order.
- **`PaymentResponse.status` is a plain `string`** in the schema, unlike
  `OrderResponse.status` which is typed as the `OrderStatus` enum. Inconsistency
  in the backend schema, not a frontend bug — kept as-is in `types/index.ts`.
- **Product images** are uploaded separately via `POST /products/{id}/image`
  (multipart, after creating the product) and served from the `/uploads`
  static mount. Use `resolveUploadUrl()` in `api/client.ts` to build a full
  image URL from the relative `image_url` field.
- **Vendor approval** is a separate flag (`VendorResponse.is_approved`), not
  part of the user object — check it via `getMyVendor()` if you want to gate
  the vendor dashboard on admin approval.
- **`app/routers/users.py` is empty** on the backend — there's no user list/detail
  endpoint yet, so an admin "manage users" page has nothing to call yet.

## 5. What's built so far

- ✅ **Auth pages** — `src/pages/auth/LoginPage.tsx`, `RegisterPage.tsx`
- ✅ **Storefront** (public, `/` and `/products/:productId`) — product grid with search (`?q=`), category filter chips, sort (newest/price), product detail page with quantity selector and add-to-cart. Filtering/search/sort all happen **client-side** — `GET /products` has no query params on the backend, so this pulls the full catalog once and filters in the browser. Fine for a small catalog, won't scale to thousands of products without backend pagination/search.
- ✅ **Cart + checkout** (`/cart`, `/checkout`, `/order-success` — role: CUSTOMER) — cart page with quantity edit/remove/clear, checkout with address form, payment method selection, and order placement. See the address caveat below — this is the one place in the app that's cosmetic rather than fully functional, by your choice.
- ✅ **Public navbar** (`PublicLayout`) — search bar, cart badge (customers only), role-aware account link, sign in/up
- ✅ **Buyer dashboard** (`/account/*`, role: CUSTOMER) — Overview, Orders (expandable line items), Payments, Profile (read-only)
- ✅ **Vendor dashboard** (`/vendor/*`, role: VENDOR) — Overview (store setup flow → pending-approval state → stats), Products (add/edit/delete + image upload), Orders, Store settings
- ✅ **Admin dashboard** (`/admin/*`, role: ADMIN) — Overview, Vendors (approve), Categories (full CRUD), Payments, **Orders and Users are placeholders** — see below
- ✅ **Routing + guards** — `src/App.tsx` nests each dashboard under `ProtectedRoute` + `RoleRoute`, matching the backend's `require_customer` / `require_vendor` / `require_admin` exactly
- ✅ Shared dashboard chrome — `DashboardShell` (sidebar nav + sign out), `StatCard`, status badges, empty/error states, a `Modal` for forms

### Address is display-only, by design
Per your call, checkout collects a shipping address in a plain form, but it is **not sent to the backend** — there's no field on `OrderCreate`/`OrderResponse` to store it. It only exists in the browser during checkout to make the flow feel complete. If you ever need real order fulfillment (which you will, to actually ship anything), you'll need to add an address field to the backend and update `CheckoutPage.tsx` to send it. Right now, a vendor looking at an order has no idea where to ship it.

### Admin gaps — need backend work to fully finish
The Orders and Users tabs in the admin dashboard render a "needs backend endpoint" panel instead of data, because:
- There's no `GET /orders` (admin, all orders) — only customer-scoped and vendor-scoped order lists exist
- `app/routers/users.py` is empty and unregistered — no user list endpoint exists

I gave you starter code for both in an earlier message. Once added, tell me and I'll wire up `AdminOrdersPage.tsx` / `AdminUsersPage.tsx` for real.

### Other things worth knowing
- **Vendor stats (revenue, low stock) are computed client-side** by summing every order/product fetched — fine now, but won't scale once a vendor has thousands of orders. A dedicated `GET /vendors/me/stats` endpoint doing the aggregation in SQL would be the long-term fix.
- **Vendor order fulfillment isn't wired up** — there's no endpoint to update order status as a vendor (e.g. mark "shipped"), so `VendorOrdersPage` is read-only.
- **Buyer profile is read-only** — no `PUT /auth/me` (or similar) exists yet to update name/email.
- Currency formatting defaults to **INR** (`src/lib/format.ts`) — change the locale/currency there if that's wrong for your market.
- **No shipping address anywhere in the backend schemas** — worth flagging before building checkout, since checkout will need somewhere to put a delivery address.

**Not yet built:** order status updates (vendor fulfillment, backend endpoint doesn't exist), admin orders/users (backend endpoints don't exist), profile editing (backend endpoint doesn't exist).



### Rename the brand
Everything reads from `src/constants/brand.ts` — change `BRAND_NAME` there and it updates both auth pages.

