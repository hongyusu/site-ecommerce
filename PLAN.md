# E-Commerce Site: Continue Building Plan

## Context

The site has auth, products, categories, and reviews partially working. The entire purchase flow (cart -> checkout -> orders) is missing. DB models for Cart, Order, Address, and Coupon already exist with migrations applied, but have no API endpoints or frontend pages. The user wants to skip third-party integrations (email, payment) for now.

## Dependency Graph

```
Step 1 (Cart) ──────────┐
                         ├──> Step 3 (Checkout & Orders) ──> Step 4 (Order Mgmt) ──> Step 6 (Admin)
Step 2 (Profile/Addr) ──┘                                         │
                                                                    └──> Step 7 (Coupons)
Step 5 (Product Discovery) -- independent, any time
```

**Steps 1 & 2 can run in parallel. Step 5 is fully independent.**

---

## Step 1: Shopping Cart (highest priority — unblocks purchase flow)

### Backend
- **NEW** `backend/app/schemas/cart.py` — CartItemAdd, CartItemUpdate, CartItemResponse (with product snapshot: name, price, image, slug, stock), CartResponse (items + item_count + subtotal)
- **NEW** `backend/app/api/v1/endpoints/cart.py`:
  - `GET /cart` — get-or-create user's cart with items + product details (auth: get_current_user)
  - `POST /cart/items` — add item, merge if duplicate product+variant, validate stock (auth: get_current_user)
  - `PATCH /cart/items/{item_id}` — update quantity, validate ownership + stock (auth: get_current_user)
  - `DELETE /cart/items/{item_id}` — remove item, validate ownership (auth: get_current_user)
  - `DELETE /cart` — clear all items (auth: get_current_user, returns 204)
- **MODIFY** `backend/app/api/v1/router.py` — register cart router

### Frontend
- **NEW** `frontend/src/store/cartStore.ts` — Zustand store with persist middleware: items, itemCount, subtotal, fetchCart, addItem, updateQuantity, removeItem, clearCart
- **NEW** `frontend/src/app/[locale]/cart/page.tsx` — cart page with item list, quantity controls, subtotal, "Proceed to Checkout" button
- **MODIFY** `frontend/src/components/Navbar.tsx` — replace hardcoded "0" badge with cartStore.itemCount, fetchCart on mount
- **MODIFY** `frontend/src/app/[locale]/products/[slug]/page.tsx` — replace alert() in handleAddToCart with cartStore.addItem()
- **MODIFY** `frontend/messages/{en,fi,sv}.json` — add cart translation keys

---

## Step 2: User Profile & Addresses (parallel with Step 1)

### Backend
- **NEW** `backend/app/schemas/address.py` — AddressCreate, AddressUpdate, AddressResponse
- **NEW** `backend/app/api/v1/endpoints/addresses.py`:
  - `GET /addresses` — list user's addresses (auth: get_current_user)
  - `POST /addresses` — create address, handle default flag (auth: get_current_user)
  - `PATCH /addresses/{id}` — update, validate ownership (auth: get_current_user)
  - `DELETE /addresses/{id}` — delete, validate ownership (auth: get_current_user)
- **MODIFY** `backend/app/api/v1/endpoints/auth.py` — add `PATCH /auth/me` for profile update using existing UserUpdate schema
- **MODIFY** `backend/app/api/v1/router.py` — register addresses router

### Frontend
- **NEW** `frontend/src/app/[locale]/profile/page.tsx` — profile info form + password change form
- **NEW** `frontend/src/app/[locale]/profile/addresses/page.tsx` — address list with CRUD
- **MODIFY** `frontend/messages/{en,fi,sv}.json` — add profile/addresses keys

---

## Step 3: Checkout & Order Creation (depends on Steps 1+2)

### Backend
- **NEW** `backend/app/api/v1/endpoints/orders.py`:
  - `POST /orders` — create order from cart: validate cart, address, stock; calculate subtotal/tax(24%)/shipping(EUR 5.90, free over 100)/total; generate order_number; snapshot items; decrement stock; clear cart; auto-confirm (skip payment)
  - `GET /orders` — list user's orders paginated (auth: get_current_user)
  - `GET /orders/{order_id}` — order detail, validate ownership (auth: get_current_user)
- **MODIFY** `backend/app/schemas/order.py` — add OrderCreateFromCart (address_id, coupon_code, customer_notes, payment_method="invoice")
- **MODIFY** `backend/app/api/v1/router.py` — register orders router

### Frontend
- **NEW** `frontend/src/app/[locale]/checkout/page.tsx` — multi-step: select address -> review order -> confirm. Coupon input (stub until Step 7). Place order button.
- **NEW** `frontend/src/app/[locale]/orders/[id]/page.tsx` — order detail/confirmation page
- **MODIFY** `frontend/messages/{en,fi,sv}.json` — add checkout/orders keys

---

## Step 4: Order Management (depends on Step 3)

### Backend
- **MODIFY** `backend/app/api/v1/endpoints/orders.py`:
  - `GET /orders/admin` — list all orders, filterable by status (auth: get_current_admin)
  - `PATCH /orders/{order_id}/status` — update status/payment_status (auth: get_current_admin)

### Frontend
- **NEW** `frontend/src/app/[locale]/profile/orders/page.tsx` — customer order history (paginated list)
- **MODIFY** `frontend/src/app/[locale]/orders/[id]/page.tsx` — add admin status update dropdown if user is admin
- **MODIFY** `frontend/messages/{en,fi,sv}.json`

---

## Step 5: Product Discovery (independent — any time)

### Backend
- **MODIFY** `backend/app/api/v1/endpoints/products.py` — add query params: sort_by, sort_order, min_price, max_price, in_stock

### Frontend
- **MODIFY** `frontend/src/app/[locale]/products/page.tsx` — wire up sort dropdown, add filter sidebar (price range, availability), breadcrumbs, URL param sync

---

## Step 6: Admin Dashboard (depends on Step 4)

### Backend
- **NEW** `backend/app/schemas/admin.py` — AdminStatsResponse
- **NEW** `backend/app/api/v1/endpoints/admin.py`:
  - `GET /admin/stats` — totals (orders, revenue, products, users) + recent orders + low stock (auth: get_current_admin)
  - `GET /admin/users` — paginated user list (auth: get_current_admin)
- **MODIFY** `backend/app/api/v1/router.py`

### Frontend
- **NEW** `frontend/src/app/[locale]/admin/page.tsx` — stats cards + recent orders + low stock alerts
- **NEW** `frontend/src/app/[locale]/admin/products/page.tsx` — product management table with search/edit/delete
- **NEW** `frontend/src/app/[locale]/admin/orders/page.tsx` — order management with status dropdown
- **NEW** `frontend/src/app/[locale]/admin/users/page.tsx` — user list (read-only)

---

## Step 7: Coupon Redemption (depends on Step 3)

### Backend
- **NEW** `backend/app/schemas/coupon.py` — CouponValidateRequest, CouponValidationResponse, CouponCreate/Update/Response
- **NEW** `backend/app/api/v1/endpoints/coupons.py`:
  - `POST /coupons/validate` — validate code against subtotal (auth: get_current_user)
  - `GET /coupons` — list all (auth: get_current_admin)
  - `POST /coupons` — create (auth: get_current_admin)
- **MODIFY** `backend/app/api/v1/router.py`

### Frontend
- **MODIFY** `frontend/src/app/[locale]/checkout/page.tsx` — wire up coupon input with validate endpoint

---

## Implementation Strategy

**Start with Steps 1 + 2 in parallel using multiple agents:**
- Agent A: Step 1 backend (cart schemas + endpoints)
- Agent B: Step 1 frontend (cart store + cart page + Navbar + product detail)
- Agent C: Step 2 backend (address schemas + endpoints + profile update)
- Agent D: Step 2 frontend (profile page + addresses page)

Then Step 3 (checkout) once both are done, and continue sequentially.

## Verification

After each step:
1. Rebuild the all-in-one Docker image: `docker build -f Dockerfile.allinone -t ecommerce-allinone .`
2. Run container: `docker run -d --name ecommerce-test -p 80:80 ecommerce-allinone`
3. Test API endpoints via curl against http://localhost/api/v1/
4. Test frontend pages in browser at http://localhost/
5. Verify auth-protected endpoints require login
6. Verify admin endpoints reject non-admin users

## Scope Summary

| Step | New Files | Modified Files | Total |
|------|-----------|----------------|-------|
| 1: Cart | 4 | 4 | 8 |
| 2: Profile/Addresses | 4 | 4 | 8 |
| 3: Checkout/Orders | 3 | 3 | 6 |
| 4: Order Mgmt | 1 | 2 | 3 |
| 5: Discovery | 0 | 2 | 2 |
| 6: Admin | 6 | 1 | 7 |
| 7: Coupons | 2 | 2 | 4 |
| **Total** | **20** | **18** | **38** |
