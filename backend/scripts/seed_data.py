"""Seed database with demo data."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from faker import Faker
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.coupon import Coupon, DiscountType
from app.models.product import Product, ProductImage, ProductReview, ProductVariant
from app.models.user import User, UserRole

fake = Faker()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def create_users(db: Session) -> None:
    """Create demo users."""
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        db.add(User(
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
            first_name="Admin",
            last_name="User",
            is_active=True,
            is_verified=True,
            preferred_language="en",
        ))
        print("✓ Created admin user: admin@example.com / admin123")

    for i in range(1, 6):
        email = f"customer{i}@example.com"
        if not db.query(User).filter(User.email == email).first():
            db.add(User(
                email=email,
                password_hash=hash_password("password123"),
                role=UserRole.CUSTOMER,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                phone=fake.phone_number()[:20],
                is_active=True,
                is_verified=True,
                preferred_language="fi",
            ))
            print(f"✓ Created customer user: {email} / password123")

    db.commit()


def create_categories(db: Session) -> dict[str, int]:
    """Create product categories (24 categories)."""
    category_data = [
        # Top-level categories
        {"name": "Electronics", "slug": "electronics", "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400"},
        {"name": "Home & Garden", "slug": "home-garden", "image_url": "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400"},
        {"name": "Clothing & Fashion", "slug": "clothing-fashion", "image_url": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400"},
        {"name": "Sports & Outdoors", "slug": "sports-outdoors", "image_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400"},
        {"name": "Books & Media", "slug": "books-media", "image_url": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400"},
        {"name": "Health & Beauty", "slug": "health-beauty", "image_url": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400"},
        {"name": "Toys & Games", "slug": "toys-games", "image_url": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400"},
        {"name": "Automotive", "slug": "automotive", "image_url": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400"},
        # Subcategories - Electronics
        {"name": "Computers & Laptops", "slug": "computers-laptops", "parent": "Electronics", "image_url": "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"},
        {"name": "Smartphones", "slug": "smartphones", "parent": "Electronics", "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"},
        {"name": "Audio & Headphones", "slug": "audio-headphones", "parent": "Electronics", "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"},
        {"name": "Cameras & Photography", "slug": "cameras-photography", "parent": "Electronics", "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400"},
        {"name": "Gaming", "slug": "gaming", "parent": "Electronics", "image_url": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400"},
        # Subcategories - Home & Garden
        {"name": "Furniture", "slug": "furniture", "parent": "Home & Garden", "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"},
        {"name": "Kitchen & Dining", "slug": "kitchen-dining", "parent": "Home & Garden", "image_url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"},
        {"name": "Lighting", "slug": "lighting", "parent": "Home & Garden", "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400"},
        # Subcategories - Clothing
        {"name": "Men's Clothing", "slug": "mens-clothing", "parent": "Clothing & Fashion", "image_url": "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400"},
        {"name": "Women's Clothing", "slug": "womens-clothing", "parent": "Clothing & Fashion", "image_url": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400"},
        {"name": "Shoes & Footwear", "slug": "shoes-footwear", "parent": "Clothing & Fashion", "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"},
        # Subcategories - Sports
        {"name": "Fitness Equipment", "slug": "fitness-equipment", "parent": "Sports & Outdoors", "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"},
        {"name": "Outdoor Gear", "slug": "outdoor-gear", "parent": "Sports & Outdoors", "image_url": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400"},
        # Subcategories - Books
        {"name": "Fiction", "slug": "fiction", "parent": "Books & Media", "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"},
        {"name": "Non-Fiction & Tech", "slug": "non-fiction-tech", "parent": "Books & Media", "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400"},
        # Subcategories - Health
        {"name": "Skincare", "slug": "skincare", "parent": "Health & Beauty", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400"},
    ]

    category_map = {}
    existing_count = db.query(Category).count()
    if existing_count > 0:
        print(f"✓ Categories already exist ({existing_count})")
        for cat in db.query(Category).all():
            category_map[cat.name] = cat.id
        return category_map

    for idx, cat_info in enumerate(category_data):
        parent_id = category_map.get(cat_info.get("parent")) if "parent" in cat_info else None
        category = Category(
            name=cat_info["name"],
            slug=cat_info["slug"],
            image_url=cat_info["image_url"],
            parent_id=parent_id,
            display_order=idx,
            is_active=True,
        )
        db.add(category)
        db.flush()
        category_map[cat_info["name"]] = category.id

    db.commit()
    print(f"✓ Created {len(category_data)} categories")
    return category_map


def create_products(db: Session, category_map: dict[str, int]) -> None:
    """Create demo products with images (24 products)."""
    products_data = [
        # --- Computers & Laptops ---
        {"name": "MacBook Pro 16-inch M3", "slug": "macbook-pro-16-m3", "sku": "MBP-16-M3-001", "category": "Computers & Laptops",
         "description": "Powerful laptop with M3 chip, perfect for developers and creators. Stunning Retina display and all-day battery life.",
         "short_description": "16-inch laptop with M3 chip, 16GB RAM", "price": Decimal("2499.00"), "compare_at_price": Decimal("2799.00"),
         "stock": 15, "is_featured": True, "brand": "Apple",
         "specifications": {"Processor": "Apple M3", "RAM": "16GB", "Storage": "512GB SSD", "Display": "16-inch Retina"},
         "images": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"]},
        {"name": "Dell XPS 15", "slug": "dell-xps-15", "sku": "DELL-XPS15-001", "category": "Computers & Laptops",
         "description": "Ultra-thin Windows laptop with InfinityEdge display, Intel Core i7, and dedicated NVIDIA graphics.",
         "short_description": "15.6-inch premium Windows ultrabook", "price": Decimal("1899.00"), "stock": 20, "brand": "Dell",
         "specifications": {"Processor": "Intel Core i7-13700H", "RAM": "16GB", "Storage": "512GB SSD", "Display": "15.6-inch 3.5K OLED"},
         "images": ["https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?w=800"]},
        {"name": "Logitech MX Master 3S Mouse", "slug": "logitech-mx-master-3s", "sku": "LOGI-MXM3S-001", "category": "Computers & Laptops",
         "description": "Advanced wireless mouse with MagSpeed scroll, ergonomic design, and multi-device support.",
         "short_description": "Premium ergonomic wireless mouse", "price": Decimal("99.00"), "compare_at_price": Decimal("119.00"),
         "stock": 60, "is_deal": True, "brand": "Logitech",
         "specifications": {"Connectivity": "Bluetooth + USB-C", "Battery": "70 days", "DPI": "8000", "Buttons": "7"},
         "images": ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]},
        # --- Smartphones ---
        {"name": "iPhone 15 Pro", "slug": "iphone-15-pro", "sku": "IP15P-001", "category": "Smartphones",
         "description": "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system with 48MP main sensor.",
         "short_description": "6.1-inch smartphone with A17 Pro chip", "price": Decimal("1199.00"), "stock": 25, "is_deal": True, "brand": "Apple",
         "specifications": {"Processor": "A17 Pro", "Storage": "256GB", "Display": "6.1-inch OLED", "Camera": "48MP Main"},
         "images": ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"]},
        {"name": "Samsung Galaxy S24 Ultra", "slug": "samsung-galaxy-s24-ultra", "sku": "SGS24U-001", "category": "Smartphones",
         "description": "Premium Android smartphone with S Pen, 200MP camera, titanium frame, and Galaxy AI features.",
         "short_description": "6.8-inch Android flagship with S Pen", "price": Decimal("1299.00"), "compare_at_price": Decimal("1399.00"),
         "stock": 20, "is_featured": True, "brand": "Samsung",
         "specifications": {"Processor": "Snapdragon 8 Gen 3", "RAM": "12GB", "Storage": "512GB", "Display": "6.8-inch AMOLED"},
         "images": ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800"]},
        {"name": "Google Pixel 8 Pro", "slug": "google-pixel-8-pro", "sku": "GP8P-001", "category": "Smartphones",
         "description": "Google's flagship with Tensor G3 chip, best-in-class camera AI, and 7 years of updates.",
         "short_description": "6.7-inch Google flagship with AI camera", "price": Decimal("999.00"), "stock": 18, "brand": "Google",
         "specifications": {"Processor": "Tensor G3", "RAM": "12GB", "Storage": "256GB", "Camera": "50MP Main + 48MP Ultra-wide"},
         "images": ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"]},
        # --- Audio & Headphones ---
        {"name": "Sony WH-1000XM5 Headphones", "slug": "sony-wh1000xm5", "sku": "SONY-WH1000XM5", "category": "Audio & Headphones",
         "description": "Industry-leading noise canceling headphones with exceptional sound quality and 30-hour battery.",
         "short_description": "Premium wireless noise-canceling headphones", "price": Decimal("379.00"), "stock": 30, "brand": "Sony",
         "specifications": {"Type": "Over-ear", "Battery": "30 hours", "Connectivity": "Bluetooth 5.2", "ANC": "Yes"},
         "images": ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"]},
        {"name": "AirPods Pro 2nd Gen", "slug": "airpods-pro-2", "sku": "APP2-001", "category": "Audio & Headphones",
         "description": "Apple's premium earbuds with adaptive noise cancellation, spatial audio, and USB-C charging case.",
         "short_description": "True wireless earbuds with ANC", "price": Decimal("279.00"), "stock": 45, "is_featured": True, "brand": "Apple",
         "specifications": {"Type": "In-ear", "Battery": "6h (30h with case)", "ANC": "Adaptive", "Charging": "USB-C + MagSafe"},
         "images": ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800"]},
        # --- Cameras ---
        {"name": "Sony Alpha A7 IV", "slug": "sony-alpha-a7iv", "sku": "SONY-A7IV-001", "category": "Cameras & Photography",
         "description": "Full-frame mirrorless camera with 33MP sensor, advanced autofocus, and 4K 60p video recording.",
         "short_description": "33MP full-frame mirrorless camera", "price": Decimal("2499.00"), "stock": 8, "brand": "Sony",
         "specifications": {"Sensor": "33MP Full-frame", "Video": "4K 60fps", "ISO": "100-51200", "Stabilization": "5-axis IBIS"},
         "images": ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"]},
        # --- Gaming ---
        {"name": "PlayStation 5 Console", "slug": "playstation-5", "sku": "PS5-001", "category": "Gaming",
         "description": "Next-gen gaming console with ultra-fast SSD, ray tracing, and DualSense controller.",
         "short_description": "Next-gen gaming console", "price": Decimal("499.00"), "stock": 10, "is_featured": True, "brand": "Sony",
         "specifications": {"Storage": "825GB SSD", "Resolution": "Up to 4K 120fps", "Disc": "Blu-ray", "Controller": "DualSense"},
         "images": ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800"]},
        {"name": "Nintendo Switch OLED", "slug": "nintendo-switch-oled", "sku": "NSW-OLED-001", "category": "Gaming",
         "description": "Hybrid gaming console with vibrant 7-inch OLED screen, enhanced audio, and wide adjustable stand.",
         "short_description": "Hybrid console with 7-inch OLED display", "price": Decimal("349.00"), "stock": 22, "brand": "Nintendo",
         "specifications": {"Display": "7-inch OLED", "Storage": "64GB", "Battery": "4.5-9 hours", "Modes": "TV, Tabletop, Handheld"},
         "images": ["https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800"]},
        # --- Furniture ---
        {"name": "Ergonomic Office Chair", "slug": "ergonomic-office-chair", "sku": "CHAIR-ERG-001", "category": "Furniture",
         "description": "Comfortable office chair with lumbar support, adjustable height, and breathable mesh back.",
         "short_description": "Adjustable ergonomic desk chair", "price": Decimal("299.00"), "compare_at_price": Decimal("399.00"),
         "stock": 12, "is_deal": True, "brand": "Flexispot",
         "specifications": {"Material": "Mesh back, fabric seat", "Adjustable": "Height, armrests", "Weight capacity": "120kg"},
         "images": ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800"]},
        {"name": "Modern Sofa 3-Seater", "slug": "modern-sofa-3-seater", "sku": "SOFA-3S-001", "category": "Furniture",
         "description": "Stylish and comfortable 3-seater sofa in Scandinavian design, perfect for any living room.",
         "short_description": "Contemporary 3-seater fabric sofa", "price": Decimal("899.00"), "stock": 8,
         "specifications": {"Seats": "3", "Material": "Fabric", "Color": "Gray", "Dimensions": "220x90x85cm"},
         "images": ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"]},
        {"name": "Standing Desk Adjustable", "slug": "standing-desk-adjustable", "sku": "DESK-STD-001", "category": "Furniture",
         "description": "Electric height-adjustable standing desk with memory presets and cable management.",
         "short_description": "Electric sit-stand desk 140x70cm", "price": Decimal("549.00"), "compare_at_price": Decimal("699.00"),
         "stock": 14, "is_deal": True, "brand": "Flexispot",
         "specifications": {"Size": "140x70cm", "Height range": "62-127cm", "Motor": "Dual motor", "Load capacity": "80kg"},
         "images": ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800"]},
        # --- Kitchen ---
        {"name": "Espresso Machine Pro", "slug": "espresso-machine-pro", "sku": "COFFEE-ESP-001", "category": "Kitchen & Dining",
         "description": "Semi-automatic espresso machine with 15-bar pressure, built-in grinder, and milk frother.",
         "short_description": "Semi-auto espresso with grinder", "price": Decimal("449.00"), "stock": 16, "is_featured": True, "brand": "DeLonghi",
         "specifications": {"Pressure": "15 bar", "Grinder": "Built-in conical burr", "Water tank": "2L", "Milk frother": "Steam wand"},
         "images": ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800"]},
        {"name": "Cast Iron Dutch Oven 6L", "slug": "cast-iron-dutch-oven", "sku": "KITCHEN-CO-001", "category": "Kitchen & Dining",
         "description": "Premium enameled cast iron dutch oven perfect for slow cooking, braising, and baking bread.",
         "short_description": "6-liter enameled cast iron pot", "price": Decimal("89.00"), "stock": 35, "brand": "Le Creuset",
         "specifications": {"Capacity": "6 liters", "Material": "Enameled cast iron", "Oven safe": "Up to 260°C", "Color": "Marseille Blue"},
         "images": ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"]},
        # --- Clothing ---
        {"name": "Merino Wool Sweater", "slug": "merino-wool-sweater", "sku": "MENS-SW-001", "category": "Men's Clothing",
         "description": "Soft merino wool crew-neck sweater, breathable and temperature-regulating for all seasons.",
         "short_description": "100% merino wool crew-neck", "price": Decimal("89.00"), "stock": 40, "brand": "Nordic Knit",
         "specifications": {"Material": "100% Merino Wool", "Fit": "Regular", "Care": "Machine wash cold", "Origin": "Made in Finland"},
         "images": ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800"]},
        {"name": "Winter Parka Jacket", "slug": "winter-parka-jacket", "sku": "WOMN-PK-001", "category": "Women's Clothing",
         "description": "Warm and waterproof winter parka with down insulation, faux fur hood, and multiple pockets.",
         "short_description": "Waterproof down-insulated winter parka", "price": Decimal("249.00"), "compare_at_price": Decimal("329.00"),
         "stock": 18, "is_deal": True, "brand": "Helly Hansen",
         "specifications": {"Insulation": "Down 600 fill", "Waterproof": "Yes", "Temperature": "Down to -25°C", "Hood": "Removable faux fur"},
         "images": ["https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800"]},
        # --- Shoes ---
        {"name": "Running Shoes Pro", "slug": "running-shoes-pro", "sku": "SHOES-RUN-001", "category": "Shoes & Footwear",
         "description": "High-performance running shoes with carbon plate, advanced cushioning, and lightweight design.",
         "short_description": "Professional carbon-plate running shoes", "price": Decimal("179.00"), "stock": 50, "brand": "Nike",
         "specifications": {"Type": "Running", "Cushioning": "ZoomX foam", "Plate": "Carbon fiber", "Weight": "198g"},
         "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"]},
        # --- Fitness ---
        {"name": "Adjustable Dumbbell Set", "slug": "adjustable-dumbbell-set", "sku": "FIT-DB-001", "category": "Fitness Equipment",
         "description": "Space-saving adjustable dumbbells from 2.5kg to 25kg per hand with quick-change mechanism.",
         "short_description": "2.5-25kg adjustable dumbbells (pair)", "price": Decimal("349.00"), "stock": 12, "brand": "Bowflex",
         "specifications": {"Weight range": "2.5-25kg", "Increments": "2.5kg", "Mechanism": "Dial select", "Set": "Pair"},
         "images": ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"]},
        # --- Outdoor ---
        {"name": "Camping Tent 4-Person", "slug": "camping-tent-4-person", "sku": "CAMP-T4-001", "category": "Outdoor Gear",
         "description": "Spacious 4-person dome tent with rainfly, vestibule, and easy 10-minute setup.",
         "short_description": "4-person waterproof dome tent", "price": Decimal("199.00"), "stock": 15, "brand": "MSR",
         "specifications": {"Capacity": "4 person", "Seasons": "3-season", "Weight": "3.2kg", "Setup": "Freestanding dome"},
         "images": ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"]},
        # --- Books ---
        {"name": "Programming Books Bundle", "slug": "programming-books-bundle", "sku": "BOOKS-PROG-001", "category": "Non-Fiction & Tech",
         "description": "Collection of essential programming books: Python, JavaScript, algorithms, design patterns, and clean code.",
         "short_description": "5-book programming bundle", "price": Decimal("99.00"), "compare_at_price": Decimal("149.00"),
         "stock": 20, "is_featured": True,
         "specifications": {"Books": "5", "Topics": "Python, JavaScript, Algorithms, Design Patterns, Clean Code"},
         "images": ["https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800"]},
        {"name": "Sci-Fi Classics Collection", "slug": "sci-fi-classics-collection", "sku": "BOOKS-SCIFI-001", "category": "Fiction",
         "description": "Box set of 6 classic science fiction novels including Dune, Foundation, and Neuromancer.",
         "short_description": "6-book sci-fi box set", "price": Decimal("59.00"), "stock": 25,
         "specifications": {"Books": "6", "Format": "Paperback", "Authors": "Herbert, Asimov, Gibson, Clarke, Dick, Le Guin"},
         "images": ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"]},
        # --- Health & Beauty ---
        {"name": "Vitamin C Serum Set", "slug": "vitamin-c-serum-set", "sku": "SKIN-VCS-001", "category": "Skincare",
         "description": "Complete skincare set with Vitamin C serum, moisturizer, and sunscreen for a radiant glow.",
         "short_description": "3-piece Vitamin C skincare set", "price": Decimal("49.00"), "compare_at_price": Decimal("69.00"),
         "stock": 55, "is_deal": True,
         "specifications": {"Pieces": "3", "Skin type": "All skin types", "Key ingredient": "20% Vitamin C", "Cruelty-free": "Yes"},
         "images": ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"]},
        # --- Toys & Games ---
        {"name": "LEGO Technic Porsche 911", "slug": "lego-technic-porsche-911", "sku": "TOYS-LEGO-001", "category": "Toys & Games",
         "description": "Detailed LEGO Technic build of the iconic Porsche 911 GT3 RS with working gearbox and suspension.",
         "short_description": "1,580-piece Porsche 911 build set", "price": Decimal("149.00"), "stock": 20, "is_featured": True, "brand": "LEGO",
         "specifications": {"Pieces": "1,580", "Age": "18+", "Dimensions": "47x20x13cm", "Features": "Working gearbox"},
         "images": ["https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800"]},
        {"name": "Board Game Collection", "slug": "board-game-collection", "sku": "TOYS-BG-001", "category": "Toys & Games",
         "description": "Family game night set with 3 classic strategy board games: Catan, Ticket to Ride, and Carcassonne.",
         "short_description": "3-game strategy board game set", "price": Decimal("89.00"), "compare_at_price": Decimal("120.00"),
         "stock": 30, "is_deal": True,
         "specifications": {"Games": "3", "Players": "2-5", "Age": "10+", "Playtime": "30-90 min each"},
         "images": ["https://images.unsplash.com/photo-1611891487122-207579d67d98?w=800"]},
        # --- Automotive ---
        {"name": "Dash Cam 4K Pro", "slug": "dash-cam-4k-pro", "sku": "AUTO-DC-001", "category": "Automotive",
         "description": "4K front and rear dash camera with night vision, GPS tracking, parking mode, and 64GB storage.",
         "short_description": "4K dual dash cam with night vision", "price": Decimal("129.00"), "stock": 25, "brand": "Viofo",
         "specifications": {"Resolution": "4K front + 1080p rear", "Storage": "64GB included", "GPS": "Built-in", "Night vision": "Starvis sensor"},
         "images": ["https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800"]},
        {"name": "Car Vacuum Cleaner Portable", "slug": "car-vacuum-portable", "sku": "AUTO-VAC-001", "category": "Automotive",
         "description": "Powerful cordless handheld vacuum cleaner for car interiors with HEPA filter and multiple attachments.",
         "short_description": "Cordless car vacuum with HEPA filter", "price": Decimal("59.00"), "stock": 40, "brand": "Dyson",
         "specifications": {"Battery": "30 min runtime", "Suction": "6000Pa", "Filter": "HEPA", "Weight": "0.7kg"},
         "images": ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800"]},
        # --- Lighting ---
        {"name": "Smart LED Floor Lamp", "slug": "smart-led-floor-lamp", "sku": "LIGHT-FL-001", "category": "Lighting",
         "description": "Wi-Fi enabled floor lamp with 16 million colors, adjustable brightness, and voice control via Alexa/Google.",
         "short_description": "RGB smart floor lamp with Wi-Fi", "price": Decimal("79.00"), "stock": 22, "brand": "Philips Hue",
         "specifications": {"Colors": "16 million", "Brightness": "1600 lumens", "Smart": "Wi-Fi, Alexa, Google", "Height": "150cm"},
         "images": ["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800"]},
        {"name": "Desk Lamp with Wireless Charger", "slug": "desk-lamp-wireless-charger", "sku": "LIGHT-DL-001", "category": "Lighting",
         "description": "Modern LED desk lamp with built-in Qi wireless charger, USB port, and 5 brightness levels.",
         "short_description": "LED desk lamp + wireless charger", "price": Decimal("49.00"), "compare_at_price": Decimal("65.00"),
         "stock": 35, "is_deal": True,
         "specifications": {"Charging": "15W Qi + USB-A", "Brightness": "5 levels", "Color temp": "3000-6500K", "Material": "Aluminum"},
         "images": ["https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800"]},
        # --- Extra products for thin categories ---
        {"name": "Moisturizing Face Cream SPF30", "slug": "moisturizing-face-cream-spf30", "sku": "SKIN-MC-001", "category": "Skincare",
         "description": "Daily moisturizer with SPF30 sun protection, hyaluronic acid, and niacinamide for hydrated, protected skin.",
         "short_description": "SPF30 daily moisturizer 50ml", "price": Decimal("35.00"), "stock": 60, "brand": "CeraVe",
         "specifications": {"SPF": "30", "Size": "50ml", "Key ingredients": "Hyaluronic acid, Niacinamide", "Skin type": "All"},
         "images": ["https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800"]},
        {"name": "Canon EOS R6 Mark II", "slug": "canon-eos-r6-mkii", "sku": "CAM-CR6-001", "category": "Cameras & Photography",
         "description": "Full-frame mirrorless camera with 24.2MP sensor, 40fps burst shooting, and 4K 60p video.",
         "short_description": "24.2MP full-frame mirrorless", "price": Decimal("2299.00"), "stock": 6, "brand": "Canon",
         "specifications": {"Sensor": "24.2MP Full-frame CMOS", "Burst": "40 fps", "Video": "4K 60fps", "AF points": "1,053"},
         "images": ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800"]},
        {"name": "Leather Chelsea Boots", "slug": "leather-chelsea-boots", "sku": "SHOES-CB-001", "category": "Shoes & Footwear",
         "description": "Handcrafted leather Chelsea boots with Goodyear welt construction, rubber sole, and pull tabs.",
         "short_description": "Handcrafted leather Chelsea boots", "price": Decimal("199.00"), "stock": 28, "brand": "Timberland",
         "specifications": {"Material": "Full-grain leather", "Sole": "Rubber", "Construction": "Goodyear welt", "Lining": "Leather"},
         "images": ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800"]},
        {"name": "Men's Slim Fit Chinos", "slug": "mens-slim-chinos", "sku": "MENS-CH-001", "category": "Men's Clothing",
         "description": "Versatile slim-fit chino trousers in stretch cotton, perfect for work or weekend wear.",
         "short_description": "Stretch cotton slim-fit chinos", "price": Decimal("59.00"), "stock": 45, "brand": "Dockers",
         "specifications": {"Material": "98% Cotton, 2% Elastane", "Fit": "Slim", "Rise": "Mid", "Care": "Machine wash"},
         "images": ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800"]},
        {"name": "Women's Running Jacket", "slug": "womens-running-jacket", "sku": "WOMN-RJ-001", "category": "Women's Clothing",
         "description": "Lightweight, windproof running jacket with reflective details, thumb holes, and zippered pockets.",
         "short_description": "Windproof reflective running jacket", "price": Decimal("79.00"), "stock": 30, "brand": "Nike",
         "specifications": {"Material": "Ripstop nylon", "Waterproof": "Water-resistant", "Weight": "150g", "Features": "Reflective, packable"},
         "images": ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"]},
        {"name": "Yoga Mat Premium 6mm", "slug": "yoga-mat-premium", "sku": "FIT-YM-001", "category": "Fitness Equipment",
         "description": "Non-slip premium yoga mat with alignment lines, 6mm cushioning, and carrying strap.",
         "short_description": "6mm non-slip yoga mat with strap", "price": Decimal("39.00"), "stock": 50, "brand": "Manduka",
         "specifications": {"Thickness": "6mm", "Material": "TPE eco-friendly", "Size": "183x66cm", "Features": "Alignment lines, carrying strap"},
         "images": ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"]},
        {"name": "Hiking Backpack 45L", "slug": "hiking-backpack-45l", "sku": "OUT-BP-001", "category": "Outdoor Gear",
         "description": "Durable 45-liter hiking backpack with rain cover, hydration sleeve, and ventilated back panel.",
         "short_description": "45L waterproof hiking backpack", "price": Decimal("119.00"), "compare_at_price": Decimal("149.00"),
         "stock": 18, "brand": "Osprey",
         "specifications": {"Volume": "45L", "Weight": "1.4kg", "Material": "Ripstop nylon", "Features": "Rain cover, hip belt, hydration sleeve"},
         "images": ["https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800"]},
        {"name": "Mystery Thriller Box Set", "slug": "mystery-thriller-box-set", "sku": "BOOKS-MYS-001", "category": "Fiction",
         "description": "Collection of 4 bestselling mystery thrillers: Gone Girl, The Girl on the Train, Big Little Lies, and The Silent Patient.",
         "short_description": "4-book mystery thriller collection", "price": Decimal("45.00"), "stock": 30,
         "specifications": {"Books": "4", "Format": "Paperback", "Authors": "Flynn, Hawkins, Moriarty, Michaelides"},
         "images": ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"]},
        {"name": "Data Science Handbook", "slug": "data-science-handbook", "sku": "BOOKS-DS-001", "category": "Non-Fiction & Tech",
         "description": "Comprehensive guide to data science covering Python, statistics, machine learning, and data visualization.",
         "short_description": "Complete data science reference book", "price": Decimal("44.00"), "stock": 22, "brand": "O'Reilly",
         "specifications": {"Pages": "650", "Topics": "Python, ML, Statistics, Visualization", "Level": "Beginner to Advanced"},
         "images": ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"]},
    ]

    existing_count = db.query(Product).count()
    if existing_count > 0:
        print(f"✓ Products already exist ({existing_count})")
        return

    for prod_data in products_data:
        category_id = category_map.get(prod_data["category"])
        product = Product(
            category_id=category_id,
            name=prod_data["name"],
            slug=prod_data["slug"],
            sku=prod_data["sku"],
            description=prod_data["description"],
            short_description=prod_data.get("short_description"),
            price=prod_data["price"],
            compare_at_price=prod_data.get("compare_at_price"),
            stock_quantity=prod_data["stock"],
            specifications=prod_data.get("specifications"),
            brand=prod_data.get("brand"),
            is_active=True,
            is_featured=prod_data.get("is_featured", False),
            is_deal=prod_data.get("is_deal", False),
        )
        db.add(product)
        db.flush()

        for idx, img_url in enumerate(prod_data["images"]):
            db.add(ProductImage(
                product_id=product.id,
                image_url=img_url,
                alt_text=prod_data["name"],
                display_order=idx,
                is_primary=(idx == 0),
            ))

    db.commit()
    print(f"✓ Created {len(products_data)} products with images")


def create_coupons(db: Session) -> None:
    """Create demo coupons."""
    now = datetime.now(timezone.utc)
    coupons_data = [
        {"code": "WELCOME10", "description": "10% off for new customers",
         "discount_type": DiscountType.PERCENTAGE, "discount_value": Decimal("10.00"),
         "valid_from": now, "valid_until": now + timedelta(days=90)},
        {"code": "SUMMER20", "description": "Summer sale - 20% off",
         "discount_type": DiscountType.PERCENTAGE, "discount_value": Decimal("20.00"),
         "valid_from": now, "valid_until": now + timedelta(days=60)},
        {"code": "FREESHIP", "description": "Free shipping on all orders",
         "discount_type": DiscountType.FREE_SHIPPING, "discount_value": Decimal("0.00"),
         "valid_from": now, "valid_until": now + timedelta(days=30)},
        {"code": "SAVE50", "description": "€50 off orders over €300",
         "discount_type": DiscountType.FIXED_AMOUNT, "discount_value": Decimal("50.00"),
         "min_purchase_amount": Decimal("300.00"),
         "valid_from": now, "valid_until": now + timedelta(days=45)},
    ]

    existing_count = db.query(Coupon).count()
    if existing_count > 0:
        print(f"✓ Coupons already exist ({existing_count})")
        return

    for coupon_data in coupons_data:
        db.add(Coupon(**coupon_data))

    db.commit()
    print(f"✓ Created {len(coupons_data)} coupons")


def create_variants(db: Session) -> None:
    """Create product variants for select products."""
    existing = db.query(ProductVariant).count()
    if existing > 0:
        print(f"✓ Variants already exist ({existing})")
        return

    variant_data = {
        "running-shoes-pro": [
            {"sku": "SHOES-RUN-40", "name": "Size 40", "options": {"size": "40"}, "stock": 10},
            {"sku": "SHOES-RUN-41", "name": "Size 41", "options": {"size": "41"}, "stock": 12},
            {"sku": "SHOES-RUN-42", "name": "Size 42", "options": {"size": "42"}, "stock": 15},
            {"sku": "SHOES-RUN-43", "name": "Size 43", "options": {"size": "43"}, "stock": 8},
            {"sku": "SHOES-RUN-44", "name": "Size 44", "options": {"size": "44"}, "stock": 6},
        ],
        "leather-chelsea-boots": [
            {"sku": "SHOES-CB-40", "name": "Size 40", "options": {"size": "40"}, "stock": 5},
            {"sku": "SHOES-CB-41", "name": "Size 41", "options": {"size": "41"}, "stock": 8},
            {"sku": "SHOES-CB-42", "name": "Size 42", "options": {"size": "42"}, "stock": 10},
            {"sku": "SHOES-CB-43", "name": "Size 43", "options": {"size": "43"}, "stock": 7},
            {"sku": "SHOES-CB-44", "name": "Size 44", "options": {"size": "44"}, "stock": 4},
        ],
        "merino-wool-sweater": [
            {"sku": "MENS-SW-S", "name": "Small", "options": {"size": "S"}, "stock": 10},
            {"sku": "MENS-SW-M", "name": "Medium", "options": {"size": "M"}, "stock": 15},
            {"sku": "MENS-SW-L", "name": "Large", "options": {"size": "L"}, "stock": 12},
            {"sku": "MENS-SW-XL", "name": "Extra Large", "options": {"size": "XL"}, "stock": 8},
        ],
        "winter-parka-jacket": [
            {"sku": "WOMN-PK-S", "name": "Small", "options": {"size": "S"}, "stock": 4},
            {"sku": "WOMN-PK-M", "name": "Medium", "options": {"size": "M"}, "stock": 6},
            {"sku": "WOMN-PK-L", "name": "Large", "options": {"size": "L"}, "stock": 5},
            {"sku": "WOMN-PK-XL", "name": "Extra Large", "options": {"size": "XL"}, "stock": 3},
        ],
        "mens-slim-chinos": [
            {"sku": "MENS-CH-30", "name": "30/32", "options": {"size": "30/32"}, "stock": 8},
            {"sku": "MENS-CH-32", "name": "32/32", "options": {"size": "32/32"}, "stock": 12},
            {"sku": "MENS-CH-34", "name": "34/32", "options": {"size": "34/32"}, "stock": 15},
            {"sku": "MENS-CH-36", "name": "36/32", "options": {"size": "36/32"}, "stock": 10},
        ],
        "macbook-pro-16-m3": [
            {"sku": "MBP-16-512", "name": "512GB / 16GB RAM", "options": {"storage": "512GB", "ram": "16GB"}, "price": Decimal("2499.00"), "stock": 8},
            {"sku": "MBP-16-1TB", "name": "1TB / 32GB RAM", "options": {"storage": "1TB", "ram": "32GB"}, "price": Decimal("2999.00"), "stock": 5},
            {"sku": "MBP-16-2TB", "name": "2TB / 64GB RAM", "options": {"storage": "2TB", "ram": "64GB"}, "price": Decimal("3999.00"), "stock": 3},
        ],
        "iphone-15-pro": [
            {"sku": "IP15P-128", "name": "128GB", "options": {"storage": "128GB"}, "price": Decimal("1099.00"), "stock": 10},
            {"sku": "IP15P-256", "name": "256GB", "options": {"storage": "256GB"}, "price": Decimal("1199.00"), "stock": 8},
            {"sku": "IP15P-512", "name": "512GB", "options": {"storage": "512GB"}, "price": Decimal("1399.00"), "stock": 5},
            {"sku": "IP15P-1TB", "name": "1TB", "options": {"storage": "1TB"}, "price": Decimal("1599.00"), "stock": 3},
        ],
    }

    count = 0
    for slug, variants in variant_data.items():
        product = db.query(Product).filter(Product.slug == slug).first()
        if not product:
            continue
        for v in variants:
            variant = ProductVariant(
                product_id=product.id,
                sku=v["sku"],
                name=v["name"],
                options=v["options"],
                price=v.get("price"),
                stock_quantity=v["stock"],
                is_active=True,
            )
            db.add(variant)
            count += 1

    db.commit()
    print(f"✓ Created {count} variants across {len(variant_data)} products")


def create_reviews(db: Session) -> None:
    """Create realistic reviews for products."""
    import random

    existing_count = db.query(ProductReview).count()
    if existing_count > 0:
        print(f"✓ Reviews already exist ({existing_count})")
        return

    products = db.query(Product).all()
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER).all()
    if not customers:
        print("✗ No customers found, skipping reviews")
        return

    # Realistic review templates per rating
    review_templates = {
        5: [
            ("Excellent product!", "Exceeded my expectations in every way. Build quality is superb and it works perfectly. Highly recommended!"),
            ("Best purchase this year", "I've been using this for a few weeks now and I'm absolutely thrilled. Worth every cent."),
            ("Absolutely love it", "Perfect quality, fast delivery, and exactly as described. Will definitely buy from here again."),
            ("Outstanding quality", "The attention to detail is impressive. This is clearly a premium product and it shows in daily use."),
            ("Couldn't be happier", "This is exactly what I was looking for. Great value for money and excellent build quality."),
        ],
        4: [
            ("Very good, minor issues", "Overall a great product. There are a few small things that could be improved, but I'm satisfied with my purchase."),
            ("Solid purchase", "Good quality and works as expected. Delivery was quick. Only giving 4 stars because the packaging could be better."),
            ("Happy with it", "Does exactly what it's supposed to do. Nicely made and good value. Would recommend to others."),
            ("Great but not perfect", "Really enjoy using this product. A couple of minor niggles but nothing that affects the overall experience."),
        ],
        3: [
            ("Decent, but expected more", "It's okay for the price. Does the job but doesn't feel as premium as I hoped. Average quality."),
            ("It's fine", "Not bad, not great. Gets the job done. I might look for alternatives next time."),
            ("Mixed feelings", "Some aspects are good but others are disappointing. The product works but feels like it could be better."),
        ],
        2: [
            ("Disappointed", "The quality doesn't match the price. Had some issues right out of the box. Expected much better."),
            ("Below expectations", "Not what I expected based on the description. Works but feels cheaply made."),
        ],
        1: [
            ("Not recommended", "Very poor quality. Broke within the first week of use. Would not recommend this to anyone."),
        ],
    }

    # Weight distribution: most products get 4-5 star reviews
    rating_weights = [1, 2, 5, 15, 20]  # weights for ratings 1-5
    now = datetime.now(timezone.utc)
    review_count = 0

    for product in products:
        num_reviews = random.randint(2, 5)
        used_users = set()

        for i in range(num_reviews):
            available = [u for u in customers if u.id not in used_users]
            if not available:
                break
            user = random.choice(available)
            used_users.add(user.id)

            rating = random.choices([1, 2, 3, 4, 5], weights=rating_weights, k=1)[0]
            templates = review_templates[rating]
            title, comment = random.choice(templates)

            review = ProductReview(
                product_id=product.id,
                user_id=user.id,
                rating=rating,
                title=title,
                comment=comment,
                verified_purchase=random.random() > 0.3,
                helpful_count=random.randint(0, 15),
                created_at=now - timedelta(days=random.randint(1, 90)),
            )
            db.add(review)
            review_count += 1

        # Update product rating stats
        product_reviews = (
            db.query(ProductReview)
            .filter(ProductReview.product_id == product.id)
            .all()
        )
        if product_reviews:
            avg = sum(r.rating for r in product_reviews) / len(product_reviews)
            product.rating_average = round(avg, 2)
            product.rating_count = len(product_reviews)

    db.commit()
    print(f"✓ Created {review_count} reviews across {len(products)} products")


def seed_database() -> None:
    """Seed the database with demo data."""
    db = SessionLocal()
    try:
        print("\n=== Seeding database with demo data ===\n")
        print("Creating users...")
        create_users(db)
        print("\nCreating categories...")
        category_map = create_categories(db)
        print("\nCreating products...")
        create_products(db, category_map)
        print("\nCreating coupons...")
        create_coupons(db)
        print("\nCreating variants...")
        create_variants(db)
        print("\nCreating reviews...")
        create_reviews(db)

        cat_count = db.query(Category).count()
        prod_count = db.query(Product).count()
        review_count = db.query(ProductReview).count()
        coupon_count = db.query(Coupon).count()
        print(f"\n=== Database seeding completed successfully ===\n")
        print(f"Demo data created:")
        print(f"  - 1 Admin user (admin@example.com / admin123)")
        print(f"  - 5 Customer users (customer1-5@example.com / password123)")
        print(f"  - {cat_count} Categories")
        print(f"  - {prod_count} Products with images")
        print(f"  - {review_count} Reviews")
        print(f"  - {coupon_count} Coupons (WELCOME10, SUMMER20, FREESHIP, SAVE50)")
        print("")
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
