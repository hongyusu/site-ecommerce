"""Seed database with Verkkokauppa-style demo data."""

from datetime import datetime, timedelta
from decimal import Decimal

from faker import Faker
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.coupon import Coupon, DiscountType
from app.models.product import Product, ProductImage
from app.models.user import User, UserRole

fake = Faker()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def clear_data(db: Session) -> None:
    """Clear existing data."""
    print("Clearing existing data...")
    db.query(ProductImage).delete()
    db.query(Product).delete()
    db.query(Category).delete()
    db.query(Coupon).delete()
    db.commit()
    print("✓ Data cleared")


def create_users(db: Session) -> None:
    """Create demo users."""
    # Check if admin already exists
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin_user = User(
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
            first_name="Admin",
            last_name="User",
            is_active=True,
            is_verified=True,
            preferred_language="en",
        )
        db.add(admin_user)
        print("✓ Created admin user: admin@example.com / admin123")
    else:
        print("✓ Admin user already exists")

    # Create customer users
    for i in range(1, 6):
        email = f"customer{i}@example.com"
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            customer = User(
                email=email,
                password_hash=hash_password("password123"),
                role=UserRole.CUSTOMER,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                phone=fake.phone_number(),
                is_active=True,
                is_verified=True,
                preferred_language="fi",
            )
            db.add(customer)
            print(f"✓ Created customer user: {email} / password123")
        else:
            print(f"✓ Customer user already exists: {email}")

    db.commit()


def create_categories(db: Session) -> dict[str, int]:
    """Create Verkkokauppa-style product categories."""
    category_data = [
        # Main categories
        {"name": "Tietokoneet ja lisälaitteet", "slug": "tietokoneet", "image_url": "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"},
        {"name": "Puhelimet ja kellot", "slug": "puhelimet", "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"},
        {"name": "TV ja viihde-elektroniikka", "slug": "tv-viihde", "image_url": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400"},
        {"name": "Valokuvaus", "slug": "valokuvaus", "image_url": "https://images.unsplash.com/photo-1606094794371-f9d07cee1b73?w=400"},
        {"name": "Pelit ja viihde", "slug": "pelit", "image_url": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400"},
        {"name": "Audio", "slug": "audio", "image_url": "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400"},
        {"name": "Kodinkoneet", "slug": "kodinkoneet", "image_url": "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400"},
        {"name": "Älykoti", "slug": "alykoti", "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?w=400"},

        # Tietokoneet subcategories
        {"name": "Kannettavat tietokoneet", "slug": "kannettavat", "parent": "Tietokoneet ja lisälaitteet", "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"},
        {"name": "Pöytäkoneet", "slug": "poytakoneet", "parent": "Tietokoneet ja lisälaitteet", "image_url": "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400"},
        {"name": "Näytöt", "slug": "naytot", "parent": "Tietokoneet ja lisälaitteet", "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400"},
        {"name": "Näppäimistöt ja hiiret", "slug": "nappaimistot-hiiret", "parent": "Tietokoneet ja lisälaitteet", "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400"},
        {"name": "Tulostimet", "slug": "tulostimet", "parent": "Tietokoneet ja lisälaitteet", "image_url": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400"},

        # Puhelimet subcategories
        {"name": "Älypuhelimet", "slug": "alypuhelimet", "parent": "Puhelimet ja kellot", "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"},
        {"name": "Älykellot", "slug": "alykellot", "parent": "Puhelimet ja kellot", "image_url": "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400"},
        {"name": "Puhelimen kuoret ja suojat", "slug": "puhelimen-kuoret", "parent": "Puhelimet ja kellot", "image_url": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400"},

        # TV ja viihde subcategories
        {"name": "Televisiot", "slug": "televisiot", "parent": "TV ja viihde-elektroniikka", "image_url": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400"},
        {"name": "Soundbarit", "slug": "soundbarit", "parent": "TV ja viihde-elektroniikka", "image_url": "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400"},
        {"name": "Mediasoittimet", "slug": "mediasoittimet", "parent": "TV ja viihde-elektroniikka", "image_url": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400"},

        # Valokuvaus subcategories
        {"name": "Järjestelmäkamerat", "slug": "jarjestelmakamerat", "parent": "Valokuvaus", "image_url": "https://images.unsplash.com/photo-1606094794371-f9d07cee1b73?w=400"},
        {"name": "Actionkamerat", "slug": "actionkamerat", "parent": "Valokuvaus", "image_url": "https://images.unsplash.com/photo-1617410232938-54bf6ec978f9?w=400"},
        {"name": "Objektiivit", "slug": "objektiivit", "parent": "Valokuvaus", "image_url": "https://images.unsplash.com/photo-1606094794371-f9d07cee1b73?w=400"},

        # Pelit subcategories
        {"name": "Pelikonsolit", "slug": "pelikonsolit", "parent": "Pelit ja viihde", "image_url": "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=400"},
        {"name": "Pelit", "slug": "pelit-tuotteet", "parent": "Pelit ja viihde", "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400"},
        {"name": "Peliohjaimet", "slug": "peliohjaimet", "parent": "Pelit ja viihde", "image_url": "https://images.unsplash.com/photo-1538491384274-cc7e3aa8fdad?w=400"},

        # Audio subcategories
        {"name": "Kuulokkeet", "slug": "kuulokkeet", "parent": "Audio", "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400"},
        {"name": "Kaiuttimet", "slug": "kaiuttimet", "parent": "Audio", "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400"},

        # Kodinkoneet subcategories
        {"name": "Pyykinpesukoneet", "slug": "pyykinpesukoneet", "parent": "Kodinkoneet", "image_url": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400"},
        {"name": "Jääkaapit", "slug": "jaakaapit", "parent": "Kodinkoneet", "image_url": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400"},
        {"name": "Kahvinkeittäjät", "slug": "kahvinkeittajat", "parent": "Kodinkoneet", "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400"},
        {"name": "Pölynimurit", "slug": "polynimurit", "parent": "Kodinkoneet", "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400"},

        # Älykoti subcategories
        {"name": "Älyvalot", "slug": "alyvalot", "parent": "Älykoti", "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"},
        {"name": "Termostaatit", "slug": "termostaatit", "parent": "Älykoti", "image_url": "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400"},
        {"name": "Turvakamet", "slug": "turvakamet", "parent": "Älykoti", "image_url": "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400"},
    ]

    category_map = {}

    for idx, cat_info in enumerate(category_data):
        parent_id = None
        if "parent" in cat_info:
            parent_id = category_map.get(cat_info["parent"])

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
    """Create Verkkokauppa-style products with images."""
    products_data = [
        # Kannettavat tietokoneet
        {
            "name": "Apple MacBook Air 15\" M3 8C CPU 10C GPU, 8GB, 256GB SSD",
            "slug": "macbook-air-15-m3",
            "sku": "MBA-15-M3-256",
            "category": "Kannettavat tietokoneet",
            "description": "Tehokas ja ohut kannettava tietokone M3-sirulla. Loistava valinta opiskeluun ja kevyeen ammattikäyttöön. 15-tuuman Liquid Retina -näyttö ja pitkä akunkesto.",
            "short_description": "15\" kannettava M3-sirulla",
            "price": Decimal("1599.00"),
            "compare_at_price": Decimal("1799.00"),
            "stock": 25,
            "is_featured": True,
            "is_deal": True,
            "brand": "Apple",
            "warranty_months": 12,
            "weight_kg": Decimal("1.51"),
            "delivery_time_days": "1-2 päivää",
            "rating_average": Decimal("4.7"),
            "rating_count": 156,
            "key_features": [
                "Apple M3 -siru 8-ytimisellä CPU:lla ja 10-ytimisellä GPU:lla",
                "15,3 tuuman Liquid Retina -näyttö (2880 x 1864)",
                "8 Gt:n yhtenäinen muisti - 256 Gt:n SSD-levy",
                "Jopa 18 tunnin akunkesto",
                "1080p FaceTime HD -kamera",
                "MagSafe 3 -lataus, kaksi Thunderbolt-porttia",
                "Hiljainen, tuulettimeton rakenne"
            ],
            "specifications": {
                "Suoritin": "Apple M3 8-core",
                "Näytönohjain": "10-core GPU",
                "RAM": "8GB Unified Memory",
                "Tallennustila": "256GB SSD",
                "Näyttö": "15.3\" Liquid Retina (2880x1864)",
                "Paino": "1.51 kg"
            },
            "images": [
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
                "https://images.unsplash.com/photo-1517765371796-5bd3a7d30a29?w=800",
            ],
        },
        {
            "name": "ASUS ROG Strix G16 Gaming-kannettava, i7-13650HX, RTX 4060, 16GB, 512GB SSD",
            "slug": "asus-rog-strix-g16",
            "sku": "ASUS-ROG-G16-001",
            "category": "Kannettavat tietokoneet",
            "description": "Voimakas pelilannettava. Intel i7-prosessori ja RTX 4060 -näytönohjain takaavat erinomaisen pelikokemuksen. 16\" QHD 240Hz näyttö.",
            "short_description": "16\" pelilannettava RTX 4060:lla",
            "price": Decimal("1799.00"),
            "stock": 15,
            "is_featured": True,
            "specifications": {
                "Suoritin": "Intel Core i7-13650HX",
                "Näytönohjain": "NVIDIA RTX 4060 8GB",
                "RAM": "16GB DDR5",
                "Tallennustila": "512GB NVMe SSD",
                "Näyttö": "16\" QHD 240Hz",
                "Paino": "2.5 kg"
            },
            "images": [
                "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
            ],
        },
        {
            "name": "Lenovo ThinkPad T14 Gen 4, Ryzen 7 7840U, 16GB, 512GB SSD",
            "slug": "lenovo-thinkpad-t14-gen4",
            "sku": "LENOVO-T14G4-001",
            "category": "Kannettavat tietokoneet",
            "description": "Luotettava ja kestävä yrityslannettava. AMD Ryzen 7 takaa tehokkaan suorituskyvyn ja pitkän akunkeston. Täydellinen työlaptop.",
            "short_description": "14\" yrityslannettava Ryzen 7:lla",
            "price": Decimal("1299.00"),
            "stock": 20,
            "specifications": {
                "Suoritin": "AMD Ryzen 7 7840U",
                "RAM": "16GB DDR5",
                "Tallennustila": "512GB SSD",
                "Näyttö": "14\" WUXGA IPS",
                "Paino": "1.4 kg",
                "Akunkesto": "jopa 15h"
            },
            "images": [
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
            ],
        },

        # Älypuhelimet
        {
            "name": "Apple iPhone 15 Pro 256GB",
            "slug": "iphone-15-pro-256gb",
            "sku": "IP15P-256-001",
            "category": "Älypuhelimet",
            "description": "Uusin iPhone titaanikotelolla. A17 Pro -siru, tekoälykamera ja ProMotion-näyttö. 5G ja USB-C-liitäntä.",
            "short_description": "6.1\" älypuhelin A17 Pro -sirulla",
            "price": Decimal("1299.00"),
            "compare_at_price": Decimal("1449.00"),
            "stock": 30,
            "is_deal": True,
            "is_featured": True,
            "brand": "Apple",
            "warranty_months": 12,
            "weight_kg": Decimal("0.187"),
            "delivery_time_days": "1-2 päivää",
            "rating_average": Decimal("4.8"),
            "rating_count": 243,
            "key_features": [
                "Apple A17 Pro -siru - titaniumrunko",
                "6,1 tuuman Super Retina XDR ProMotion -näyttö",
                "Kolmoisjärjestelmäkamera (48 MP pää + 12 MP ultra + 12 MP tele)",
                "Aktiivinen Dynaaminen saari - Always-On-näyttö",
                "USB-C-liitäntä - 5G-yhteys",
                "Face ID - MagSafe-lataus",
                "Vedenkestävyys (IP68)"
            ],
            "specifications": {
                "Suoritin": "Apple A17 Pro",
                "Tallennustila": "256GB",
                "Näyttö": "6.1\" Super Retina XDR OLED",
                "Kamera": "48MP pääkamera + 12MP ultralaajakulma + 12MP telelinssi",
                "5G": "Kyllä",
                "Paino": "187g"
            },
            "images": [
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
            ],
        },
        {
            "name": "Samsung Galaxy S24 Ultra 512GB",
            "slug": "samsung-galaxy-s24-ultra-512gb",
            "sku": "SGS24U-512-001",
            "category": "Älypuhelimet",
            "description": "Huippuluokan Android-puhelin. 200MP kamera, S Pen -kynä ja tehokas Snapdragon 8 Gen 3. Galaxy AI tekee puhelimesta älykkäimmän.",
            "short_description": "6.8\" flagship S Penillä",
            "price": Decimal("1549.00"),
            "stock": 18,
            "is_featured": True,
            "specifications": {
                "Suoritin": "Snapdragon 8 Gen 3",
                "RAM": "12GB",
                "Tallennustila": "512GB",
                "Näyttö": "6.8\" Dynamic AMOLED 2X",
                "Kamera": "200MP pääkamera",
                "S Pen": "Kyllä"
            },
            "images": [
                "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
            ],
        },
        {
            "name": "Google Pixel 8 Pro 256GB",
            "slug": "google-pixel-8-pro-256gb",
            "sku": "GP8P-256-001",
            "category": "Älypuhelimet",
            "description": "Googlen huippupuhelin tekoälyominaisuuksilla. Tensor G3 -siru ja parhaat kamerat kuvankäsittelyllä. Puhdas Android-käyttöliittymä.",
            "short_description": "6.7\" AI-puhelin Tensor G3:lla",
            "price": Decimal("1099.00"),
            "stock": 25,
            "specifications": {
                "Suoritin": "Google Tensor G3",
                "RAM": "12GB",
                "Tallennustila": "256GB",
                "Näyttö": "6.7\" LTPO OLED 120Hz",
                "Kamera": "50MP pääkamera + 48MP ultralaajakulma",
                "AI": "Google AI ominaisuudet"
            },
            "images": [
                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
            ],
        },

        # Näytöt
        {
            "name": "LG UltraGear 27\" QHD 165Hz Gaming-näyttö",
            "slug": "lg-ultragear-27-qhd-165hz",
            "sku": "LG-UG27-165-001",
            "category": "Näytöt",
            "description": "Nopea pelinäyttö 1ms vasteajalla. QHD-resoluutio ja 165Hz virkistystaajuus takaavat sulavan pelaamisen. FreeSync ja G-SYNC yhteensopiva.",
            "short_description": "27\" QHD 165Hz pelinäyttö",
            "price": Decimal("349.00"),
            "compare_at_price": Decimal("449.00"),
            "stock": 22,
            "is_deal": True,
            "specifications": {
                "Koko": "27 tuumaa",
                "Resoluutio": "2560x1440 (QHD)",
                "Virkistystaajuus": "165Hz",
                "Vasteaika": "1ms",
                "Paneeli": "IPS",
                "Ominaisuudet": "FreeSync Premium, G-SYNC Compatible"
            },
            "images": [
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
            ],
        },
        {
            "name": "Dell UltraSharp 32\" 4K USB-C Hub-näyttö",
            "slug": "dell-ultrasharp-32-4k-usbc",
            "sku": "DELL-US32-4K-001",
            "category": "Näytöt",
            "description": "Ammattilaistason 4K-näyttö. USB-C 90W lataus ja hub-ominaisuudet. Tarkka värintoisto ja ergonominen jalusta. Täydellinen työnäyttö.",
            "short_description": "32\" 4K työnäyttö USB-C:llä",
            "price": Decimal("699.00"),
            "stock": 15,
            "specifications": {
                "Koko": "32 tuumaa",
                "Resoluutio": "3840x2160 (4K UHD)",
                "Paneeli": "IPS Black",
                "USB-C": "90W Power Delivery",
                "Värikattavuus": "99% sRGB",
                "Ergonomia": "Korkeussäätö, pivot, swivel"
            },
            "images": [
                "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800",
            ],
        },

        # Näppäimistöt ja hiiret
        {
            "name": "Logitech MX Keys S -langaton näppäimistö",
            "slug": "logitech-mx-keys-s",
            "sku": "LOG-MXK-S-001",
            "category": "Näppäimistöt ja hiiret",
            "description": "Premium-näppäimistö ammattilaisille. Taustavaloiset näppäimet, mukava kirjoituskokemus ja pitkä akunkesto. Tuki usealle laitteelle.",
            "short_description": "Langaton premium-näppäimistö",
            "price": Decimal("129.00"),
            "stock": 35,
            "specifications": {
                "Tyyppi": "Langaton",
                "Layout": "Nordic",
                "Taustavalosus": "Kyllä",
                "Akunkesto": "5 kuukautta",
                "Yhteys": "Bluetooth tai Logi Bolt",
                "Multi-device": "Jopa 3 laitetta"
            },
            "images": [
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
            ],
        },
        {
            "name": "Logitech G PRO X SUPERLIGHT Wireless Gaming-hiiri",
            "slug": "logitech-g-pro-x-superlight",
            "sku": "LOG-GPXSL-001",
            "category": "Näppäimistöt ja hiiret",
            "description": "Ultrakevyt langaton pelilhiiri ammattilaisille. Paino vain 63g ja HERO 25K -sensori. Pitkä akunkesto ja matala viive.",
            "short_description": "Langaton kevyt pelilhiiri 63g",
            "price": Decimal("159.00"),
            "stock": 28,
            "is_featured": True,
            "specifications": {
                "Paino": "63g",
                "Sensori": "HERO 25K",
                "DPI": "100-25600",
                "Akunkesto": "70+ tuntia",
                "Yhteys": "LIGHTSPEED Wireless",
                "Napit": "5 ohjelmoitavaa"
            },
            "images": [
                "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800",
            ],
        },

        # TV
        {
            "name": "LG OLED65C3 65\" 4K OLED Smart TV",
            "slug": "lg-oled65c3",
            "sku": "LG-OLEDC3-65-001",
            "category": "Televisiot",
            "description": "Huippulaatu OLED-televisio. Ääretön kontrasti ja täydelliset mustat. webOS 23, 120Hz ja HDMI 2.1 pelaamiseen. Dolby Vision ja Atmos.",
            "short_description": "65\" 4K OLED Smart TV 120Hz",
            "price": Decimal("1799.00"),
            "compare_at_price": Decimal("2299.00"),
            "stock": 12,
            "is_deal": True,
            "is_featured": True,
            "specifications": {
                "Koko": "65 tuumaa",
                "Resoluutio": "3840x2160 (4K UHD)",
                "Paneeli": "OLED evo",
                "Virkistystaajuus": "120Hz",
                "HDR": "Dolby Vision IQ, HDR10, HLG",
                "Smart TV": "webOS 23",
                "HDMI": "4x HDMI 2.1"
            },
            "images": [
                "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800",
            ],
        },
        {
            "name": "Samsung QE55QN90C 55\" Neo QLED 4K Smart TV",
            "slug": "samsung-qe55qn90c",
            "sku": "SAMS-QN90C-55-001",
            "category": "Televisiot",
            "description": "Kirkas ja värikäs Neo QLED. Mini LED -taustavalo ja Quantum Matrix. Tizen OS ja Samsung Gaming Hub. 4K 120Hz pelaamiseen.",
            "short_description": "55\" Neo QLED 4K Smart TV",
            "price": Decimal("1399.00"),
            "stock": 18,
            "specifications": {
                "Koko": "55 tuumaa",
                "Resoluutio": "3840x2160 (4K UHD)",
                "Paneeli": "Neo QLED (Mini LED)",
                "Virkistystaajuus": "120Hz",
                "HDR": "HDR10+, HLG",
                "Smart TV": "Tizen",
                "Gaming": "4x HDMI 2.1, FreeSync Premium Pro"
            },
            "images": [
                "https://images.unsplash.com/photo-1601944177325-f8867652837f?w=800",
            ],
        },

        # Kamerat
        {
            "name": "Sony Alpha 7 IV -järjestelmäkamera runko",
            "slug": "sony-alpha-7-iv-runko",
            "sku": "SONY-A7IV-BODY-001",
            "category": "Järjestelmäkamerat",
            "description": "Monipuolinen täyskennokamera. 33MP kennо ja erinomainen autofokus. 4K 60fps video ja 10fps jatkuva kuvaus. Täydellinen valinta harrastelijalle ja ammattilaiselle.",
            "short_description": "33MP täyskennokamera",
            "price": Decimal("2499.00"),
            "stock": 10,
            "is_featured": True,
            "specifications": {
                "Kennokoko": "Täyskenno 35mm",
                "Resoluutio": "33 megapikseliä",
                "Autofokus": "693-pisteinen faasin tunnistus",
                "Video": "4K 60fps",
                "Sarjakuvaus": "10 fps",
                "Stabilointi": "5-akselinen IBIS"
            },
            "images": [
                "https://images.unsplash.com/photo-1606094794371-f9d07cee1b73?w=800",
            ],
        },
        {
            "name": "GoPro Hero 12 Black",
            "slug": "gopro-hero-12-black",
            "sku": "GP-H12B-001",
            "category": "Actionkamerat",
            "description": "Paras actionkamera seikkailuihin. 5.3K 60fps video ja HyperSmooth 6.0 -stabilointi. Vedenpitävä 10m asti. Bluetooth-audio ja pitkä akunkesto.",
            "short_description": "5.3K actionkamera stabiloinnilla",
            "price": Decimal("449.00"),
            "stock": 32,
            "specifications": {
                "Video": "5.3K 60fps",
                "Kuva": "27MP",
                "Stabilointi": "HyperSmooth 6.0",
                "Vedenkestävyys": "10m",
                "Akunkesto": "jopa 70min (5.3K)",
                "Ominaisuudet": "TimeWarp 3.0, SuperPhoto"
            },
            "images": [
                "https://images.unsplash.com/photo-1617410232938-54bf6ec978f9?w=800",
            ],
        },

        # Pelikonsolit
        {
            "name": "Sony PlayStation 5 (Slim) 1TB",
            "slug": "playstation-5-slim-1tb",
            "sku": "SONY-PS5-SLIM-001",
            "category": "Pelikonsolit",
            "description": "Uusin PS5-konsoli kompaktimmassa koossa. 1TB tallennustila, 4K 120fps, ray tracing ja nopea SSD. Mukana DualSense-ohjain.",
            "short_description": "PS5-pelikonsoli 1TB:lla",
            "price": Decimal("549.00"),
            "stock": 20,
            "is_featured": True,
            "specifications": {
                "Suoritin": "AMD Zen 2",
                "Näytönohjain": "AMD RDNA 2",
                "RAM": "16GB GDDR6",
                "Tallennustila": "1TB NVMe SSD",
                "Resoluutio": "Jopa 4K 120fps",
                "Ominaisuudet": "Ray tracing, 3D Audio, DualSense"
            },
            "images": [
                "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
            ],
        },
        {
            "name": "Microsoft Xbox Series X 1TB",
            "slug": "xbox-series-x-1tb",
            "sku": "MS-XSX-1TB-001",
            "category": "Pelikonsolit",
            "description": "Tehokkain Xbox-konsoli. 4K 120fps, ray tracing ja Quick Resume. Game Pass -tuki ja taaksepäin yhteensopivuus. Nopea SSD.",
            "short_description": "Xbox Series X 1TB",
            "price": Decimal("549.00"),
            "stock": 18,
            "specifications": {
                "Suoritin": "AMD Zen 2 8-core",
                "Näytönohjain": "AMD RDNA 2",
                "RAM": "16GB GDDR6",
                "Tallennustila": "1TB NVMe SSD",
                "Resoluutio": "Jopa 4K 120fps",
                "Ominaisuudet": "Quick Resume, Smart Delivery"
            },
            "images": [
                "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=800",
            ],
        },

        # Kuulokkeet
        {
            "name": "Sony WH-1000XM5 Bluetooth-kuulokkeet",
            "slug": "sony-wh1000xm5",
            "sku": "SONY-WH1000XM5-001",
            "category": "Kuulokkeet",
            "description": "Alan paras aktiivinen melunvaimennus. Erinomainen äänenlaatu, mukava käyttö ja 30h akunkesto. Multipoint-yhteys ja laadukas mikrofonit.",
            "short_description": "Premium ANC-kuulokkeet",
            "price": Decimal("399.00"),
            "compare_at_price": Decimal("449.00"),
            "stock": 40,
            "is_deal": True,
            "is_featured": True,
            "specifications": {
                "Tyyppi": "Over-ear, langaton",
                "ANC": "Aktiivinen melunvaimennus",
                "Akunkesto": "30 tuntia (ANC päällä)",
                "Yhteys": "Bluetooth 5.2, Multipoint",
                "Codec": "LDAC, AAC, SBC",
                "Paino": "250g"
            },
            "images": [
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
            ],
        },
        {
            "name": "Apple AirPods Pro (2. sukupolvi) USB-C",
            "slug": "airpods-pro-2-usbc",
            "sku": "APPLE-APP2-USBC-001",
            "category": "Kuulokkeet",
            "description": "Älykäs aktiivinen melunvaimennus ja Adaptive Audio. H2-siru, räätälöity äänenlaatu ja täydellinen Apple-integraatio. USB-C-lataus.",
            "short_description": "ANC in-ear kuulokkeet USB-C:llä",
            "price": Decimal("279.00"),
            "stock": 50,
            "specifications": {
                "Tyyppi": "In-ear, langaton",
                "ANC": "Aktiivinen melunvaimennus",
                "Siru": "Apple H2",
                "Akunkesto": "6h (ANC päällä), 30h kotelolla",
                "Ominaisuudet": "Adaptive Audio, Personalized Spatial Audio",
                "Lataus": "USB-C, MagSafe, Qi"
            },
            "images": [
                "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
            ],
        },

        # Kodinkoneet
        {
            "name": "Miele WCG 670 WCS Pyykinpesukone 9kg",
            "slug": "miele-wcg-670-wcs",
            "sku": "MIELE-WCG670-001",
            "category": "Pyykinpesukoneet",
            "description": "Laadukas ja hiljainen pyykinpesukone. 9kg täyttö, energialuokka A ja CapDosing-annostelu. WiFiConn@ct ja automaattinen pesuainetunnistus.",
            "short_description": "9kg pyykinpesukone A-luokka",
            "price": Decimal("1299.00"),
            "stock": 8,
            "specifications": {
                "Täyttö": "9 kg",
                "Energialuokka": "A",
                "Linkous": "1400 rpm",
                "Melutaso": "47 dB",
                "Ominaisuudet": "CapDosing, WiFiConn@ct, QuickPowerWash",
                "Mitat": "85 x 60 x 64 cm"
            },
            "images": [
                "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800",
            ],
        },
        {
            "name": "Bosch KGN39AXEA Jääkaappipakastin NoFrost",
            "slug": "bosch-kgn39axea",
            "sku": "BOSCH-KGN39-001",
            "category": "Jääkaapit",
            "description": "Tilava ja energiatehokas jääkaappipakastin. NoFrost-tekniikka, VitaFresh Pro -laatikot ja LED-valaistus. Energialuokka A++.",
            "short_description": "NoFrost jääkaappipakastin 366L",
            "price": Decimal("899.00"),
            "stock": 12,
            "specifications": {
                "Tilavuus": "366 litraa (jääkaappi 279L + pakastin 87L)",
                "Energialuokka": "A++",
                "NoFrost": "Kyllä",
                "Ominaisuudet": "VitaFresh Pro, SuperCooling, LED",
                "Melutaso": "36 dB",
                "Mitat": "203 x 60 x 66 cm"
            },
            "images": [
                "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800",
            ],
        },
        {
            "name": "De'Longhi Magnifica S ECAM 22.110.B Espressokone",
            "slug": "delonghi-magnifica-s-ecam-22110b",
            "sku": "DELONGHI-MAGS-001",
            "category": "Kahvinkeittäjät",
            "description": "Automaattinen espressokone integroidulla myllyillä. Cappuccino-vaahdotin, säädettävä kahvinvoimakkuus ja yksinkertainen käyttö.",
            "short_description": "Automaattinen espressokone",
            "price": Decimal("399.00"),
            "compare_at_price": Decimal("499.00"),
            "stock": 22,
            "is_deal": True,
            "specifications": {
                "Tyyppi": "Automaattinen espressokone",
                "Mylly": "Integroitu säröhampaasmylly",
                "Paine": "15 bar",
                "Vesisäiliö": "1.8 litraa",
                "Ominaisuudet": "Cappuccino, säädettävä voimakkuus",
                "Mitat": "43 x 28 x 37 cm"
            },
            "images": [
                "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
            ],
        },
        {
            "name": "iRobot Roomba j7+ Robot-imuri",
            "slug": "irobot-roomba-j7-plus",
            "sku": "IROBOT-J7PLUS-001",
            "category": "Pölynimurit",
            "description": "Älykäs robottiimuri esteentunnistuksella. Clean Base -automaattinen tyhjennysasema, navigointi ja app-ohjaus. Välttelee kaapeleita ja lemmikkijätöksiä.",
            "short_description": "AI-robottiimuri automaattityhjennys",
            "price": Decimal("699.00"),
            "stock": 16,
            "specifications": {
                "Tyyppi": "Robottiimuri",
                "Navigointi": "vSLAM-kamera",
                "Esteentunnistus": "PrecisionVision",
                "Akunkesto": "90 minuuttia",
                "Automaattityhjennys": "Clean Base (60 päivää)",
                "Ohjaus": "iRobot Home app"
            },
            "images": [
                "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800",
            ],
        },

        # Älykoti
        {
            "name": "Philips Hue White and Color Ambiance Starter Kit E27",
            "slug": "philips-hue-starter-kit-e27",
            "sku": "PHILIPS-HUE-SK-001",
            "category": "Älyvalot",
            "description": "Aloituspakkaus älyvaloja. 3 x värillistä lamppua ja Hue Bridge. 16 miljoonaa väriä, ajastimet ja automaatiot. Yhteensopiva Alexa, Google, Apple.",
            "short_description": "Älyvalo-aloituspakkaus 3 lamppua",
            "price": Decimal("149.00"),
            "compare_at_price": Decimal("199.00"),
            "stock": 30,
            "is_deal": True,
            "specifications": {
                "Sisältö": "3x E27 värilamppu, Hue Bridge",
                "Kirkkaus": "800 lumenia",
                "Värit": "16 miljoonaa",
                "Yhteys": "Zigbee, Bluetooth",
                "Yhteensopivuus": "Alexa, Google, HomeKit",
                "Sovellus": "Philips Hue"
            },
            "images": [
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
            ],
        },
        {
            "name": "Google Nest Learning Thermostat",
            "slug": "nest-learning-thermostat",
            "sku": "GOOGLE-NEST-THERMO-001",
            "category": "Termostaatit",
            "description": "Älytermostatti joka oppii mieltymyksesi. Automaattinen lämpötilan säätö, energiansäästö ja etäohjaus. Works with Google Home ja Assistant.",
            "short_description": "Oppiva älytermostatti",
            "price": Decimal("249.00"),
            "stock": 18,
            "specifications": {
                "Tyyppi": "Oppiva termostatti",
                "Näyttö": "Väri-LCD",
                "Anturit": "Lämpötila, kosteus, liike",
                "Ohjaus": "Google Home app",
                "Yhteensopivuus": "Google Assistant",
                "Energiansäästö": "Automaattinen lämpötilan säätö"
            },
            "images": [
                "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400",
            ],
        },
        {
            "name": "Ring Video Doorbell Pro 2",
            "slug": "ring-video-doorbell-pro-2",
            "sku": "RING-VDBP2-001",
            "category": "Turvakamet",
            "description": "Ovikello kameralla ja liikkeentunnistuksella. 1536p HD-video, 3D-liikkeentunnistus ja kaksisuuntainen ääni. Alexa-yhteensopiva.",
            "short_description": "HD-ovikellokamera 1536p",
            "price": Decimal("299.00"),
            "stock": 25,
            "specifications": {
                "Video": "1536p HD",
                "Näkökenttä": "150° vaaka, Head-to-Toe",
                "Liikkeentunnistus": "3D Motion Detection",
                "Ääni": "Kaksisuuntainen",
                "Yövalvonta": "Infrapuna",
                "Yhteensopivuus": "Alexa"
            },
            "images": [
                "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400",
            ],
        },

        # Soundbarit
        {
            "name": "Sonos Arc Soundbar",
            "slug": "sonos-arc-soundbar",
            "sku": "SONOS-ARC-001",
            "category": "Soundbarit",
            "description": "Premium soundbar Dolby Atmos -tuella. 11 kaiutinta, kristallinkirkas ääni ja saumaton integraatio Sonos-ekosysteemiin. Tukee eARC:ia.",
            "short_description": "Dolby Atmos soundbar",
            "price": Decimal("999.00"),
            "stock": 14,
            "is_featured": True,
            "specifications": {
                "Kanavat": "5.0.2 Dolby Atmos",
                "Kaiuttimet": "11 kpl",
                "Yhteys": "HDMI eARC, WiFi, AirPlay 2",
                "Ohjaus": "Sonos app, voice control",
                "Ääniavustajat": "Alexa, Google Assistant",
                "Mitat": "114 x 8.7 x 11.5 cm"
            },
            "images": [
                "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800",
            ],
        },
        {
            "name": "Samsung HW-Q990C Soundbar + Subwoofer + Takakauttauttimet",
            "slug": "samsung-hw-q990c",
            "sku": "SAMS-HWQ990C-001",
            "category": "Soundbarit",
            "description": "Täysi 11.1.4 kanavainen soundbar-järjestelmä. Dolby Atmos ja DTS:X, langaton subwoofer ja takakauttauttimet. Q-Symphony Samsung TV:iden kanssa.",
            "short_description": "11.1.4 soundbar-järjestelmä",
            "price": Decimal("1299.00"),
            "compare_at_price": Decimal("1599.00"),
            "stock": 10,
            "is_deal": True,
            "specifications": {
                "Kanavat": "11.1.4 Dolby Atmos & DTS:X",
                "Teho": "656W",
                "Sisältö": "Soundbar, langaton subwoofer, 2x takakaiutin",
                "Yhteys": "HDMI eARC, Bluetooth, WiFi",
                "Ominaisuudet": "Q-Symphony, SpaceFit Sound",
                "Korkeus": "Ylöspäin suunnatut kaiuttimet"
            },
            "images": [
                "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800",
            ],
        },
    ]

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
            key_features=prod_data.get("key_features"),
            brand=prod_data.get("brand"),
            warranty_months=prod_data.get("warranty_months"),
            weight_kg=prod_data.get("weight_kg"),
            delivery_time_days=prod_data.get("delivery_time_days", "1-3 päivää"),
            rating_average=prod_data.get("rating_average", Decimal("4.5")),
            rating_count=prod_data.get("rating_count", 0),
            is_active=True,
            is_featured=prod_data.get("is_featured", False),
            is_deal=prod_data.get("is_deal", False),
        )
        db.add(product)
        db.flush()

        # Add images
        for idx, img_url in enumerate(prod_data["images"]):
            image = ProductImage(
                product_id=product.id,
                image_url=img_url,
                alt_text=prod_data["name"],
                display_order=idx,
                is_primary=(idx == 0),
            )
            db.add(image)

    db.commit()
    print(f"✓ Created {len(products_data)} products with images")


def create_coupons(db: Session) -> None:
    """Create demo coupons."""
    coupons_data = [
        {
            "code": "TERVETULOA10",
            "description": "10% alennus uusille asiakkaille",
            "discount_type": DiscountType.PERCENTAGE,
            "discount_value": Decimal("10.00"),
            "valid_from": datetime.utcnow(),
            "valid_until": datetime.utcnow() + timedelta(days=90),
        },
        {
            "code": "KESA2024",
            "description": "Kesäale - 20% alennus",
            "discount_type": DiscountType.PERCENTAGE,
            "discount_value": Decimal("20.00"),
            "valid_from": datetime.utcnow(),
            "valid_until": datetime.utcnow() + timedelta(days=60),
        },
        {
            "code": "ILMAINENTOIMITUS",
            "description": "Ilmainen toimitus kaikille tilauksille",
            "discount_type": DiscountType.FREE_SHIPPING,
            "discount_value": Decimal("0.00"),
            "valid_from": datetime.utcnow(),
            "valid_until": datetime.utcnow() + timedelta(days=30),
        },
        {
            "code": "TECH50",
            "description": "50€ alennus elektroniikasta",
            "discount_type": DiscountType.FIXED_AMOUNT,
            "discount_value": Decimal("50.00"),
            "valid_from": datetime.utcnow(),
            "valid_until": datetime.utcnow() + timedelta(days=45),
        },
    ]

    for coupon_data in coupons_data:
        coupon = Coupon(**coupon_data)
        db.add(coupon)

    db.commit()
    print(f"✓ Created {len(coupons_data)} coupons")


def seed_database() -> None:
    """Seed the database with Verkkokauppa-style demo data."""
    db = SessionLocal()
    try:
        print("\n=== Seeding database with Verkkokauppa-style data ===\n")

        print("Clearing existing data...")
        clear_data(db)

        print("\nCreating users...")
        create_users(db)

        print("\nCreating categories...")
        category_map = create_categories(db)

        print("\nCreating products...")
        create_products(db, category_map)

        print("\nCreating coupons...")
        create_coupons(db)

        print("\n=== Database seeding completed successfully ===\n")
        print("Demo data created:")
        print("  - 1 Admin user (admin@example.com / admin123)")
        print("  - 5 Customer users (customer1-5@example.com / password123)")
        print("  - 33 Categories (8 main + 25 subcategories)")
        print("  - 30+ Products with images")
        print("  - 4 Coupons")
        print("")
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
