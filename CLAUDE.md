# CLAUDE.md — LLM Development Reference

## Project Summary

E-Commerce Platform: single-vendor B2C e-commerce platform. Next.js 14 + FastAPI + PostgreSQL. Multi-language (FI/SV/EN/ZH), EUR only, Europe-wide. Runs in a single Docker container.

## Tech Stack

- **Frontend**: Next.js 14.2 (App Router), React 18, TypeScript 5, Tailwind CSS 3.4, Zustand, next-intl
- **Backend**: Python 3.12, FastAPI 0.109, SQLAlchemy 2.0, Alembic, Pydantic 2
- **Database**: PostgreSQL 15
- **Auth**: JWT (python-jose), bcrypt (passlib). Token: `sub` must be string (not int).
- **Email**: Resend SDK (`resend` package)
- **Infra**: Single Docker container with supervisord managing 5 services (postgres, redis, backend, frontend, nginx)

## Development Commands

```bash
# All-in-one Docker
docker build -f Dockerfile.allinone -t ecommerce-allinone .
docker run -d -p 80:80 --name ecommerce-test ecommerce-allinone

# Backend (local)
cd backend && poetry install && poetry run uvicorn app.main:app --reload

# Frontend (local)
cd frontend && npm install && npm run dev

# Database
poetry run alembic upgrade head          # Run migrations
poetry run alembic revision --autogenerate -m "desc"  # Create migration
poetry run python scripts/seed_data.py   # Seed demo data
```

## Key URLs

- Frontend: http://localhost (via nginx) or http://localhost:3000 (direct)
- Backend API: http://localhost/api/v1 or http://localhost:8000/api/v1
- Swagger docs: http://localhost/docs
- Admin: admin@example.com / admin123
- Customer: customer1@example.com / password123

## File Structure

```
backend/app/
  api/v1/endpoints/    # 12 endpoint files (one per resource)
  api/dependencies.py  # Auth deps: get_current_user, get_current_admin, get_optional_user
  core/config.py       # Pydantic Settings (from .env.dev)
  core/database.py     # SQLAlchemy engine, SessionLocal, get_db
  core/security.py     # JWT create/decode, password hash/verify, email tokens
  models/              # 12 SQLAlchemy models
  schemas/             # 7 Pydantic schema files
  services/email.py    # Resend email service with console fallback
  main.py              # FastAPI app entry (CORS, router mount)

frontend/src/
  app/[locale]/        # 36 pages, all 'use client'
  components/          # 14 components (Navbar, Footer, ProductReviews, RecentlyViewed, etc.)
  store/               # authStore.ts, cartStore.ts, wishlistStore.ts (Zustand + persist)
  lib/api.ts           # Axios instance with auth interceptor + locale injection
  i18n.ts              # next-intl config (locales: en, fi, sv)
  middleware.ts        # Locale routing middleware
  app/globals.css      # Force light mode + global input text color fix
  messages/            # en.json, fi.json, sv.json translation files
```

## Backend Patterns

### Endpoint Pattern
```python
@router.get("", response_model=ResponseModel)
def list_items(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
) -> ReturnType:
    """Numpy-style docstring."""
    ...
```

### Auth Dependencies
- `get_current_user` — requires valid JWT, returns User
- `get_current_admin` — requires admin role
- `get_optional_user` — returns User or None (for public endpoints)

### Schema Pattern
```python
class ItemCreate(BaseModel):     # POST body
class ItemUpdate(BaseModel):     # PATCH body (all fields optional, use exclude_unset=True)
class ItemResponse(BaseModel):   # Response (class Config: from_attributes = True)
```

### Pagination Pattern
```python
return {
    "items": items_list,
    "total": total_count,
    "page": page,
    "page_size": page_size,
    "pages": (total + page_size - 1) // page_size,
}
```

### JWT Token Format
Token `sub` claim MUST be a string: `{"sub": str(user.id), "email": ..., "role": ..., "type": "access"}`
Decode: `user_id = int(payload.get("sub"))`

## Frontend Patterns

### Page Pattern
```tsx
'use client'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export default function PageName() {
  const locale = useLocale()
  const t = useTranslations('section')
  // ... useEffect for data fetching, useState for local state
  // Container: max-w-[1400px] mx-auto px-6 py-6
}
```

### API Client
```tsx
import api from '@/lib/api'
const { data } = await api.get('/endpoint', { params: { page: 1 } })
await api.post('/endpoint', bodyData)
await api.patch(`/endpoint/${id}`, updateData)
await api.delete(`/endpoint/${id}`)
```
Auth token auto-injected from localStorage. 401 responses auto-redirect to login.

### Zustand Store Pattern
```tsx
export const useStore = create<State>()(
  persist((set) => ({ ...initialState, ...actions }), { name: 'storage-key' })
)
```

### Styling
- Tailwind CSS with custom colors: `primary-600` (#232f3e dark slate), `accent-500` (#ff9100 orange)
- Container: `max-w-[1400px] mx-auto px-6 py-6`
- Form inputs: text-gray-900 ensured by global CSS `@layer base`
- Icons: lucide-react
- Responsive: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`

### i18n
- Translations in `/messages/{locale}.json` (nested JSON)
- Usage: `const t = useTranslations('section')` then `t('key')`
- All internal links: `/${locale}/path`
- Locale routing enforced by next-intl middleware

## Database Models

| Table | Key Fields | Notes |
|-------|-----------|-------|
| users | email, role (ADMIN/CUSTOMER), is_verified, is_active | Auth with JWT |
| categories | name, slug, parent_id, image_url, translations (JSONB) | Hierarchical |
| products | name, slug, sku, price, compare_at_price, stock_quantity, translations (JSONB) | Core catalog |
| product_images | product_id, image_url, is_primary | URL-based only |
| product_variants | product_id, sku, name, options (JSONB), price (override) | Size/color/storage |
| product_reviews | product_id, user_id, rating (1-5), title, comment | Customer reviews |
| carts | user_id (unique) | One cart per user |
| cart_items | cart_id, product_id, variant_id, quantity | Cart contents |
| orders | user_id, order_number, status, payment_status, totals, shipping address, tracking | Purchase records |
| order_items | order_id, product_id, product_name (snapshot), unit_price, quantity | Order line items |
| addresses | user_id, address fields, is_default_shipping | User addresses |
| coupons | code, discount_type, discount_value, valid_from/until | Discount codes |
| wishlist_items | user_id, product_id (unique together) | Saved products |

## API Endpoints (11 routers, 40+ endpoints)

### Public
- `POST /auth/register`, `POST /auth/login`, `POST /auth/verify-email`
- `POST /auth/forgot-password`, `POST /auth/reset-password`
- `GET /products`, `GET /products/autocomplete?q=`, `GET /products/{id}`
- `GET /products/{id}/reviews`, `GET /categories`, `GET /orders/track`

### Authenticated (User)
- `GET/PATCH /auth/me`, `POST /auth/change-password`
- `GET/DELETE /cart`, `POST/PATCH/DELETE /cart/items`
- `GET/POST/PATCH/DELETE /addresses`
- `GET/POST /orders`, `GET /orders/{id}`
- `POST /products/{id}/reviews`, `POST /coupons/validate`
- `GET/POST/DELETE /wishlist`

### Admin Only
- `GET/POST/PATCH/DELETE /products`, `GET/POST/PATCH/DELETE /categories`
- `GET /orders/admin`, `PATCH /orders/{id}/status`
- `GET /inventory`, `GET /inventory/stats`, `PATCH /inventory/{id}/stock|pricing|toggle-active|threshold`
- `GET/POST/PATCH/DELETE /coupons`
- `GET/DELETE /reviews`
- `GET /admin/users`, `PATCH /admin/users/{id}/toggle-active`, `GET /admin/analytics`

## Seed Data (auto-loaded on Docker first boot)

- 6 users, 24 categories, 39 products, 29 variants, 142 reviews, 4 coupons
- All in `backend/scripts/seed_data.py` — runs when user table is empty
- Coupon codes: WELCOME10 (10%), SUMMER20 (20%), FREESHIP, SAVE50 (€50 off min €300)

## Docker Architecture

`Dockerfile.allinone` builds a single image containing all services:
1. `docker-entrypoint.sh` → init PostgreSQL, run migrations, seed if empty
2. `supervisord.conf` → starts postgres, redis, backend (uvicorn), frontend (next start), nginx
3. `nginx/nginx.allinone.conf` → routes `/` to frontend:3000, `/api` to backend:8000

## Known Constraints

- Cart requires login (no guest cart)
- Payment auto-confirmed as "invoice" (no payment gateway)
- Email sending requires Resend API key (falls back to console logging)
- Product images are URLs only (no file upload)
- Product content is single-language (only UI is translated)
- `bcrypt.__about__` warning on startup is cosmetic (passlib/bcrypt version mismatch, does not affect functionality)

## Environment Variables

Key vars in `.env.dev` and `supervisord.conf`:
- `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `FRONTEND_URL`, `CORS_ORIGINS`, `ENVIRONMENT`

## Conventions

- Backend: numpy-style docstrings, 100-char line length, double quotes, Annotated type hints
- Frontend: 'use client' on all pages, Tailwind utility classes, lucide-react icons
- All monetary values: Decimal (backend) / number (frontend), EUR only
- Translations: add keys to all 3 locale files (en.json, fi.json, sv.json) simultaneously
- New endpoints: create schema → create endpoint → register in router.py
- New pages: create under `frontend/src/app/[locale]/` with 'use client' directive
