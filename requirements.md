# E-Commerce Store Platform - Requirements & Technical Specifications

## Project Overview

A single-vendor B2C e-commerce platform where one business sells products directly to customers across Europe. This is a pure online store (no physical locations) inspired by Verkkokauppa.com, with best practices from Amazon, AliExpress, and Motonet.

**Business Model**: Single-vendor online store (NOT a marketplace)
**Geographic Scope**: Europe-wide
**Timeline**: 4-6 months for full launch
**Approach**: Phased implementation with iterative feature rollout

---

## Core Requirements Summary

### Hard Requirements (Non-negotiable)

1. **UI Internationalization**: Finnish (Suomi), Swedish (Svenska), and English support for all UI elements
2. **Content Language**: Product content in ONE language only (no translation layer)
3. **Currency**: Euro (EUR) only - no multi-currency support
4. **Geographic Scope**: Europe-wide shipping (no location restrictions)
5. **User Roles**: Two roles only - **Admin** and **Customer** (no vendor role)
6. **Business Model**: Single-vendor store - admin manages all products directly
7. **Payment Integration**: Can be deferred to later phase (manual payment processing for initial launch)
8. **Delivery**: Home delivery only - no physical stores, no pickup points, no lockers
9. **Image Storage**: Image URLs stored in database (no file uploads, no S3)
10. **Authentication**: Email/password only (no OAuth/social login)

### Key Differentiators
- Europe-focused single-vendor store with FI/SE/EN UI
- Simple, single-currency (EUR) pricing
- Pure online model (no physical presence)
- Real-time inventory transparency
- Advanced product discovery and recommendations
- Flexible payment (can launch without payment gateway)

---

## Technology Stack

### Frontend Technologies

#### Core Framework & Language
- **Next.js 14.2+** - React framework with App Router architecture
- **React 18** - UI library
- **TypeScript 5** - Type safety with strict mode
- **Node.js 20** - Runtime environment

#### Styling & UI Components
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional styling
- **lucide-react** - Icon library
- **Headless UI** - Accessible UI components

#### State Management & Data Fetching
- **Zustand 5.0+** - Lightweight client state management
- **TanStack React Query 5.90+** - Server state management, caching, and synchronization
- **Axios 1.13+** - HTTP client for API communication

#### Form Handling & Validation
- **React Hook Form 7.65+** - Performant form management
- **@hookform/resolvers** - Form validation integration
- **Zod 3.23+** - TypeScript-first schema validation

#### Internationalization
- **next-i18next 15.0+** - Multi-language support (FI/SE/EN)
- Translation files for UI elements only (not product content)

#### Additional Libraries
- **date-fns 4.1+** - Date manipulation and formatting
- **react-hot-toast** - Toast notifications
- **embla-carousel-react** - Product image carousels
- **recharts** - Charts and analytics visualization
- **react-dropzone** - File upload handling (for review photos)

#### Build & Development
- **ESLint** - Code linting with Next.js config
- **Prettier** - Code formatting
- **TypeScript** - Strict type checking

---

### Backend Technologies

#### Core Framework & Language
- **Python 3.12** - Programming language
- **FastAPI 0.104+** - Modern, high-performance web framework
- **Uvicorn 0.24+** - ASGI server with standard extras
- **Pydantic 2.5+** - Data validation and settings management

#### Database & ORM
- **PostgreSQL 15** - Primary relational database
- **SQLAlchemy 2.0+** - ORM and database toolkit
- **psycopg2-binary 2.9+** - PostgreSQL adapter
- **Alembic 1.12+** - Database migration management

#### Caching & Session Management
- **Redis 7** - In-memory data store for caching and sessions
- **redis-py** - Redis Python client

#### Authentication & Security
- **python-jose[cryptography] 3.3+** - JWT token creation and validation
- **passlib[bcrypt] 1.7+** - Password hashing with bcrypt
- **python-multipart** - Form data handling

#### Payment Integration (Optional - Phase 2)
- **stripe** - Stripe payment processing (deferred)
- **paypalrestsdk** - PayPal integration (deferred)

#### Email & Notifications
- **resend 2.4+** - Email delivery service
- **jinja2 3.1+** - Email template rendering
- **email-validator** - Email validation

#### Image Handling
- **No file storage** - Images stored as URLs only
- **Pillow** (optional) - For future image validation/optimization

#### Background Tasks
- **Celery 5.3+** - Distributed task queue (for emails, etc.)
- **celery-beat** - Periodic task scheduler
- **Redis** - Celery broker and result backend

#### Development & Testing
- **pytest 7.4+** - Testing framework
- **pytest-asyncio 0.21+** - Async testing support
- **httpx 0.25+** - HTTP client for testing APIs
- **black 23.12+** - Code formatter
- **flake8 6.1+** - Linting
- **coverage** - Code coverage reporting

#### Utilities
- **python-dotenv 1.0+** - Environment variable management
- **python-slugify 8.0+** - URL-safe slug generation
- **pytz 2023.3+** - Timezone support

---

### Infrastructure & DevOps

#### Containerization
- **Docker 24+** - Container platform
- **Docker Compose** - Multi-container orchestration
- **Multi-stage builds** - Optimized production images

#### Web Server & Reverse Proxy
- **Nginx 1.25+** - Reverse proxy and static file serving
- **SSL/TLS** - HTTPS with Let's Encrypt

#### Monitoring & Logging
- **Docker logs** - JSON file logging with rotation
- **Health checks** - Container health monitoring
- **Sentry** (optional) - Error tracking and monitoring

---

## System Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx Reverse Proxy                  │
│                    (Port 80/443 - SSL/TLS)                   │
└──────────────────┬──────────────────────────┬────────────────┘
                   │                          │
         ┌─────────▼──────────┐    ┌─────────▼──────────┐
         │   Frontend          │    │   Backend          │
         │   Next.js 14        │    │   FastAPI          │
         │   (Port 3000)       │    │   (Port 8000)      │
         │   - SSR/SSG         │    │   - RESTful API    │
         │   - React Query     │    │   - JWT Auth       │
         │   - i18n (FI/SE/EN) │    │   - Admin only     │
         └─────────────────────┘    └──────────┬─────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
         ┌──────────▼──────────┐   ┌─────────▼──────────┐   ┌─────────▼──────────┐
         │   PostgreSQL 15      │   │   Redis 7          │   │   Celery Workers    │
         │   (Port 5432)        │   │   (Port 6379)      │   │   - Background jobs │
         │   - Primary DB       │   │   - Cache          │   │   - Email sending   │
         │   - Product data     │   │   - Sessions       │   │   - Order processing│
         │   - User accounts    │   │   - Task queue     │   └────────────────────┘
         │   - Orders           │   └────────────────────┘
         └─────────────────────┘
```

### Container Architecture

1. **Nginx Container** - Reverse proxy, SSL termination, static file serving
2. **Frontend Container** - Next.js application (SSR/SSG)
3. **Backend Container** - FastAPI application (REST API)
4. **PostgreSQL Container** - Primary database
5. **Redis Container** - Caching and session management
6. **Celery Worker Container** - Background task processing

---

## Database Schema Design

### Core Entities

#### Users & Authentication
```sql
-- User accounts (customers and admins)
Table: users
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE NOT NULL
- username: VARCHAR(100) UNIQUE NOT NULL
- password_hash: VARCHAR(255) NOT NULL
- first_name: VARCHAR(100)
- last_name: VARCHAR(100)
- phone: VARCHAR(20)
- role: ENUM('customer', 'admin') NOT NULL
- is_active: BOOLEAN DEFAULT TRUE
- is_verified: BOOLEAN DEFAULT FALSE
- preferred_language: VARCHAR(5) DEFAULT 'fi' (fi, sv, en)
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
- last_login: TIMESTAMP

-- User addresses for shipping
Table: addresses
- id: UUID (PK)
- user_id: UUID (FK -> users.id)
- address_type: ENUM('shipping', 'billing') NOT NULL
- is_default: BOOLEAN DEFAULT FALSE
- full_name: VARCHAR(200)
- address_line1: VARCHAR(255) NOT NULL
- address_line2: VARCHAR(255)
- city: VARCHAR(100) NOT NULL
- state: VARCHAR(100)
- postal_code: VARCHAR(20) NOT NULL
- country: VARCHAR(2) NOT NULL (EU country codes)
- phone: VARCHAR(20)
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
```

#### Product Catalog
```sql
-- Product categories
Table: categories
- id: UUID (PK)
- parent_id: UUID (FK -> categories.id) NULLABLE
- name: VARCHAR(200) NOT NULL
- slug: VARCHAR(200) UNIQUE NOT NULL
- description: TEXT
- image_url: VARCHAR(500) (category banner image URL)
- sort_order: INTEGER DEFAULT 0
- is_active: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

-- Products
Table: products
- id: UUID (PK)
- category_id: UUID (FK -> categories.id)
- sku: VARCHAR(100) UNIQUE NOT NULL
- name: VARCHAR(300) NOT NULL
- slug: VARCHAR(300) UNIQUE NOT NULL
- description: TEXT
- short_description: VARCHAR(500)
- specifications: JSONB (detailed product specs table)
- price: DECIMAL(10,2) NOT NULL
- compare_at_price: DECIMAL(10,2) (original price for discounts)
- cost_per_item: DECIMAL(10,2) (internal cost)
- stock_quantity: INTEGER DEFAULT 0
- low_stock_threshold: INTEGER DEFAULT 10
- weight: DECIMAL(10,2) (in kg for shipping calculation)
- dimensions: JSONB (length, width, height in cm)
- has_variants: BOOLEAN DEFAULT FALSE
- is_active: BOOLEAN DEFAULT TRUE
- is_featured: BOOLEAN DEFAULT FALSE
- is_deal_of_day: BOOLEAN DEFAULT FALSE
- rating_avg: DECIMAL(3,2) DEFAULT 0.00
- rating_count: INTEGER DEFAULT 0
- review_count: INTEGER DEFAULT 0
- views_count: INTEGER DEFAULT 0
- sales_count: INTEGER DEFAULT 0
- return_rate: DECIMAL(5,2) DEFAULT 0.00 (transparency metric)
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

-- Product images (URLs only, no file uploads)
Table: product_images
- id: UUID (PK)
- product_id: UUID (FK -> products.id)
- image_url: VARCHAR(500) NOT NULL (external image URL)
- alt_text: VARCHAR(255)
- sort_order: INTEGER DEFAULT 0
- is_primary: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP DEFAULT NOW()

-- Product videos (URLs only)
Table: product_videos
- id: UUID (PK)
- product_id: UUID (FK -> products.id)
- video_url: VARCHAR(500) NOT NULL (YouTube, Vimeo, etc.)
- thumbnail_url: VARCHAR(500)
- title: VARCHAR(200)
- sort_order: INTEGER DEFAULT 0
- created_at: TIMESTAMP DEFAULT NOW()

-- Product variants (size, color, etc.)
Table: product_variants
- id: UUID (PK)
- product_id: UUID (FK -> products.id)
- sku: VARCHAR(100) UNIQUE NOT NULL
- name: VARCHAR(200) NOT NULL
- option1_name: VARCHAR(50) (e.g., "Size")
- option1_value: VARCHAR(100) (e.g., "Large")
- option2_name: VARCHAR(50) (e.g., "Color")
- option2_value: VARCHAR(100) (e.g., "Blue")
- option3_name: VARCHAR(50)
- option3_value: VARCHAR(100)
- price: DECIMAL(10,2) NOT NULL
- compare_at_price: DECIMAL(10,2)
- stock_quantity: INTEGER DEFAULT 0
- image_url: VARCHAR(500) (variant-specific image)
- is_active: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

-- Product tags
Table: tags
- id: UUID (PK)
- name: VARCHAR(100) UNIQUE NOT NULL
- slug: VARCHAR(100) UNIQUE NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()

Table: product_tags
- product_id: UUID (FK -> products.id)
- tag_id: UUID (FK -> tags.id)
- PRIMARY KEY (product_id, tag_id)

-- Product compatibility (cross-selling)
Table: product_compatibility
- id: UUID (PK)
- product_id: UUID (FK -> products.id)
- compatible_product_id: UUID (FK -> products.id)
- compatibility_type: ENUM('accessory', 'frequently_bought_together', 'similar') NOT NULL
- sort_order: INTEGER DEFAULT 0
- created_at: TIMESTAMP DEFAULT NOW()
- UNIQUE (product_id, compatible_product_id, compatibility_type)

-- Quantity-based pricing (bulk discounts)
Table: quantity_pricing
- id: UUID (PK)
- product_id: UUID (FK -> products.id)
- min_quantity: INTEGER NOT NULL
- max_quantity: INTEGER
- price: DECIMAL(10,2) NOT NULL
- discount_percentage: DECIMAL(5,2)
- created_at: TIMESTAMP DEFAULT NOW()
```

#### Shopping Cart & Wishlist
```sql
-- Shopping cart
Table: cart_items
- id: UUID (PK)
- user_id: UUID (FK -> users.id) NULLABLE
- session_id: VARCHAR(255) (for guest users)
- product_id: UUID (FK -> products.id)
- variant_id: UUID (FK -> product_variants.id) NULLABLE
- quantity: INTEGER NOT NULL DEFAULT 1
- price: DECIMAL(10,2) NOT NULL (snapshot at time of adding)
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
- UNIQUE (user_id, product_id, variant_id)
- UNIQUE (session_id, product_id, variant_id)

-- Wishlist
Table: wishlist_items
- id: UUID (PK)
- user_id: UUID (FK -> users.id)
- product_id: UUID (FK -> products.id)
- variant_id: UUID (FK -> product_variants.id) NULLABLE
- price_when_added: DECIMAL(10,2) (for price drop alerts)
- notes: TEXT
- created_at: TIMESTAMP DEFAULT NOW()
- UNIQUE (user_id, product_id, variant_id)

-- Saved for later (moved from cart)
Table: saved_items
- id: UUID (PK)
- user_id: UUID (FK -> users.id)
- product_id: UUID (FK -> products.id)
- variant_id: UUID (FK -> product_variants.id) NULLABLE
- quantity: INTEGER NOT NULL DEFAULT 1
- created_at: TIMESTAMP DEFAULT NOW()
```

#### Orders & Payments
```sql
-- Orders
Table: orders
- id: UUID (PK)
- order_number: VARCHAR(50) UNIQUE NOT NULL (e.g., "ORD-20240101-12345")
- user_id: UUID (FK -> users.id) NULLABLE (guest checkout)
- guest_email: VARCHAR(255) NULLABLE
- status: ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending'
- subtotal: DECIMAL(10,2) NOT NULL
- tax_amount: DECIMAL(10,2) DEFAULT 0.00
- shipping_amount: DECIMAL(10,2) DEFAULT 0.00
- discount_amount: DECIMAL(10,2) DEFAULT 0.00
- total_amount: DECIMAL(10,2) NOT NULL
- currency: VARCHAR(3) DEFAULT 'EUR'
- payment_status: ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending'
- payment_method: VARCHAR(50) (bank_transfer, stripe, paypal, etc.)
- shipping_method: VARCHAR(100) (standard, express)
- shipping_address: JSONB NOT NULL
- billing_address: JSONB NOT NULL
- customer_notes: TEXT
- admin_notes: TEXT
- tracking_number: VARCHAR(100)
- carrier: VARCHAR(100)
- estimated_delivery_date: DATE
- shipped_at: TIMESTAMP
- delivered_at: TIMESTAMP
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

-- Order items
Table: order_items
- id: UUID (PK)
- order_id: UUID (FK -> orders.id)
- product_id: UUID (FK -> products.id)
- variant_id: UUID (FK -> product_variants.id) NULLABLE
- product_name: VARCHAR(300) NOT NULL (snapshot)
- variant_name: VARCHAR(200) (snapshot)
- sku: VARCHAR(100) NOT NULL (snapshot)
- quantity: INTEGER NOT NULL
- unit_price: DECIMAL(10,2) NOT NULL
- total_price: DECIMAL(10,2) NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()

-- Payments
Table: payments
- id: UUID (PK)
- order_id: UUID (FK -> orders.id)
- payment_method: ENUM('bank_transfer', 'stripe', 'paypal', 'manual') NOT NULL
- transaction_id: VARCHAR(255) UNIQUE
- amount: DECIMAL(10,2) NOT NULL
- currency: VARCHAR(3) DEFAULT 'EUR'
- status: ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'pending'
- payment_intent_id: VARCHAR(255) (Stripe)
- payment_details: JSONB (metadata)
- paid_at: TIMESTAMP
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

-- Refunds
Table: refunds
- id: UUID (PK)
- order_id: UUID (FK -> orders.id)
- payment_id: UUID (FK -> payments.id)
- amount: DECIMAL(10,2) NOT NULL
- reason: TEXT
- status: ENUM('requested', 'approved', 'processed', 'rejected') DEFAULT 'requested'
- refund_transaction_id: VARCHAR(255)
- processed_at: TIMESTAMP
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
```

#### Reviews & Product Q&A
```sql
-- Product reviews
Table: reviews
- id: UUID (PK)
- product_id: UUID (FK -> products.id)
- user_id: UUID (FK -> users.id)
- order_item_id: UUID (FK -> order_items.id) NULLABLE (verified purchase)
- rating: INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5)
- title: VARCHAR(200)
- comment: TEXT
- pros: TEXT
- cons: TEXT
- is_verified_purchase: BOOLEAN DEFAULT FALSE
- helpful_count: INTEGER DEFAULT 0
- not_helpful_count: INTEGER DEFAULT 0
- is_approved: BOOLEAN DEFAULT FALSE
- admin_reply: TEXT
- replied_at: TIMESTAMP
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
- UNIQUE (product_id, user_id, order_item_id)

-- Review images (URLs only)
Table: review_images
- id: UUID (PK)
- review_id: UUID (FK -> reviews.id)
- image_url: VARCHAR(500) NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()

-- Review helpful votes
Table: review_votes
- id: UUID (PK)
- review_id: UUID (FK -> reviews.id)
- user_id: UUID (FK -> users.id)
- is_helpful: BOOLEAN NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()
- UNIQUE (review_id, user_id)

-- Product questions (Amazon-style Q&A)
Table: product_questions
- id: UUID (PK)
- product_id: UUID (FK -> products.id)
- user_id: UUID (FK -> users.id)
- question: TEXT NOT NULL
- is_answered: BOOLEAN DEFAULT FALSE
- helpful_count: INTEGER DEFAULT 0
- created_at: TIMESTAMP DEFAULT NOW()

-- Product answers
Table: product_answers
- id: UUID (PK)
- question_id: UUID (FK -> product_questions.id)
- user_id: UUID (FK -> users.id) NULLABLE (admin can answer)
- answer: TEXT NOT NULL
- is_official: BOOLEAN DEFAULT FALSE (admin answer)
- helpful_count: INTEGER DEFAULT 0
- created_at: TIMESTAMP DEFAULT NOW()
```

#### Coupons & Promotions
```sql
-- Discount coupons
Table: coupons
- id: UUID (PK)
- code: VARCHAR(50) UNIQUE NOT NULL
- description: TEXT
- discount_type: ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL
- discount_value: DECIMAL(10,2) NOT NULL
- minimum_purchase: DECIMAL(10,2) DEFAULT 0.00
- maximum_discount: DECIMAL(10,2) NULLABLE
- usage_limit: INTEGER NULLABLE
- usage_count: INTEGER DEFAULT 0
- user_usage_limit: INTEGER DEFAULT 1
- starts_at: TIMESTAMP
- expires_at: TIMESTAMP
- is_active: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

-- Coupon usage tracking
Table: coupon_usages
- id: UUID (PK)
- coupon_id: UUID (FK -> coupons.id)
- user_id: UUID (FK -> users.id) NULLABLE
- order_id: UUID (FK -> orders.id)
- discount_amount: DECIMAL(10,2) NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()
```

#### Shipping
```sql
-- Shipping methods (Standard, Express, etc.)
Table: shipping_methods
- id: UUID (PK)
- name: VARCHAR(200) NOT NULL
- description: TEXT
- delivery_time: VARCHAR(100) (e.g., "5-7 business days")
- base_cost: DECIMAL(10,2) NOT NULL
- cost_per_kg: DECIMAL(10,2) DEFAULT 0.00
- free_shipping_threshold: DECIMAL(10,2) NULLABLE
- is_express: BOOLEAN DEFAULT FALSE
- is_active: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

-- Shipping zones (European countries)
Table: shipping_zones
- id: UUID (PK)
- name: VARCHAR(200) NOT NULL
- countries: JSONB NOT NULL (array of EU country codes)
- is_active: BOOLEAN DEFAULT TRUE
- created_at: TIMESTAMP DEFAULT NOW()

-- Shipping zone rates
Table: shipping_zone_rates
- id: UUID (PK)
- zone_id: UUID (FK -> shipping_zones.id)
- method_id: UUID (FK -> shipping_methods.id)
- rate: DECIMAL(10,2) NOT NULL
- created_at: TIMESTAMP DEFAULT NOW()
```

#### Notifications & Stock Alerts
```sql
-- User notifications
Table: notifications
- id: UUID (PK)
- user_id: UUID (FK -> users.id)
- type: VARCHAR(50) NOT NULL (order_confirmed, order_shipped, price_drop, back_in_stock, etc.)
- title: VARCHAR(255) NOT NULL
- message: TEXT NOT NULL
- link: VARCHAR(500)
- is_read: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP DEFAULT NOW()

-- Stock alert subscriptions (notify when back in stock)
Table: stock_alerts
- id: UUID (PK)
- user_id: UUID (FK -> users.id)
- product_id: UUID (FK -> products.id)
- variant_id: UUID (FK -> product_variants.id) NULLABLE
- is_notified: BOOLEAN DEFAULT FALSE
- created_at: TIMESTAMP DEFAULT NOW()
- UNIQUE (user_id, product_id, variant_id)

-- Email logs
Table: email_logs
- id: UUID (PK)
- to_email: VARCHAR(255) NOT NULL
- subject: VARCHAR(500) NOT NULL
- template: VARCHAR(100)
- status: ENUM('sent', 'failed', 'pending') DEFAULT 'pending'
- error_message: TEXT
- sent_at: TIMESTAMP
- created_at: TIMESTAMP DEFAULT NOW()
```

#### Analytics & User Behavior
```sql
-- Product views tracking
Table: product_views
- id: UUID (PK)
- product_id: UUID (FK -> products.id)
- user_id: UUID (FK -> users.id) NULLABLE
- session_id: VARCHAR(255)
- viewed_at: TIMESTAMP DEFAULT NOW()

-- Search queries (for analytics and suggestions)
Table: search_queries
- id: UUID (PK)
- query: VARCHAR(500) NOT NULL
- results_count: INTEGER
- user_id: UUID (FK -> users.id) NULLABLE
- clicked_product_id: UUID (FK -> products.id) NULLABLE
- created_at: TIMESTAMP DEFAULT NOW()
```

---

## API Endpoints Specification

### Base URL Structure
```
Production: https://yourdomain.com/api/v1
Development: http://localhost:8000/api/v1
```

### Authentication Endpoints

```
POST   /api/v1/auth/register                 # Customer registration
POST   /api/v1/auth/login                    # User login (email/password)
POST   /api/v1/auth/refresh                  # Refresh access token
POST   /api/v1/auth/logout                   # User logout
POST   /api/v1/auth/password/forgot          # Forgot password
POST   /api/v1/auth/password/reset           # Reset password with token
POST   /api/v1/auth/email/verify             # Verify email address
POST   /api/v1/auth/email/resend             # Resend verification email
```

### User Management Endpoints

```
GET    /api/v1/users/me                      # Get current user profile
PUT    /api/v1/users/me                      # Update user profile
DELETE /api/v1/users/me                      # Delete user account
PUT    /api/v1/users/me/language             # Update preferred language (fi/sv/en)
GET    /api/v1/users/me/addresses            # List user addresses
POST   /api/v1/users/me/addresses            # Create address
PUT    /api/v1/users/me/addresses/{id}       # Update address
DELETE /api/v1/users/me/addresses/{id}       # Delete address
PATCH  /api/v1/users/me/addresses/{id}/default  # Set default address
PUT    /api/v1/users/me/password             # Change password
```

### Product Endpoints

```
GET    /api/v1/products                      # List products with filters
GET    /api/v1/products/featured             # Featured products
GET    /api/v1/products/deals                # Deal of the day products
GET    /api/v1/products/trending             # Trending products (most viewed/sold)
GET    /api/v1/products/search               # Search products (query, filters)
GET    /api/v1/products/{id}                 # Get product details
GET    /api/v1/products/{id}/variants        # Get product variants
GET    /api/v1/products/{id}/recommendations # Get related/compatible products
GET    /api/v1/products/{id}/reviews         # Get product reviews
GET    /api/v1/products/{id}/questions       # Get product Q&A
GET    /api/v1/products/{id}/availability    # Check stock availability

# Admin only
POST   /api/v1/products                      # Create product
PUT    /api/v1/products/{id}                 # Update product
DELETE /api/v1/products/{id}                 # Delete product
POST   /api/v1/products/{id}/images          # Add product image (URL)
DELETE /api/v1/products/{id}/images/{img_id} # Delete product image
POST   /api/v1/products/{id}/videos          # Add product video (URL)
DELETE /api/v1/products/{id}/videos/{vid_id} # Delete product video
POST   /api/v1/products/{id}/variants        # Create variant
PUT    /api/v1/products/{id}/variants/{var_id}  # Update variant
DELETE /api/v1/products/{id}/variants/{var_id}  # Delete variant
```

### Category Endpoints

```
GET    /api/v1/categories                    # List all categories (tree structure)
GET    /api/v1/categories/{slug}             # Get category details
GET    /api/v1/categories/{slug}/products    # Products in category

# Admin only
POST   /api/v1/categories                    # Create category
PUT    /api/v1/categories/{id}               # Update category
DELETE /api/v1/categories/{id}               # Delete category
```

### Cart Endpoints

```
GET    /api/v1/cart                          # Get cart items
POST   /api/v1/cart/items                    # Add item to cart
PUT    /api/v1/cart/items/{id}               # Update cart item quantity
DELETE /api/v1/cart/items/{id}               # Remove cart item
DELETE /api/v1/cart                          # Clear cart
POST   /api/v1/cart/merge                    # Merge guest cart with user cart (on login)
POST   /api/v1/cart/items/{id}/save          # Move item to saved for later
```

### Wishlist Endpoints

```
GET    /api/v1/wishlist                      # Get wishlist items
POST   /api/v1/wishlist                      # Add item to wishlist
DELETE /api/v1/wishlist/{id}                 # Remove wishlist item
POST   /api/v1/wishlist/{id}/move-to-cart    # Move to cart
PUT    /api/v1/wishlist/{id}                 # Update wishlist item notes
```

### Saved Items Endpoints

```
GET    /api/v1/saved                         # Get saved for later items
POST   /api/v1/saved/{id}/move-to-cart       # Move saved item back to cart
DELETE /api/v1/saved/{id}                    # Remove saved item
```

### Order Endpoints

```
POST   /api/v1/orders/calculate              # Calculate order totals (shipping, tax)
POST   /api/v1/orders                        # Create order (checkout)
GET    /api/v1/orders                        # List user orders
GET    /api/v1/orders/{id}                   # Get order details
GET    /api/v1/orders/{order_number}/track   # Track order by order number
PATCH  /api/v1/orders/{id}/cancel            # Cancel order (if not shipped)
POST   /api/v1/orders/{id}/refund            # Request refund

# Admin only
GET    /api/v1/admin/orders                  # List all orders with filters
PATCH  /api/v1/admin/orders/{id}/status      # Update order status
POST   /api/v1/admin/orders/{id}/tracking    # Add tracking information
PUT    /api/v1/admin/orders/{id}/notes       # Update admin notes
```

### Payment Endpoints

```
# Initial: Manual payment
POST   /api/v1/payments/manual/confirm       # Admin confirms manual payment

# Future: Payment gateway integration
POST   /api/v1/payments/stripe/intent        # Create Stripe payment intent
POST   /api/v1/payments/stripe/webhook       # Stripe webhook handler
POST   /api/v1/payments/paypal/create        # Create PayPal payment
POST   /api/v1/payments/paypal/capture       # Capture PayPal payment
GET    /api/v1/payments/{id}                 # Get payment details (admin)
```

### Review Endpoints

```
POST   /api/v1/products/{id}/reviews         # Create review (requires purchase)
PUT    /api/v1/reviews/{id}                  # Update own review
DELETE /api/v1/reviews/{id}                  # Delete own review
POST   /api/v1/reviews/{id}/images           # Upload review images (URLs)
POST   /api/v1/reviews/{id}/vote             # Vote helpful/not helpful
GET    /api/v1/users/me/reviews              # User's reviews

# Admin only
GET    /api/v1/admin/reviews/pending         # Pending reviews for approval
PATCH  /api/v1/admin/reviews/{id}/approve    # Approve review
PATCH  /api/v1/admin/reviews/{id}/reply      # Admin reply to review
DELETE /api/v1/admin/reviews/{id}            # Delete review (moderation)
```

### Product Q&A Endpoints

```
POST   /api/v1/products/{id}/questions       # Ask a question
POST   /api/v1/questions/{id}/answers        # Answer a question
POST   /api/v1/questions/{id}/vote           # Vote helpful
POST   /api/v1/answers/{id}/vote             # Vote helpful on answer

# Admin only
POST   /api/v1/admin/questions/{id}/answer   # Official admin answer
DELETE /api/v1/admin/questions/{id}          # Delete question (moderation)
DELETE /api/v1/admin/answers/{id}            # Delete answer (moderation)
```

### Coupon Endpoints

```
POST   /api/v1/coupons/validate              # Validate and get coupon details
POST   /api/v1/coupons/apply                 # Apply coupon to cart

# Admin only
GET    /api/v1/admin/coupons                 # List all coupons
POST   /api/v1/admin/coupons                 # Create coupon
PUT    /api/v1/admin/coupons/{id}            # Update coupon
DELETE /api/v1/admin/coupons/{id}            # Delete coupon
GET    /api/v1/admin/coupons/{id}/usage      # View coupon usage stats
```

### Shipping Endpoints

```
GET    /api/v1/shipping/methods              # Available shipping methods
POST   /api/v1/shipping/calculate            # Calculate shipping cost
GET    /api/v1/shipping/zones                # Shipping zones

# Admin only
POST   /api/v1/admin/shipping/zones          # Create shipping zone
PUT    /api/v1/admin/shipping/zones/{id}     # Update shipping zone
POST   /api/v1/admin/shipping/methods        # Create shipping method
PUT    /api/v1/admin/shipping/methods/{id}   # Update shipping method
```

### Stock Alert Endpoints

```
POST   /api/v1/stock-alerts                  # Subscribe to stock alert
DELETE /api/v1/stock-alerts/{id}             # Unsubscribe from alert
GET    /api/v1/stock-alerts                  # Get user's active alerts
```

### Admin Dashboard Endpoints

```
GET    /api/v1/admin/dashboard               # Dashboard overview stats
GET    /api/v1/admin/analytics               # Platform analytics
GET    /api/v1/admin/analytics/sales         # Sales analytics
GET    /api/v1/admin/analytics/products      # Product performance
GET    /api/v1/admin/analytics/customers     # Customer analytics

# User Management
GET    /api/v1/admin/users                   # List all users
GET    /api/v1/admin/users/{id}              # User details
PATCH  /api/v1/admin/users/{id}/status       # Activate/deactivate user
DELETE /api/v1/admin/users/{id}              # Delete user

# Product Management
GET    /api/v1/admin/products                # List all products
GET    /api/v1/admin/products/low-stock      # Low stock products
POST   /api/v1/admin/products/import         # Bulk import products (CSV)
GET    /api/v1/admin/products/export         # Export products (CSV)

# Reports
GET    /api/v1/admin/reports/sales           # Sales reports with date filters
GET    /api/v1/admin/reports/inventory       # Inventory reports
GET    /api/v1/admin/reports/customers       # Customer reports
GET    /api/v1/admin/reports/returns         # Return/refund reports
```

### Search & Filter Endpoints

```
GET    /api/v1/search                        # Global search (products, categories)
GET    /api/v1/search/suggestions            # Search suggestions (autocomplete)
GET    /api/v1/search/popular                # Popular search queries
GET    /api/v1/filters                       # Available filters for products
```

### Notification Endpoints

```
GET    /api/v1/notifications                 # User notifications
PATCH  /api/v1/notifications/{id}/read       # Mark notification as read
PATCH  /api/v1/notifications/read-all        # Mark all as read
DELETE /api/v1/notifications/{id}            # Delete notification
```

---

## Frontend Structure & Pages

### Public Pages

```
/                                             # Homepage
  - Hero banner with featured products
  - Deal of the day section
  - Featured categories
  - Trending products
  - Recently viewed products (if logged in)
  - Promotional banners

/products                                     # Product listing page
  - Advanced filters sidebar
  - Sort options
  - Grid/list view toggle
  - Pagination
  - Availability filter

/products/[slug]                              # Product detail page
  - Image gallery with zoom
  - Product videos
  - Variant selector (size, color, etc.)
  - Quantity selector with bulk pricing display
  - Stock availability indicator
  - Add to cart / Add to wishlist
  - Product specifications table
  - Shipping calculator
  - Reviews section with sorting/filtering
  - Q&A section
  - Related products
  - Frequently bought together
  - Recently viewed products

/categories                                   # Browse categories
/categories/[slug]                            # Category page with subcategories

/search                                       # Search results page
/deals                                        # Deal of the day / Promotions page

/about                                        # About us
/contact                                      # Contact page
/help                                         # Help center / FAQ
/shipping                                     # Shipping information
/returns                                      # Returns policy
/terms                                        # Terms of service
/privacy                                      # Privacy policy
```

### Authentication Pages

```
/auth/login                                   # Login page (email/password only)
/auth/register                                # Registration page
/auth/forgot-password                         # Forgot password
/auth/reset-password                          # Reset password with token
/auth/verify-email                            # Email verification
```

### Customer Pages (Protected)

```
/account                                      # Account dashboard
  - Order summary
  - Quick links to sections
  - Wishlist preview
  - Notifications

/account/profile                              # Edit profile
  - Personal information
  - Language preference (FI/SE/EN)

/account/addresses                            # Manage addresses
  - Add/edit/delete addresses
  - Set default address

/account/orders                               # Order history
  - Order list with search/filter
  - Order status

/account/orders/[id]                          # Order details
  - Order items
  - Tracking information
  - Download invoice
  - Request refund (if eligible)
  - Reorder button

/account/wishlist                             # Wishlist
  - Wishlist items with price drop indicators
  - Move to cart
  - Remove items
  - Share wishlist (optional)

/account/reviews                              # My reviews
  - Pending reviews (products purchased but not reviewed)
  - Submitted reviews
  - Edit/delete reviews

/account/notifications                        # Notifications center
/account/stock-alerts                         # Stock alert subscriptions
/account/settings                             # Account settings
  - Change password
  - Email preferences
  - Delete account
```

### Shopping Flow

```
/cart                                         # Shopping cart
  - Cart items with quantity adjustment
  - Saved for later section
  - Cart summary with discounts
  - Shipping estimate
  - Recommendations
  - Apply coupon code
  - Proceed to checkout

/checkout                                     # Checkout page (multi-step)
  Step 1: Shipping address
  Step 2: Shipping method (Standard/Express)
  Step 3: Payment method
  Step 4: Review order

/checkout/success                             # Order confirmation
  - Order number
  - Order summary
  - Expected delivery
  - Track order link

/wishlist                                     # Wishlist page (same as /account/wishlist)
```

### Admin Portal (Protected - Admin Only)

```
/admin                                        # Admin dashboard
  - Sales overview (today, week, month, year)
  - Recent orders
  - Low stock alerts
  - Pending reviews
  - Quick stats (revenue, orders, customers)
  - Sales charts

/admin/products                               # Product management
  - Product list with search/filter
  - Bulk actions
  - Add new product button

/admin/products/new                           # Add new product
/admin/products/[id]/edit                     # Edit product
  - Basic information
  - Images (add URLs)
  - Videos (add URLs)
  - Variants
  - Specifications
  - Pricing & inventory
  - SEO settings
  - Related products

/admin/products/import                        # Bulk import products (CSV)
/admin/products/low-stock                     # Low stock products

/admin/categories                             # Category management
  - Category tree
  - Add/edit/delete categories
  - Reorder categories

/admin/orders                                 # Order management
  - Order list with filters
  - Search by order number, customer, date
  - Bulk status updates

/admin/orders/[id]                            # Order details
  - Order information
  - Customer details
  - Items ordered
  - Update status
  - Add tracking number
  - Admin notes
  - Process refund
  - Print invoice/packing slip

/admin/customers                              # Customer management
  - Customer list
  - Search/filter customers
  - View customer details
  - Order history per customer

/admin/customers/[id]                         # Customer details

/admin/reviews                                # Review moderation
  - Pending reviews for approval
  - All reviews with filters
  - Approve/reject/delete reviews
  - Reply to reviews

/admin/questions                              # Q&A moderation
  - Product questions
  - Answer questions
  - Delete inappropriate content

/admin/coupons                                # Coupon management
  - Coupon list
  - Create/edit/delete coupons
  - Usage statistics

/admin/coupons/new                            # Create coupon
/admin/coupons/[id]/edit                      # Edit coupon

/admin/shipping                               # Shipping settings
  - Shipping methods
  - Shipping zones
  - Rates configuration

/admin/analytics                              # Platform analytics
  - Sales analytics with charts
  - Product performance
  - Customer behavior
  - Traffic sources
  - Conversion rates
  - Popular searches

/admin/reports                                # Reports & insights
  - Sales reports (daily, weekly, monthly, custom range)
  - Inventory reports
  - Customer reports
  - Return/refund reports
  - Export reports (CSV, PDF)

/admin/settings                               # Platform settings
  - General settings
  - Email settings (SMTP, templates)
  - Payment settings (manual, Stripe, PayPal)
  - Tax settings
  - Currency settings (EUR)
  - Language settings (FI/SE/EN)
  - Return policy settings (32-day window)
  - SEO settings
```

### Component Structure

```
components/
├── layout/
│   ├── Header.tsx                           # Site header with language switcher
│   ├── Footer.tsx                           # Site footer
│   ├── Navbar.tsx                           # Navigation with categories
│   ├── LanguageSwitcher.tsx                 # FI/SE/EN switcher
│   └── MobileMenu.tsx                       # Mobile hamburger menu
│
├── products/
│   ├── ProductCard.tsx                      # Product card (grid/list)
│   ├── ProductGrid.tsx                      # Product grid layout
│   ├── ProductList.tsx                      # Product list layout
│   ├── ProductDetail.tsx                    # Product detail view
│   ├── ProductGallery.tsx                   # Image/video gallery with zoom
│   ├── ProductVariants.tsx                  # Variant selector (size/color)
│   ├── ProductSpecs.tsx                     # Specifications table
│   ├── ProductFilters.tsx                   # Advanced filter sidebar
│   ├── ProductSearch.tsx                    # Search with autocomplete
│   ├── ProductRecommendations.tsx           # Related products
│   ├── StockIndicator.tsx                   # Stock availability indicator
│   ├── BulkPricing.tsx                      # Quantity discount display
│   └── StockAlertButton.tsx                 # "Notify when in stock"
│
├── cart/
│   ├── CartItem.tsx                         # Cart item component
│   ├── CartSummary.tsx                      # Cart total summary
│   ├── CartDrawer.tsx                       # Slide-out cart (mini cart)
│   ├── EmptyCart.tsx                        # Empty state
│   ├── SavedForLater.tsx                    # Saved items section
│   └── CouponInput.tsx                      # Coupon code input
│
├── checkout/
│   ├── CheckoutStepper.tsx                  # Multi-step progress indicator
│   ├── ShippingForm.tsx                     # Shipping address form
│   ├── ShippingMethodSelector.tsx           # Standard/Express selection
│   ├── PaymentMethodSelector.tsx            # Payment method selection
│   ├── OrderReview.tsx                      # Final order review
│   ├── OrderSummary.tsx                     # Order summary sidebar
│   └── OrderConfirmation.tsx                # Success page
│
├── reviews/
│   ├── ReviewList.tsx                       # Reviews list with sorting
│   ├── ReviewItem.tsx                       # Single review display
│   ├── ReviewForm.tsx                       # Review submission form
│   ├── ReviewFilters.tsx                    # Filter by rating, verified, etc.
│   ├── RatingStars.tsx                      # Star rating display
│   ├── RatingDistribution.tsx               # Rating histogram
│   └── ReviewImages.tsx                     # Review photo gallery
│
├── questions/
│   ├── QuestionList.tsx                     # Product Q&A list
│   ├── QuestionItem.tsx                     # Single question with answers
│   ├── AskQuestion.tsx                      # Ask question form
│   ├── AnswerForm.tsx                       # Answer question form
│   └── QuestionVoting.tsx                   # Helpful voting
│
├── wishlist/
│   ├── WishlistItem.tsx                     # Wishlist item
│   ├── WishlistGrid.tsx                     # Wishlist grid view
│   ├── PriceDropIndicator.tsx               # Price drop badge
│   └── ShareWishlist.tsx                    # Share wishlist (optional)
│
├── admin/
│   ├── AdminSidebar.tsx                     # Admin navigation
│   ├── DashboardStats.tsx                   # Dashboard stat cards
│   ├── SalesChart.tsx                       # Sales chart (recharts)
│   ├── DataTable.tsx                        # Reusable data table
│   ├── OrderStatusBadge.tsx                 # Order status indicator
│   ├── ProductForm.tsx                      # Product add/edit form
│   ├── CategoryTree.tsx                     # Category tree view
│   ├── ReviewModerationCard.tsx             # Review approval card
│   ├── CouponForm.tsx                       # Coupon form
│   └── ReportFilters.tsx                    # Report date/filter controls
│
├── common/
│   ├── Button.tsx                           # Button component
│   ├── Input.tsx                            # Input field
│   ├── Select.tsx                           # Select dropdown
│   ├── Checkbox.tsx                         # Checkbox
│   ├── Radio.tsx                            # Radio button
│   ├── Modal.tsx                            # Modal dialog
│   ├── Drawer.tsx                           # Side drawer
│   ├── Toast.tsx                            # Toast notification
│   ├── Loading.tsx                          # Loading spinner
│   ├── Skeleton.tsx                         # Skeleton loader
│   ├── Pagination.tsx                       # Pagination
│   ├── Breadcrumbs.tsx                      # Breadcrumb navigation
│   ├── Tabs.tsx                             # Tabs component
│   ├── Accordion.tsx                        # Accordion
│   ├── Tooltip.tsx                          # Tooltip
│   ├── Badge.tsx                            # Badge/tag
│   ├── Avatar.tsx                           # User avatar
│   └── EmptyState.tsx                       # Empty state placeholder
│
└── ui/ (shadcn/ui components)
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── form.tsx
    ├── label.tsx
    ├── select.tsx
    ├── table.tsx
    ├── tabs.tsx
    └── ... (other shadcn components)
```

---

## Feature Requirements

### Phase 1: Foundation & Internationalization (Weeks 1-8)

#### 1.1 Multi-Language Support (Critical!)
- **UI Languages**: Finnish (Suomi), Swedish (Svenska), English
- Language switcher in header (top-right corner on desktop, in mobile menu)
- Display language names in native form: "Suomi", "Svenska", "English"
- Context-aware switching (preserve current page when switching language)
- User preference saved in account settings
- Translation files using next-i18next
- **Important**: Only UI elements translated - product content is single-language
- Date/number/currency formatting per locale
- RTL support NOT required (all languages are LTR)

#### 1.2 User Authentication
- Email/password authentication only (NO OAuth/social login)
- User registration with email verification
- Login with JWT token
- Password reset flow with email token
- Role-based access control (Admin, Customer)
- Session management with Redis
- "Remember me" functionality
- Account activation/deactivation

#### 1.3 User Profile Management
- User profile creation and editing
- Multiple shipping/billing addresses
- Default address selection
- Preferred language selection (FI/SE/EN)
- Order history access
- Account settings
- Account deletion

---

### Phase 2: Product Catalog & Discovery (Weeks 9-14)

#### 2.1 Category Management
- Hierarchical category structure (3 levels deep)
- Category creation, editing, deletion (admin)
- Category images (URLs)
- Category descriptions
- Category sorting/reordering
- Breadcrumb navigation
- SEO-friendly category URLs (slugs)

#### 2.2 Product Management (Admin)
- Product creation with detailed information
- Product name, description, short description
- SKU generation
- Pricing (regular price, compare-at price for discounts)
- Cost per item (internal tracking)
- Product specifications (JSONB for flexibility)
- Weight and dimensions for shipping
- Stock quantity management
- Low stock threshold alerts
- Active/inactive product status
- Featured products flag
- Deal of the day flag
- Category assignment
- Tag assignment
- SEO metadata (title, description, keywords)

#### 2.3 Product Images & Videos
- Multiple images per product (stored as URLs)
- Primary image selection
- Image sorting/reordering
- Image alt text for SEO
- Product videos (YouTube, Vimeo, or direct URLs)
- Video thumbnails
- **No file uploads** - admin pastes image/video URLs

#### 2.4 Product Variants
- Multi-option variants (size, color, material, etc.)
- Up to 3 variant options per product
- Variant-specific SKU, price, stock, and image
- Variant selector with visual swatches
- Stock availability per variant
- Active/inactive variants

#### 2.5 Product Discovery
- Advanced product search with autocomplete
- Search suggestions based on popular queries
- Search history (logged-in users)
- Filters:
  - Price range
  - Category
  - Tags
  - Rating (1-5 stars)
  - Availability (in stock, low stock, out of stock)
  - Product attributes (from specifications)
- Sort options:
  - Relevance (default for search)
  - Price: Low to High
  - Price: High to Low
  - Newest arrivals
  - Best selling
  - Highest rated
  - Most reviewed
- Grid/list view toggle
- Pagination with configurable page size
- "Load more" infinite scroll option

#### 2.6 Product Page Features
- High-quality image gallery with zoom
- Product video player
- Variant selector (if applicable)
- Quantity selector
- Bulk pricing display (quantity discounts)
- Real-time stock availability indicator:
  - "X in stock" (high stock)
  - "Only X left" (low stock)
  - "Out of stock" + "Notify when back in stock" button
- Add to cart button (with quantity)
- Add to wishlist button
- Share product (social media, copy link)
- Product specifications table
- Shipping cost calculator (by postal code)
- Estimated delivery date
- Related products section
- Frequently bought together
- Product compatibility/accessories
- Customer reviews with sorting/filtering
- Product Q&A section
- Recently viewed products

---

### Phase 3: Shopping Experience (Weeks 15-18)

#### 3.1 Shopping Cart
- Add products to cart (with quantity and variant selection)
- Cart persistence:
  - Logged-in users: Database-backed cart
  - Guest users: Session-backed cart (Redis)
- Cart merge on login (guest cart + user cart)
- Update cart item quantities
- Remove items from cart
- "Save for later" functionality
- Cart item validation:
  - Price changes notification
  - Stock availability check
  - Product discontinued notification
- Cart summary:
  - Subtotal
  - Applied discounts
  - Estimated tax
  - Estimated shipping
  - Grand total
- Quantity-based pricing display (bulk discounts)
- Mini cart (slide-out drawer) accessible from header
- Recommended products in cart
- Empty cart state with suggested products
- Clear cart functionality
- Shopping cart persistence duration: 30 days

#### 3.2 Wishlist
- Add/remove products to wishlist
- Wishlist with variant selection
- Price tracking for wishlist items
- Price drop notifications
- Move wishlist items to cart
- Wishlist item notes
- Share wishlist (public/private URL) - optional
- Multiple wishlist collections - optional
- Wishlist item availability tracking

#### 3.3 Saved for Later
- Move cart items to "saved for later"
- Move saved items back to cart
- Separate saved items section in cart page

#### 3.4 Bulk Pricing
- Quantity-based pricing tiers (admin configurable)
- Display pricing tiers on product page:
  - "Buy 10-49: €9.99 each"
  - "Buy 50+: €8.99 each"
- Automatic discount application in cart
- B2B wholesale pricing (optional future enhancement)

#### 3.5 Checkout Process
- Multi-step checkout flow:

  **Step 1: Shipping Address**
  - Select existing address or add new
  - Address form with EU country selector
  - Save address to account
  - Guest checkout with email

  **Step 2: Shipping Method**
  - Display available shipping methods
  - Standard delivery (5-7 days)
  - Express delivery (1-3 days)
  - Show shipping cost for each method
  - Show estimated delivery date
  - Free shipping indicator (if threshold met)

  **Step 3: Payment Method**
  - Manual payment options (initial launch):
    - Bank transfer (instructions provided)
    - Invoice (for registered customers)
    - Cash on delivery (optional)
  - Future: Stripe, PayPal integration

  **Step 4: Review Order**
  - Order summary with all items
  - Shipping address
  - Billing address (same or different)
  - Shipping method
  - Payment method
  - Order notes field
  - Apply coupon code
  - Final total breakdown
  - Terms & conditions checkbox
  - Place order button

- Guest checkout option
- Order notes/special instructions
- Coupon/promo code application
- Order summary sidebar (visible on all steps)
- Progress indicator (steps 1-4)
- Back/Next navigation between steps
- Form validation with clear error messages
- Checkout session timeout (30 minutes)

---

### Phase 4: Orders & Payment (Weeks 19-22)

#### 4.1 Order Management
- Order creation upon checkout completion
- Unique order number generation (ORD-YYYYMMDD-XXXXX)
- Order statuses:
  - Pending (payment not confirmed)
  - Confirmed (payment confirmed, awaiting processing)
  - Processing (being prepared for shipment)
  - Shipped (tracking number provided)
  - Delivered (confirmed delivered)
  - Cancelled (cancelled by customer or admin)
  - Refunded (refund processed)
- Order history for customers
- Order details view:
  - Order items with images
  - Quantities and prices
  - Shipping address
  - Billing address
  - Payment method
  - Tracking information
  - Order timeline/status history
- Order cancellation (before processing)
- Reorder functionality (add all items to cart)
- Download invoice (PDF)
- Order email notifications:
  - Order confirmation
  - Payment confirmed
  - Order shipped with tracking
  - Order delivered
  - Order cancelled
- Guest order tracking (by order number + email)

#### 4.2 Payment Processing (Initial: Manual)

**Phase 4A - Manual Payment (Initial Launch):**
- Order created with "pending" payment status
- Payment instructions sent via email:
  - Bank account details
  - Reference number (order number)
  - Payment deadline (7 days)
- Admin manually confirms payment
- Order status updated to "confirmed" after payment verification
- Invoice generation (PDF)
- Receipt email sent to customer

**Phase 4B - Automated Payment (Future):**
- Stripe integration:
  - Credit/debit cards
  - Apple Pay / Google Pay
  - 3D Secure support
  - Webhook handling
- PayPal integration:
  - PayPal Express Checkout
  - Webhook handling
- Payment method saved securely (for future orders)
- Instant order confirmation
- PCI compliance considerations

#### 4.3 Order Fulfillment (Admin)
- Admin order dashboard:
  - New orders requiring attention
  - Orders awaiting payment confirmation
  - Orders ready to ship
  - Shipped orders
- Order filtering and search
- Bulk order status updates
- Order details page:
  - Customer information
  - Order items
  - Payment status
  - Update order status dropdown
  - Add tracking number
  - Add carrier name
  - Internal admin notes
  - Print packing slip
  - Print invoice
- Low stock alerts when orders placed
- Inventory automatically deducted upon order confirmation
- Email customer on status changes

---

### Phase 5: Reviews & Product Q&A (Weeks 23-24)

#### 5.1 Product Reviews
- Review submission (authenticated users only)
- Review only allowed for purchased products (verified purchase)
- Review form:
  - 5-star rating (required)
  - Review title
  - Review text (required)
  - Pros field (optional)
  - Cons field (optional)
  - Review images (URLs, up to 5)
- Verified purchase badge
- Review moderation:
  - Pending approval by admin
  - Admin can approve/reject
  - Admin can delete inappropriate reviews
- Admin reply to reviews
- Review display:
  - Sort by: Most helpful, newest, highest rating, lowest rating
  - Filter by: Rating (5-star, 4-star, etc.), verified purchase, with photos
  - Review pagination
- Review voting (helpful/not helpful)
- Rating distribution histogram
- Average rating calculation
- Review count per product
- Email notification to customer when review is approved
- Request review email sent X days after delivery

#### 5.2 Product Q&A (Amazon-style)
- Ask a question about product
- Answer questions:
  - Other customers can answer
  - Admin can provide official answers (marked as "Official")
- Question/answer voting (helpful)
- Admin moderation:
  - Delete inappropriate questions/answers
  - Official answers highlighted
- Display on product page below reviews

---

### Phase 6: Shipping & Delivery (Weeks 25-26)

#### 6.1 Shipping Configuration (Admin)
- Shipping methods setup:
  - Name (e.g., "Standard Delivery", "Express Delivery")
  - Description
  - Delivery time estimate
  - Base cost
  - Cost per kg
  - Is express flag
  - Active/inactive
- Shipping zones:
  - Zone name (e.g., "Nordic Countries", "Central Europe")
  - EU countries in zone (multi-select)
  - Active/inactive
- Shipping zone rates:
  - Method + Zone = Rate
  - Admin configures rates per zone per method

#### 6.2 Shipping Calculation
- Calculate shipping cost based on:
  - Destination country
  - Total cart weight
  - Shipping method selected
- Free shipping threshold:
  - Configurable minimum order amount
  - Display progress bar in cart: "Add €X more for free shipping"
- Real-time shipping rate display:
  - In cart
  - During checkout

#### 6.3 Order Tracking (Manual Initially)
- Admin adds tracking number manually
- Tracking number displayed on order details
- Carrier name displayed
- Estimated delivery date
- Order tracking page:
  - Enter order number + email (for guests)
  - Show order status and tracking info
- Email notification when order shipped (with tracking link)
- Future: Carrier API integration for real-time tracking updates

---

### Phase 7: Advanced Features (Weeks 27-30)

#### 7.1 Coupons & Promotions
- Coupon code creation (admin):
  - Unique coupon code
  - Description
  - Discount type:
    - Percentage off (e.g., 10% off)
    - Fixed amount (e.g., €10 off)
    - Free shipping
  - Discount value
  - Minimum purchase amount
  - Maximum discount cap (for percentage discounts)
  - Usage limits:
    - Total usage limit
    - Per-user usage limit
  - Start date
  - Expiration date
  - Active/inactive
- Coupon validation at checkout
- Coupon application in cart
- Display discount in order summary
- Coupon usage tracking
- Coupon analytics (admin):
  - Total usage
  - Total discount given
  - Revenue generated
  - Most popular coupons

#### 7.2 Deal of the Day
- Admin marks products as "deal of the day"
- Featured on homepage in dedicated section
- Optional: Countdown timer (deal expires at midnight)
- Deal badge on product cards
- Dedicated deals page

#### 7.3 Product Recommendations

**Basic Recommendations (Phase 7A):**
- Related products (same category)
- Frequently bought together:
  - Based on order history
  - Admin can manually set
- Product compatibility/accessories:
  - Admin manually links compatible products
  - Display on product page
- Recently viewed products (per session/user)
- Trending products (most viewed/sold in last 7 days)

**Advanced Recommendations (Phase 7B - Optional):**
- Collaborative filtering (users who bought X also bought Y)
- Personalized recommendations based on browsing/purchase history
- AI-powered product matching (Amazon Interests-style)
- Email recommendations

#### 7.4 Stock Alerts
- "Notify me when back in stock" button (out-of-stock products)
- User subscribes with email
- Email sent automatically when product back in stock
- Unsubscribe from stock alerts
- Admin view of stock alert subscriptions per product

#### 7.5 Email Notifications
- Automated email templates (Jinja2):
  - Welcome email (after registration)
  - Email verification
  - Password reset
  - Order confirmation
  - Payment instructions (manual payment)
  - Payment received confirmation
  - Order shipped (with tracking)
  - Order delivered
  - Order cancelled
  - Refund processed
  - Review request (X days after delivery)
  - Back in stock notification
  - Price drop alert (wishlist)
  - Promotional emails (opt-in)
- Admin email template editor (optional)
- Email logs for debugging
- Unsubscribe from marketing emails

#### 7.6 Search Improvements
- Search autocomplete with product suggestions
- Search query logging for analytics
- Popular searches display
- Search filters sidebar
- Typo tolerance and synonyms
- Search by SKU
- "Did you mean...?" suggestions
- No results page with suggestions
- Future: Elasticsearch integration for advanced search

---

### Phase 8: Admin & Analytics (Weeks 31-32)

#### 8.1 Admin Dashboard
- Overview statistics:
  - Today's sales (revenue)
  - Week's sales
  - Month's sales
  - Year's sales
  - Total orders (today, week, month)
  - New customers (today, week, month)
  - Average order value
  - Conversion rate
- Sales chart (recharts):
  - Line chart showing revenue over time
  - Selectable time range (7 days, 30 days, 90 days, year)
- Recent orders table
- Low stock products alert
- Pending review approvals count
- Top selling products (today, week, month)
- Quick actions:
  - Add new product
  - View pending orders
  - View low stock products

#### 8.2 User Management (Admin)
- User list with search/filters:
  - Search by name, email
  - Filter by role (admin, customer)
  - Filter by status (active, inactive, unverified)
- User details view:
  - Personal information
  - Order history
  - Total spent
  - Account created date
  - Last login
- User activation/deactivation
- Delete user account
- Role management (promote customer to admin)
- Password reset for user (admin can trigger)

#### 8.3 Order Management (Admin)
- All orders view with filters:
  - Search by order number, customer name, email
  - Filter by status
  - Filter by payment status
  - Filter by date range
  - Sort by date, total amount
- Order details page (see Phase 4.3)
- Bulk actions:
  - Export orders (CSV)
  - Bulk status update
- Order statistics

#### 8.4 Product Management (Admin)
- Product list with search/filters:
  - Search by name, SKU
  - Filter by category
  - Filter by status (active, inactive)
  - Filter by stock status (in stock, low stock, out of stock)
  - Sort by date added, price, stock, sales count
- Product quick edit (inline editing)
- Bulk actions:
  - Bulk price update
  - Bulk category change
  - Bulk activate/deactivate
  - Bulk delete
  - Export products (CSV)
  - Import products (CSV upload)
- Low stock products view
- Out of stock products view
- Product performance metrics

#### 8.5 Category Management (Admin)
- Category tree view with drag-and-drop reordering
- Add/edit/delete categories
- Category hierarchy management
- Bulk actions

#### 8.6 Review Moderation (Admin)
- Pending reviews queue
- Review list with filters:
  - Filter by status (pending, approved)
  - Filter by rating
  - Search by product name, reviewer name
- Approve/reject reviews
- Delete reviews (with reason)
- Reply to reviews (official admin response)
- Review statistics

#### 8.7 Analytics & Reports
- Sales analytics:
  - Revenue over time (daily, weekly, monthly, yearly)
  - Revenue by category
  - Revenue by product
  - Average order value trend
  - Orders by status breakdown
- Product performance:
  - Best selling products
  - Most viewed products
  - Most reviewed products
  - Highest rated products
  - Products with highest return rate
  - Slow-moving inventory
- Customer analytics:
  - New customers over time
  - Returning customer rate
  - Customer lifetime value
  - Top customers by spend
  - Customer geographic distribution (EU countries)
- Marketing analytics:
  - Conversion rate
  - Cart abandonment rate
  - Coupon effectiveness
  - Popular search queries
  - Traffic sources (requires Google Analytics integration)
- Reports:
  - Sales report (configurable date range, export CSV/PDF)
  - Inventory report (current stock levels, export CSV)
  - Customer report (customer list with stats, export CSV)
  - Return/refund report (export CSV)

#### 8.8 Platform Settings (Admin)
- General settings:
  - Store name
  - Contact email
  - Support phone
  - Default language (FI/SE/EN)
  - Currency (EUR - locked)
  - Tax rate (VAT percentage per EU country)
- Email settings:
  - SMTP configuration
  - Sender name and email
  - Enable/disable email notifications
- Payment settings:
  - Manual payment instructions (bank details)
  - Stripe API keys (future)
  - PayPal API keys (future)
- Shipping settings:
  - Free shipping threshold
  - Enable/disable shipping methods
- Return policy settings:
  - Return window (default: 32 days)
  - Return instructions
- SEO settings:
  - Meta title
  - Meta description
  - Google Analytics tracking ID (future)
  - Facebook Pixel ID (future)

---

### Phase 9: Optional Future Enhancements (Post-Launch)

#### 9.1 Progressive Web App (PWA)
- PWA configuration
- Offline support
- Add to home screen
- Push notifications (optional)
- Service worker setup

#### 9.2 Mobile Optimization
- Fully responsive design
- Touch-friendly interfaces
- Mobile navigation (hamburger menu)
- Mobile-optimized images
- Swipe gestures for image galleries

#### 9.3 Advanced Payment Features
- Saved payment methods
- Express checkout (Amazon 1-Click style)
- Buy now, pay later (Klarna integration)
- Subscription payments (for recurring orders)

#### 9.4 Loyalty Program
- Points system
- Member tiers
- Exclusive discounts for members
- Early access to sales
- Birthday rewards

#### 9.5 AI/ML Features
- AI-powered product recommendations
- Chatbot customer support
- Image search (upload photo, find similar products)
- Dynamic pricing optimization
- Fraud detection

#### 9.6 Advanced Inventory
- Multi-warehouse support
- Supplier management
- Purchase orders
- Inventory forecasting
- Automated reordering

#### 9.7 B2B Features
- Business account registration
- Wholesale pricing tiers
- Quote requests
- Net payment terms (invoice with 30-day terms)
- Bulk ordering forms

---

## Security Requirements

### Authentication & Authorization
- JWT tokens with HS256 algorithm
- Access token expiration: 30 minutes
- Refresh token expiration: 7 days
- Token rotation on refresh
- Password hashing with bcrypt (cost factor 12)
- HTTPS enforcement (production)
- CORS configuration (whitelist frontend domain)
- Rate limiting on authentication endpoints:
  - Login: 5 attempts per 15 minutes per IP
  - Registration: 3 attempts per hour per IP
  - Password reset: 3 attempts per hour per IP
- Account lockout after 5 failed login attempts
- Strong password requirements:
  - Minimum 8 characters
  - At least 1 uppercase, 1 lowercase, 1 digit, 1 special character
- Email verification required before login
- Session management with Redis
- Role-based access control (RBAC):
  - Customer: Can browse, buy, review
  - Admin: Full access to admin panel

### Data Protection
- Input validation and sanitization (Pydantic)
- SQL injection prevention (SQLAlchemy parameterized queries)
- XSS prevention (React auto-escaping + content sanitization)
- CSRF protection (SameSite cookies)
- Secure password reset flow (time-limited tokens)
- Email verification tokens (time-limited)
- Sensitive data encryption at rest:
  - Passwords (bcrypt)
  - Payment information (if stored)
- PCI DSS compliance considerations (when payment gateway integrated)
- GDPR compliance:
  - User consent for data processing
  - Right to access data
  - Right to deletion (account deletion)
  - Data export functionality
  - Cookie consent banner

### API Security
- API rate limiting (per IP + per user):
  - General: 100 requests per minute
  - Search: 20 requests per minute
  - Authenticated: 200 requests per minute
- Request authentication (JWT in Authorization header)
- Request validation (Pydantic schemas)
- Error handling:
  - Generic error messages (no sensitive data leak)
  - Detailed errors only in development
- API versioning (/api/v1/)
- Logging and monitoring:
  - Log all API requests
  - Log authentication attempts
  - Log admin actions
  - Error tracking (Sentry optional)

### Image URL Security
- Validate image URLs (must be HTTPS)
- Check image URL format (valid URL structure)
- Optional: Fetch and validate image headers (content-type, size)
- Optional: Image proxy to prevent external URL exposure
- CSP (Content Security Policy) headers to control image sources

### File Upload Security (Review Images)
- If allowing image URL uploads for reviews:
  - Validate URL format
  - Check content-type
  - Size limits
  - Malware scanning (optional)

---

## Performance Requirements

### Frontend Performance
- Next.js SSR/SSG for fast initial load
- Server-side rendering for SEO
- Static generation for:
  - Homepage
  - Category pages
  - Product pages (ISR - Incremental Static Regeneration)
- Image optimization:
  - Next.js Image component
  - WebP format with fallbacks
  - Lazy loading
  - Responsive images (multiple sizes)
  - External image URLs cached via Next.js
- Code splitting and lazy loading:
  - Route-based code splitting (automatic with Next.js)
  - Component-level lazy loading (React.lazy)
  - Dynamic imports for heavy components
- Bundle size optimization:
  - Tree shaking
  - Remove unused dependencies
  - Compression (gzip/brotli)
- CDN for static assets (future)
- Browser caching strategies:
  - Aggressive caching for static assets
  - Cache busting with file hashes
- Lighthouse score target: >90 (desktop), >80 (mobile)
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s

### Backend Performance
- Database query optimization:
  - Proper indexing strategy (see below)
  - N+1 query prevention (eager loading with SQLAlchemy)
  - Query result pagination
  - Avoid SELECT *
- Connection pooling:
  - PostgreSQL: 20-50 connections
  - Redis: 10 connections
- Redis caching for:
  - Session data
  - Product data (hot products)
  - Category tree
  - Popular searches
  - Cart data (guest users)
- Cache invalidation strategy
- API response caching (Redis):
  - Product listings: 5 minutes
  - Product details: 15 minutes
  - Categories: 1 hour
- Pagination for large datasets:
  - Default: 24 items per page
  - Maximum: 100 items per page
- Async operations for long-running tasks:
  - Email sending (Celery)
  - Order processing (Celery)
  - Stock alert notifications (Celery)
  - Report generation (Celery)
- Response time targets:
  - Product listing: <300ms
  - Product details: <200ms
  - Search: <500ms
  - Add to cart: <100ms
  - Checkout: <500ms per step
  - Admin dashboard: <1s

### Database Performance
- Indexing strategy:
  ```sql
  -- Primary keys (automatic)
  -- Foreign keys (automatic in PostgreSQL)

  -- Additional indexes:
  CREATE INDEX idx_products_category_id ON products(category_id);
  CREATE INDEX idx_products_slug ON products(slug);
  CREATE INDEX idx_products_sku ON products(sku);
  CREATE INDEX idx_products_is_active ON products(is_active);
  CREATE INDEX idx_products_is_featured ON products(is_featured);
  CREATE INDEX idx_products_created_at ON products(created_at);
  CREATE INDEX idx_products_rating_avg ON products(rating_avg);
  CREATE INDEX idx_products_sales_count ON products(sales_count);

  CREATE INDEX idx_categories_parent_id ON categories(parent_id);
  CREATE INDEX idx_categories_slug ON categories(slug);

  CREATE INDEX idx_orders_user_id ON orders(user_id);
  CREATE INDEX idx_orders_order_number ON orders(order_number);
  CREATE INDEX idx_orders_status ON orders(status);
  CREATE INDEX idx_orders_created_at ON orders(created_at);

  CREATE INDEX idx_order_items_order_id ON order_items(order_id);
  CREATE INDEX idx_order_items_product_id ON order_items(product_id);

  CREATE INDEX idx_reviews_product_id ON reviews(product_id);
  CREATE INDEX idx_reviews_user_id ON reviews(user_id);
  CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);

  CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
  CREATE INDEX idx_cart_items_session_id ON cart_items(session_id);

  CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);

  -- Full-text search indexes (PostgreSQL)
  CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || description));
  ```
- Query optimization:
  - Use EXPLAIN ANALYZE
  - Optimize slow queries
  - Avoid subqueries where possible
- Database connection pooling (configured in backend)
- Database backups:
  - Daily automated backups
  - Backup retention: 30 days
  - Backup restoration testing
- Read replicas for scaling (future):
  - Master for writes
  - Replicas for reads (product listings, search)

### Scalability
- Horizontal scaling capability:
  - Stateless API design
  - Session data in Redis (shared across instances)
  - Load balancer ready (Nginx)
- Vertical scaling (initial):
  - Database: 4 GB RAM, 2 CPU
  - Redis: 1 GB RAM
  - Backend: 2 GB RAM, 1-2 CPU
  - Frontend: 1 GB RAM, 1 CPU
- Load balancing (future):
  - Nginx load balancer
  - Multiple backend instances
  - Database connection pooling per instance
- CDN integration for static assets (future)
- Microservices architecture consideration (future):
  - Product service
  - Order service
  - User service
  - Payment service

---

## Testing Strategy

### Unit Testing
- **Backend**: pytest with >80% coverage
  - Test all business logic functions
  - Test data validation schemas (Pydantic)
  - Test utility functions
  - Test authentication/authorization logic
  - Mock external dependencies (database, Redis, email)
- **Frontend**: Jest + React Testing Library
  - Test components in isolation
  - Test hooks
  - Test utility functions
  - Test state management (Zustand)
  - Mock API calls

### Integration Testing
- API endpoint testing with httpx
  - Test all CRUD operations
  - Test authentication flows
  - Test authorization (role-based)
  - Test error handling
- Database integration tests:
  - Test database queries
  - Test transactions
  - Test data integrity
- Redis integration tests
- Email sending tests (using test SMTP server)

### End-to-End Testing
- Cypress or Playwright for E2E tests
- Critical user flows:
  - **Customer flows:**
    - User registration and email verification
    - User login and logout
    - Browse products and categories
    - Search products
    - View product details
    - Add product to cart
    - Update cart quantities
    - Add product to wishlist
    - Checkout process (all 4 steps)
    - Guest checkout
    - Apply coupon code
    - Place order
    - View order history
    - Track order
    - Write product review
    - Ask product question
  - **Admin flows:**
    - Admin login
    - Add new product with images and variants
    - Edit product
    - Update product stock
    - Create category
    - View and manage orders
    - Update order status and add tracking
    - Approve pending reviews
    - Create coupon
    - View dashboard analytics
- Mobile responsiveness testing
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Load Testing
- Apache JMeter or Locust
- Test scenarios:
  - Concurrent users: 100-1000
  - Homepage load
  - Product listing page load
  - Product detail page load
  - Search queries
  - Add to cart
  - Checkout process
- API endpoint load testing:
  - Measure response times under load
  - Identify bottlenecks
- Database performance under load
- Target: 500 concurrent users with <500ms avg response time

### Performance Testing
- Lighthouse CI integration
- Page speed testing (PageSpeed Insights)
- Core Web Vitals monitoring:
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)

---

## Deployment Strategy

### Development Workflow

**Three-Phase Development Approach:**

1. **Phase 1 (Local Terminal Development)**: Develop and test locally using terminal commands (NO Docker)
2. **Phase 2 (Local Docker Testing)**: After terminal testing validates, test with Docker locally
3. **Phase 3 (Production Deployment)**: Deploy to EC2 using Docker

---

### Phase 1: Local Terminal Development (NO Docker)

**Purpose**: Fast development iteration with direct terminal access, no container overhead

#### Prerequisites
```bash
# Install Python 3.12
pyenv install 3.12.8
pyenv local 3.12.8

# Install Node.js 20+
# (via nvm, brew, or direct download)
node --version  # Should be 20.x or higher

# Install PostgreSQL 15
# macOS: brew install postgresql@15
# Ubuntu: sudo apt install postgresql-15
brew install postgresql@15
brew services start postgresql@15

# Install Redis 7
# macOS: brew install redis
# Ubuntu: sudo apt install redis-server
brew install redis
brew services start redis

# Install Poetry (Python package manager)
curl -sSL https://install.python-poetry.org | python3 -
```

#### Backend Setup (Terminal)
```bash
cd backend

# Create virtual environment with Poetry
poetry install

# Create .env.dev file
cat > .env.dev << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce_dev
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=dev-secret-key-change-in-production
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
EOF

# Create database
createdb ecommerce_dev

# Run migrations
poetry run alembic upgrade head

# Load demo data
poetry run python scripts/seed_data.py

# Start backend (with hot reload)
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend runs at**: `http://localhost:8000`
**API docs**: `http://localhost:8000/docs`

#### Frontend Setup (Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NODE_ENV=development
EOF

# Start frontend (with hot reload)
npm run dev
```

**Frontend runs at**: `http://localhost:3000`

#### Terminal Commands - Phase 1
```bash
# Backend (from backend/ directory)
poetry run uvicorn app.main:app --reload           # Start backend with hot reload
poetry run python scripts/seed_data.py             # Load demo data
poetry run alembic upgrade head                    # Run migrations
poetry run alembic revision --autogenerate -m "msg" # Create migration
poetry run pytest                                  # Run tests
poetry run mypy .                                  # Type checking
poetry run ruff check .                            # Linting

# Frontend (from frontend/ directory)
npm run dev                                         # Start frontend
npm run build                                       # Production build
npm run type-check                                  # TypeScript check
npm run lint                                        # ESLint check
npm test                                            # Run tests

# Database (from anywhere)
psql ecommerce_dev                                  # PostgreSQL shell
redis-cli                                           # Redis CLI

# Celery (optional for background tasks)
cd backend
poetry run celery -A app.celery_app worker --loglevel=info
```

#### Demo Data Script

**File**: `backend/scripts/seed_data.py`

This script populates the database with realistic demo data:
- 1 Admin user + 5 Customer users
- 10-15 categories (hierarchical)
- 50-100 products with image URLs
- 20-30 products with variants (size/color)
- 100-200 reviews
- 20-30 orders
- 5-10 coupons

**Run**:
```bash
cd backend
poetry run python scripts/seed_data.py
```

**Features**:
- Idempotent (can run multiple times safely)
- Uses Faker for realistic data
- Product image URLs (Unsplash, placeholder.com)
- All users pre-verified for easy testing

---

### Phase 2: Local Docker Testing

**Purpose**: Validate Docker configuration before production deployment

#### Prerequisites
```bash
# Install Docker Desktop (includes Docker Compose)
# macOS: https://docs.docker.com/desktop/install/mac-install/
# Linux: https://docs.docker.com/engine/install/

docker --version
docker-compose --version
```

#### docker-compose.dev.yml Configuration

**6 Containers**:
1. **PostgreSQL** (database)
2. **Redis** (caching & sessions)
3. **Backend** (FastAPI)
4. **Frontend** (Next.js)
5. **Nginx** (reverse proxy)
6. **Celery Worker** (background tasks)

#### Docker Development Features
- **Hot reload** via volume mounts:
  - Frontend: `./frontend:/app` (Next.js fast refresh)
  - Backend: `./backend:/app` (Uvicorn reload)
- **Debug mode enabled** with detailed error messages
- **Exposed ports** for debugging:
  - Frontend: http://localhost:3000
  - Backend API: http://localhost:8000
  - PostgreSQL: localhost:5432
  - Redis: localhost:6379
  - Nginx: http://localhost (port 80)
- **Development database** with demo data

#### Terminal Commands - Phase 2 (Docker)
```bash
# Start all containers
docker-compose -f docker-compose.dev.yml up

# Start in detached mode (background)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Rebuild containers after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# Run database migrations
docker-compose -f docker-compose.dev.yml exec backend alembic upgrade head

# Load demo data (seed database)
docker-compose -f docker-compose.dev.yml exec backend python scripts/seed_data.py

# Access PostgreSQL shell
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d ecommerce_dev

# Access Redis CLI
docker-compose -f docker-compose.dev.yml exec redis redis-cli

# Run tests
docker-compose -f docker-compose.dev.yml exec backend pytest
docker-compose -f docker-compose.dev.yml exec frontend npm test

# Shell access to containers
docker-compose -f docker-compose.dev.yml exec backend bash
docker-compose -f docker-compose.dev.yml exec frontend sh

# Check container health
docker-compose -f docker-compose.dev.yml ps
```

#### Mock Data / Seed Data Requirements
All mock data loaded via `scripts/seed_data.py` script:

**Users & Accounts:**
- 1 Admin user (admin@example.com / admin123)
- 5 Customer users (customer1@example.com - customer5@example.com / password123)
- All users pre-verified (no email verification required in dev)

**Categories:**
- 10-15 categories with hierarchical structure
- Example: Electronics → Laptops, Smartphones, Tablets
- Example: Home & Garden → Furniture, Decor, Tools
- Category images: URLs to placeholder images or site-travel images

**Products:**
- 50-100 products across all categories
- Mix of products with and without variants
- **Product images**: URLs only (no file uploads)
  - Use placeholder image services (e.g., placeholder.com, unsplash.com)
  - Or reference site-travel image URLs: `https://example.com/products/laptop.jpg`
  - Example: `https://images.unsplash.com/photo-1234567890/featured?w=800`
  - Multiple images per product (3-5 images)
- Product specifications as JSONB
- Realistic pricing in EUR (€9.99 - €1999.99)
- Stock quantities (0-100 per product/variant)
- Some products marked as featured
- Some products marked as deal of the day

**Product Variants:**
- 20-30 products with variants
- Size variants: S, M, L, XL
- Color variants: Red, Blue, Black, White
- Each variant with unique SKU and stock

**Reviews:**
- 100-200 product reviews
- Mix of ratings (1-5 stars)
- Some with review images (URLs)
- Mix of verified and unverified purchases
- Some approved, some pending approval

**Orders:**
- 20-30 completed orders
- Mix of order statuses (pending, confirmed, shipped, delivered)
- Orders linked to customer users
- Realistic order totals with tax and shipping

**Coupons:**
- 5-10 active coupons
- Mix of discount types (percentage, fixed amount, free shipping)
- Example codes: WELCOME10, SUMMER20, FREESHIP

**Product Images Reference:**
```python
# Example image URLs in seed data (site-travel style):
image_urls = [
    "https://images.unsplash.com/photo-1234567890/laptop?w=800&q=80",
    "https://images.unsplash.com/photo-0987654321/smartphone?w=800&q=80",
    "https://placeholder.com/800x600?text=Product+Image",
    # Or reference actual CDN URLs
    "https://cdn.example.com/products/img-001.jpg"
]
```

---

### Phase 3: Production Environment (AWS EC2 Docker Deployment)

**Purpose**: Deploy all services to EC2 using Docker for production environment

#### EC2 Instance Setup

**Instance Configuration:**
- **Instance Type**: t3.medium or t3.large (2-4 vCPU, 4-8GB RAM minimum)
- **OS**: Ubuntu 22.04 LTS or Amazon Linux 2023
- **Storage**: 50GB+ EBS volume (gp3 for better performance)
- **Security Group**: Custom security group with specific ports

**Security Group Rules:**
```
Inbound:
- Port 80 (HTTP) - 0.0.0.0/0 (redirect to HTTPS)
- Port 443 (HTTPS) - 0.0.0.0/0
- Port 22 (SSH) - Your IP only (for administration)

Outbound:
- All traffic (default)
```

**Elastic IP:**
- Allocate and associate an Elastic IP for stable DNS configuration
- Point your domain DNS A record to this Elastic IP

#### Docker Deployment on EC2

**Prerequisites (Install on EC2):**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

**Production Docker Compose Configuration (docker-compose.prod.yml):**

All 6 services containerized on EC2:

1. **Nginx** (Reverse Proxy, Static Files, SSL Termination)
2. **Frontend** (Next.js application)
3. **Backend** (FastAPI application)
4. **PostgreSQL** (Database)
5. **Redis** (Cache, Session Store, Celery Broker)
6. **Celery Worker** (Background Task Processing)

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:1.25-alpine
    container_name: ecommerce-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - frontend-static:/usr/share/nginx/html/static
    depends_on:
      - frontend
      - backend
    restart: always
    networks:
      - ecommerce-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: ecommerce-frontend
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://yourdomain.com/api
    restart: always
    networks:
      - ecommerce-network
    volumes:
      - frontend-static:/app/.next/static

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: ecommerce-backend
    environment:
      - DATABASE_URL=postgresql://ecommerce_user:secure_password@postgres:5432/ecommerce_db
      - REDIS_URL=redis://redis:6379/0
      - JWT_SECRET=${JWT_SECRET}
      - ENVIRONMENT=production
      - CORS_ORIGINS=https://yourdomain.com
    depends_on:
      - postgres
      - redis
    restart: always
    networks:
      - ecommerce-network
    volumes:
      - ./backend/logs:/app/logs

  postgres:
    image: postgres:15-alpine
    container_name: ecommerce-postgres
    environment:
      - POSTGRES_USER=ecommerce_user
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=ecommerce_db
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: always
    networks:
      - ecommerce-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ecommerce_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ecommerce-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    restart: always
    networks:
      - ecommerce-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  celery-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: ecommerce-celery
    command: celery -A app.celery_app worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://ecommerce_user:secure_password@postgres:5432/ecommerce_db
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - CELERY_RESULT_BACKEND=redis://redis:6379/2
    depends_on:
      - postgres
      - redis
    restart: always
    networks:
      - ecommerce-network

networks:
  ecommerce-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  frontend-static:
```

#### Environment Variables on EC2

**Create .env.production file:**
```bash
# Database
DATABASE_URL=postgresql://ecommerce_user:STRONG_PASSWORD_HERE@postgres:5432/ecommerce_db
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
POSTGRES_DB=ecommerce_db

# Redis
REDIS_URL=redis://:REDIS_PASSWORD_HERE@redis:6379/0
REDIS_PASSWORD=REDIS_PASSWORD_HERE

# JWT
JWT_SECRET=VERY_LONG_RANDOM_SECRET_HERE_AT_LEAST_64_CHARS
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Backend
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
API_V1_PREFIX=/api/v1

# Email (SendGrid, AWS SES, or similar)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=YOUR_SENDGRID_API_KEY
EMAIL_FROM=noreply@yourdomain.com

# Celery
CELERY_BROKER_URL=redis://:REDIS_PASSWORD_HERE@redis:6379/1
CELERY_RESULT_BACKEND=redis://:REDIS_PASSWORD_HERE@redis:6379/2

# Frontend
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NODE_ENV=production
```

**Secure .env file:**
```bash
chmod 600 .env.production
```

#### SSL/TLS Certificate Setup (Let's Encrypt)

**Install Certbot on EC2:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

**Obtain SSL Certificate:**
```bash
# Stop Nginx container temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Copy certificates to nginx/ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/

# Start Nginx container
docker-compose -f docker-compose.prod.yml start nginx
```

**Auto-renewal (cron job):**
```bash
# Add to crontab
sudo crontab -e

# Add this line (renew every 2 months at 2am)
0 2 1 */2 * certbot renew --quiet && docker-compose -f /home/ubuntu/app/docker-compose.prod.yml restart nginx
```

#### Deployment Commands on EC2

**Initial Deployment:**
```bash
# Clone repository
git clone https://github.com/yourusername/ecommerce-platform.git
cd ecommerce-platform

# Create .env.production file
nano .env.production
# (paste production environment variables)

# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Create admin user (optional)
docker-compose -f docker-compose.prod.yml exec backend python scripts/create_admin.py

# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Update Deployment (Zero-Downtime):**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart containers (rolling update)
docker-compose -f docker-compose.prod.yml up -d --build --no-deps --force-recreate backend
docker-compose -f docker-compose.prod.yml up -d --build --no-deps --force-recreate frontend

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Restart Nginx to pick up changes
docker-compose -f docker-compose.prod.yml restart nginx
```

**Rollback:**
```bash
# Rollback to previous git commit
git log --oneline  # Find previous commit hash
git checkout <previous-commit-hash>

# Rebuild containers
docker-compose -f docker-compose.prod.yml up -d --build

# Rollback database migration (if needed)
docker-compose -f docker-compose.prod.yml exec backend alembic downgrade -1
```

#### Database Backups on EC2

**Automated Daily Backup Script:**
```bash
# Create backup script
nano /home/ubuntu/backup-db.sh
```

```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/home/ubuntu/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ecommerce_backup_$DATE.sql"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Dump database
docker exec ecommerce-postgres pg_dump -U ecommerce_user ecommerce_db > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

**Make executable and add to crontab:**
```bash
chmod +x /home/ubuntu/backup-db.sh

# Add to crontab (daily at 3am)
crontab -e
0 3 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backup.log 2>&1
```

**Restore from Backup:**
```bash
# List backups
ls -lh /home/ubuntu/app/backups/

# Restore specific backup
gunzip /home/ubuntu/app/backups/ecommerce_backup_20240115_030000.sql.gz
docker exec -i ecommerce-postgres psql -U ecommerce_user -d ecommerce_db < /home/ubuntu/app/backups/ecommerce_backup_20240115_030000.sql
```

#### Monitoring and Maintenance

**Health Check Endpoints:**
- Backend: `https://yourdomain.com/api/health`
- Database: Check via backend endpoint or direct psql connection

**Container Health Monitoring:**
```bash
# Check all container statuses
docker-compose -f docker-compose.prod.yml ps

# View resource usage
docker stats

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=100 -f backend
docker-compose -f docker-compose.prod.yml logs --tail=100 -f frontend
```

**Disk Space Management:**
```bash
# Check disk space
df -h

# Clean up Docker
docker system prune -a --volumes  # WARNING: Removes unused images/volumes

# View Docker disk usage
docker system df
```

**Log Rotation:**
```bash
# Configure Docker log rotation in /etc/docker/daemon.json
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
# Restart Docker daemon
sudo systemctl restart docker
```

#### Security Hardening

**1. Firewall (UFW):**
```bash
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw status
```

**2. Fail2Ban (SSH Protection):**
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

**3. Regular Security Updates:**
```bash
# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

**4. Docker Security:**
- Run containers as non-root users
- Use read-only volumes where possible
- Scan images for vulnerabilities: `docker scan <image>`
- Keep Docker and base images updated

**5. Database Security:**
- Strong passwords in .env.production
- PostgreSQL only accessible from backend container (not exposed to host)
- Regular backups tested for restore capability

### Deployment Workflow (CI/CD)
1. **Code commit** to feature branch
2. **Automated tests run** (GitHub Actions, GitLab CI, CircleCI):
   - Linting (ESLint, Flake8, Black)
   - Type checking (TypeScript, mypy)
   - Unit tests
   - Integration tests
3. **Code review** and merge to develop branch
4. **Deploy to staging** environment:
   - Build Docker images
   - Push to container registry
   - Deploy to staging server
   - Run smoke tests
5. **Staging tests and QA**:
   - Manual testing
   - E2E tests
   - Performance testing
6. **Merge to main/production** branch
7. **Automated deployment to production**:
   - Build production Docker images
   - Push to container registry
   - Deploy to production server (blue-green or rolling deployment)
   - Health checks
8. **Post-deployment smoke tests**
9. **Rollback capability** if issues detected:
   - Keep previous Docker images
   - Database migration rollback scripts

### Docker Configuration
- **Dockerfile** (multi-stage builds):
  - Stage 1: Dependencies installation
  - Stage 2: Build (frontend compile, backend setup)
  - Stage 3: Production runtime (minimal image)
- **docker-compose.yml** (production):
  - 5 containers: Nginx, Frontend, Backend, PostgreSQL, Redis
  - Container health checks
  - Resource limits (CPU, memory)
  - Restart policies
  - Networks (isolated backend network)
  - Volumes (persistent data for PostgreSQL, Redis)
- **docker-compose.dev.yml** (development):
  - Volume mounts for live code changes
  - Exposed ports for debugging
  - Development-specific environment variables

---

## Documentation Requirements

### API Documentation
- **OpenAPI/Swagger** documentation (FastAPI auto-generates)
- Interactive API documentation at /docs (Swagger UI)
- Alternative API documentation at /redoc (ReDoc)
- Request/response examples for all endpoints
- Authentication instructions
- Error code documentation:
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (missing/invalid token)
  - 403: Forbidden (insufficient permissions)
  - 404: Not Found
  - 409: Conflict (duplicate entry)
  - 422: Unprocessable Entity (validation errors)
  - 429: Too Many Requests (rate limit exceeded)
  - 500: Internal Server Error
- API versioning documentation
- Postman collection (optional)

### User Documentation
- **Customer guide**:
  - How to create an account
  - How to browse and search products
  - How to place an order
  - How to track an order
  - How to return a product
  - How to write a review
  - FAQ section
- **Admin manual**:
  - How to add products
  - How to manage orders
  - How to configure shipping
  - How to create coupons
  - How to moderate reviews
  - How to view analytics
- **Help center** (integrated in website)
- **Video tutorials** (optional - future)

### Developer Documentation
- **Setup and installation guide**:
  - Prerequisites (Docker, Node.js, Python)
  - Clone repository
  - Environment setup (.env configuration)
  - Database setup and migrations
  - Run development server
  - Run tests
- **Architecture documentation**:
  - System architecture diagram
  - Database schema diagram
  - API architecture
  - Frontend structure
  - State management flow
- **Database schema documentation**:
  - Entity-relationship diagram (ERD)
  - Table descriptions
  - Relationships
  - Indexes
- **API integration guide**:
  - Authentication flow
  - Common use cases
  - Error handling
  - Rate limiting
- **Contribution guidelines**:
  - Code style guide (ESLint, Prettier, Black)
  - Git workflow (feature branches, pull requests)
  - Commit message conventions
  - Testing requirements
  - Pull request template
- **Deployment guide**:
  - Environment configuration
  - Docker deployment
  - Database migration
  - Rollback procedures

---

## Success Metrics (KPIs)

### Business Metrics
- **Revenue**: Total sales revenue (daily, weekly, monthly, yearly)
- **Orders**: Number of orders placed
- **Average Order Value (AOV)**: Total revenue / number of orders
- **Conversion Rate**: (Orders / Visitors) × 100%
- **Customer Acquisition Cost (CAC)**: Marketing spend / new customers
- **Customer Lifetime Value (CLV)**: Average revenue per customer over lifetime
- **Repeat Customer Rate**: (Repeat customers / total customers) × 100%
- **Cart Abandonment Rate**: (Abandoned carts / total carts) × 100%
- **Product Return Rate**: (Returns / orders) × 100%

### Technical Metrics
- **API Response Time**: Average and p95 response times per endpoint
- **Page Load Time**: Average page load time for key pages
- **Uptime Percentage**: Target 99.9% uptime (8.76 hours downtime per year)
- **Error Rate**: (Errors / total requests) × 100% - target <0.1%
- **Database Query Performance**: Average query execution time
- **CDN Cache Hit Rate**: (Cache hits / total requests) × 100%

### User Experience Metrics
- **Bounce Rate**: Percentage of visitors who leave after viewing one page
- **Time on Site**: Average session duration
- **Pages per Session**: Average pages viewed per visit
- **Search Success Rate**: (Searches with results / total searches) × 100%
- **Checkout Completion Rate**: (Completed checkouts / started checkouts) × 100%
- **Customer Satisfaction Score (CSAT)**: Survey-based satisfaction rating
- **Net Promoter Score (NPS)**: Willingness to recommend (0-10 scale)
- **Review Submission Rate**: (Reviews / orders) × 100%

### Inventory & Product Metrics
- **Stock Accuracy**: Inventory accuracy percentage
- **Stock Turnover Rate**: Cost of goods sold / average inventory value
- **Products Out of Stock**: Number and percentage of OOS products
- **Best Selling Products**: Top 10 products by sales volume
- **Slow-Moving Products**: Products with low sales in last 90 days

---

## Timeline Summary

**Total Duration**: ~8 months (32 weeks) for full implementation

- **Phase 1 (Weeks 1-8)**: Foundation & Internationalization
  - Multi-language UI (FI/SE/EN)
  - User authentication (email/password)
  - User profiles and addresses

- **Phase 2 (Weeks 9-14)**: Product Catalog & Discovery
  - Category management
  - Product CRUD (admin)
  - Product images/videos (URLs)
  - Product variants
  - Advanced search and filters
  - Product page features

- **Phase 3 (Weeks 15-18)**: Shopping Experience
  - Shopping cart
  - Wishlist
  - Saved for later
  - Bulk pricing
  - Multi-step checkout

- **Phase 4 (Weeks 19-22)**: Orders & Payment
  - Order management
  - Manual payment processing (initial)
  - Order fulfillment (admin)

- **Phase 5 (Weeks 23-24)**: Reviews & Q&A
  - Product reviews with moderation
  - Product Q&A

- **Phase 6 (Weeks 25-26)**: Shipping & Delivery
  - Shipping configuration
  - Shipping calculation
  - Order tracking (manual)

- **Phase 7 (Weeks 27-30)**: Advanced Features
  - Coupons & promotions
  - Deal of the day
  - Product recommendations
  - Stock alerts
  - Email notifications
  - Search improvements

- **Phase 8 (Weeks 31-32)**: Admin & Analytics
  - Admin dashboard
  - User management
  - Order management
  - Product management
  - Review moderation
  - Analytics & reports
  - Platform settings

**Phase 9 (Post-Launch)**: Optional Enhancements
- PWA implementation
- Payment gateway integration (Stripe, PayPal)
- Advanced recommendations (ML-powered)
- Loyalty program
- AI features
- B2B features

---

## Budget Considerations

### Infrastructure Costs (Monthly Estimates - Europe Region)

**Small Scale (Launch - 0-10k visitors/month):**
- Cloud hosting (DigitalOcean/Hetzner): €40-80
- Database (Managed PostgreSQL): €25-50
- Redis (Managed): €15-30
- Domain + SSL: €2-5 (Let's Encrypt SSL is free)
- Email service (Resend): €0-20 (free tier, then €20/month)
- CDN (Cloudflare): €0-20 (free tier available)
- Backups: €5-10
- **Total: €87-215/month**

**Medium Scale (10k-100k visitors/month):**
- Cloud hosting: €100-200
- Database: €80-150
- Redis: €40-80
- Email service: €50-100
- CDN: €20-50
- Monitoring (Sentry): €0-50 (developer plan)
- **Total: €290-630/month**

**Large Scale (100k+ visitors/month):**
- Cloud hosting: €300-1000+
- Database (with replicas): €200-500
- Redis: €100-200
- Email service: €100-300
- CDN: €100-200
- Monitoring: €100-200
- **Total: €900-2,400/month**

**Payment Processing (when integrated):**
- Stripe: 1.4% + €0.25 per transaction (EU cards)
- PayPal: 2.49% + €0.35 per transaction
- (Percentage-based, scales with revenue)

### Development Resources (if outsourcing)
- 2 Full-stack developers (Frontend + Backend)
- 1 UI/UX designer (part-time)
- 1 DevOps engineer (part-time)
- 1 QA engineer (part-time)
- 1 Project manager (optional)

---

## Conclusion

This comprehensive requirements document outlines a **single-vendor e-commerce store** inspired by Verkkokauppa.com's operational excellence, with best practices from Amazon's discovery features, AliExpress's product presentation, and Motonet's value-focused approach.

### Key Highlights:

1. **Pure Online Store**: No physical locations, no store pickup, no lockers - streamlined online shopping only.

2. **Europe-Wide**: Multi-language UI (Finnish, Swedish, English) supporting customers across Europe with EUR currency.

3. **Simplified Architecture**: Single-vendor model with just Admin and Customer roles - no complex marketplace features.

4. **Real-Time Transparency**: Verkkokauppa-inspired inventory visibility and customer reviews.

5. **Advanced Discovery**: Amazon-inspired search, filters, and recommendations.

6. **Flexible Start**: Manual payment processing initially, with payment gateway integration deferred to Phase 2.

7. **Scalable Foundation**: Modern tech stack (Next.js, FastAPI, PostgreSQL, Redis, Docker) ready to scale from small to large traffic.

8. **No File Uploads**: Simplified image handling with URL storage only (no S3, no file uploads).

The phased approach allows for iterative development and early validation, with core features delivered in 8 months and optional enhancements added progressively. The platform provides a robust foundation for a successful European e-commerce business.
