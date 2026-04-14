"""Expand database with more products for better coverage."""

from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.product import Product, ProductImage


def add_more_products(db: Session) -> None:
    """Add more products to expand coverage."""
    print("Adding more products...")

    # Get existing categories
    categories = {cat.name: cat.id for cat in db.query(Category).all()}

    additional_products = [
        # More Laptops
        {
            "name": "Dell XPS 13 Plus, i7-1360P, 16GB, 512GB SSD",
            "slug": "dell-xps-13-plus-i7",
            "sku": "DELL-XPS13P-001",
            "category": "Kannettavat tietokoneet",
            "description": "Premium-ultrabook tyylikkäällä muotoilulla. Intel 13. sukupolven prosessori ja upea 13.4\" OLED-näyttö.",
            "short_description": "13.4\" premium ultrabook",
            "price": Decimal("1899.00"),
            "stock": 12,
            "brand": "Dell",
            "warranty_months": 24,
            "weight_kg": Decimal("1.24"),
            "delivery_time_days": "2-4 päivää",
            "rating_average": Decimal("4.6"),
            "rating_count": 0,
            "key_features": [
                "Intel Core i7-1360P (13. sukupolvi)",
                "16 GB LPDDR5 RAM",
                "512 GB NVMe SSD",
                "13.4\" FHD+ OLED kosketusnäyttö",
                "Thunderbolt 4 -portit",
                "Alumiinirunko"
            ],
            "specifications": {
                "Suoritin": "Intel Core i7-1360P",
                "RAM": "16GB LPDDR5",
                "Tallennustila": "512GB NVMe SSD",
                "Näyttö": "13.4\" FHD+ OLED",
                "Paino": "1.24 kg"
            },
            "images": [
                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
            ],
        },
        {
            "name": "HP Envy x360 15, Ryzen 7 7730U, 16GB, 1TB SSD",
            "slug": "hp-envy-x360-15-ryzen7",
            "sku": "HP-ENVY-X360-001",
            "category": "Kannettavat tietokoneet",
            "description": "Monipuolinen 2-in-1 kannettava kosketusnäytöllä. Käännettävä rakenne mahdollistaa käytön tablet-tilassa.",
            "short_description": "15.6\" 2-in-1 kosketusnäyttö",
            "price": Decimal("1149.00"),
            "stock": 18,
            "brand": "HP",
            "warranty_months": 12,
            "weight_kg": Decimal("1.74"),
            "is_deal": True,
            "key_features": [
                "AMD Ryzen 7 7730U",
                "16 GB DDR4 RAM",
                "1 TB SSD",
                "15.6\" FHD kosketusnäyttö",
                "360° käännettävä rakenne",
                "Sormenjälkitunnistin"
            ],
            "specifications": {
                "Suoritin": "AMD Ryzen 7 7730U",
                "RAM": "16GB DDR4",
                "Tallennustila": "1TB SSD",
                "Näyttö": "15.6\" FHD Touch",
                "Paino": "1.74 kg"
            },
            "images": [
                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
            ],
        },
        # More Phones
        {
            "name": "OnePlus 12 256GB",
            "slug": "oneplus-12-256gb",
            "sku": "OP12-256-001",
            "category": "Älypuhelimet",
            "description": "Flagship killer kohtuuhintaan. Snapdragon 8 Gen 3, 50MP Hasselblad-kamera ja 100W pikalataus.",
            "short_description": "6.82\" flagship 100W latauksella",
            "price": Decimal("899.00"),
            "stock": 28,
            "brand": "OnePlus",
            "warranty_months": 24,
            "weight_kg": Decimal("0.220"),
            "is_featured": True,
            "key_features": [
                "Snapdragon 8 Gen 3",
                "12 GB RAM + 256 GB tallennustila",
                "50 MP Hasselblad-kamera",
                "100W SUPERVOOC pikalataus",
                "6.82\" QHD+ 120Hz AMOLED",
                "5400 mAh akku"
            ],
            "specifications": {
                "Suoritin": "Snapdragon 8 Gen 3",
                "RAM": "12GB",
                "Tallennustila": "256GB",
                "Näyttö": "6.82\" QHD+ AMOLED 120Hz",
                "Kamera": "50MP + 48MP + 32MP",
                "Akku": "5400 mAh"
            },
            "images": [
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
            ],
        },
        {
            "name": "Xiaomi 14 Pro 512GB",
            "slug": "xiaomi-14-pro-512gb",
            "sku": "XM14P-512-001",
            "category": "Älypuhelimet",
            "description": "Leica-kamerat ja Snapdragon 8 Gen 3. Upea LTPO-näyttö ja 120W HyperCharge.",
            "short_description": "6.73\" Leica-kamerat",
            "price": Decimal("1199.00"),
            "stock": 15,
            "brand": "Xiaomi",
            "warranty_months": 24,
            "weight_kg": Decimal("0.223"),
            "key_features": [
                "Snapdragon 8 Gen 3",
                "16 GB RAM + 512 GB tallennustila",
                "Leica kamerat 50MP + 50MP + 50MP",
                "120W HyperCharge",
                "6.73\" LTPO AMOLED 120Hz",
                "Harman Kardon audio"
            ],
            "specifications": {
                "Suoritin": "Snapdragon 8 Gen 3",
                "RAM": "16GB",
                "Tallennustila": "512GB",
                "Näyttö": "6.73\" LTPO AMOLED",
                "Kamera": "Leica 50MP Triple"
            },
            "images": [
                "https://images.unsplash.com/photo-1592286927505-b0a1e2557a0c?w=800",
            ],
        },
        # TVs
        {
            "name": "Samsung 65\" QN95C Neo QLED 4K Smart TV",
            "slug": "samsung-65-qn95c-neo-qled",
            "sku": "SAM-QN95C-65-001",
            "category": "Televisiot",
            "description": "Huippuluokan Neo QLED-televisio. Quantum Matrix-teknologia ja Neural Quantum -prosessori 4K AI-skaalautuksella.",
            "short_description": "65\" Neo QLED 4K 144Hz",
            "price": Decimal("2499.00"),
            "compare_at_price": Decimal("2999.00"),
            "stock": 8,
            "brand": "Samsung",
            "warranty_months": 24,
            "weight_kg": Decimal("26.5"),
            "is_deal": True,
            "key_features": [
                "65\" Neo QLED 4K -näyttö",
                "Quantum Matrix -teknologia",
                "144Hz virkistystaajuus",
                "Neural Quantum Processor 4K",
                "Object Tracking Sound+",
                "Gaming Hub",
                "4x HDMI 2.1"
            ],
            "specifications": {
                "Koko": "65 tuumaa",
                "Resoluutio": "3840x2160 (4K)",
                "Panel": "Neo QLED",
                "Virkistystaajuus": "144Hz",
                "HDR": "HDR10+, HLG",
                "Ääni": "60W 4.2.2ch"
            },
            "images": [
                "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800",
            ],
        },
        {
            "name": "LG 55\" OLED C3 4K Smart TV",
            "slug": "lg-55-oled-c3",
            "sku": "LG-C3-55-001",
            "category": "Televisiot",
            "description": "OLED-teknologia täydellisillä mustilla. α9 Gen 6 AI -prosessori ja 120Hz pelaamiseen.",
            "short_description": "55\" OLED 4K 120Hz",
            "price": Decimal("1899.00"),
            "stock": 14,
            "brand": "LG",
            "warranty_months": 24,
            "weight_kg": Decimal("18.9"),
            "is_featured": True,
            "key_features": [
                "55\" OLED evo 4K -näyttö",
                "α9 Gen 6 AI -prosessori",
                "120Hz, HDMI 2.1",
                "Dolby Vision IQ & Atmos",
                "webOS 23",
                "Täydelliset mustat värit",
                "FreeSync Premium & G-SYNC"
            ],
            "specifications": {
                "Koko": "55 tuumaa",
                "Resoluutio": "3840x2160 (4K)",
                "Panel": "OLED evo",
                "Virkistystaajuus": "120Hz",
                "HDR": "Dolby Vision IQ, HDR10, HLG"
            },
            "images": [
                "https://images.unsplash.com/photo-1601944177325-f8867652837f?w=800",
            ],
        },
        # Cameras
        {
            "name": "Sony α7 IV -järjestelmäkamera, runko",
            "slug": "sony-a7-iv-body",
            "sku": "SONY-A7IV-BODY-001",
            "category": "Järjestelmäkamerat",
            "description": "33 MP täyden kennon järjestelmäkamera. Loistava valokuvaus- ja videokamera ammattilaisille ja harrastajille.",
            "short_description": "33MP täysikenno järjestelmäkamera",
            "price": Decimal("2799.00"),
            "stock": 12,
            "brand": "Sony",
            "warranty_months": 24,
            "weight_kg": Decimal("0.658"),
            "is_featured": True,
            "key_features": [
                "33 MP täysikenno CMOS-kenno",
                "4K 60p videokuvaus",
                "693 pisteen AF-järjestelmä",
                "5-akselinen kuvanvakautus",
                "10 kuvaa/s sarjakuvaus",
                "Dual-korttipaikat (SD/CFexpress)"
            ],
            "specifications": {
                "Kenno": "35mm täysikenno CMOS 33MP",
                "Video": "4K 60p 10-bit",
                "AF-pisteet": "693 pistettä",
                "Sarjakuvaus": "10 kuvaa/s",
                "Vakautus": "5-akselinen"
            },
            "images": [
                "https://images.unsplash.com/photo-1606094794371-f9d07cee1b73?w=800",
            ],
        },
        {
            "name": "Canon EOS R6 Mark II -järjestelmäkamera, runko",
            "slug": "canon-eos-r6-mark-ii-body",
            "sku": "CANON-R6II-BODY-001",
            "category": "Järjestelmäkamerat",
            "description": "24 MP täysikenno hybridikamera. Nopea AF ja erinomaiset video-ominaisuudet.",
            "short_description": "24MP täysikenno hybridikamera",
            "price": Decimal("2899.00"),
            "stock": 9,
            "brand": "Canon",
            "warranty_months": 24,
            "weight_kg": Decimal("0.670"),
            "key_features": [
                "24 MP täysikenno CMOS-kenno",
                "4K 60p videokuvaus",
                "Dual Pixel CMOS AF II",
                "8-akselinen kuvanvakautus",
                "40 kuvaa/s sähkösuljin",
                "Dual UHS-II SD-kortit"
            ],
            "specifications": {
                "Kenno": "35mm täysikenno CMOS 24MP",
                "Video": "4K 60p",
                "AF": "Dual Pixel CMOS AF II",
                "Sarjakuvaus": "40 kuvaa/s",
                "Vakautus": "8-akselinen"
            },
            "images": [
                "https://images.unsplash.com/photo-1606604480540-5388290ddb21?w=800",
            ],
        },
        # Audio
        {
            "name": "Sony WH-1000XM5 -kuulokkeet, musta",
            "slug": "sony-wh-1000xm5-black",
            "sku": "SONY-WH1000XM5-BK-001",
            "category": "Kuulokkeet",
            "description": "Huippuluokan melunvaimennuskuulokkeet. Paras äänenvaimennustuotto ja premium-äänenlaatu.",
            "short_description": "Premium ANC-kuulokkeet",
            "price": Decimal("399.00"),
            "stock": 35,
            "brand": "Sony",
            "warranty_months": 24,
            "weight_kg": Decimal("0.250"),
            "is_featured": True,
            "is_deal": True,
            "compare_at_price": Decimal("449.00"),
            "key_features": [
                "Parhaassa luokassaan melunvaimennus",
                "Jopa 30h akunkesto",
                "Hi-Res Audio Wireless",
                "8 mikrofonia selkeään puheluun",
                "Multipoint-yhteys",
                "Pikalataus: 3 min = 3h"
            ],
            "specifications": {
                "Tyyppi": "Over-ear, langaton",
                "ANC": "Kyllä, HD-melunvaimennus",
                "Akunkesto": "30h (ANC päällä)",
                "Yhteys": "Bluetooth 5.2, multipoint",
                "Lataus": "USB-C"
            },
            "images": [
                "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800",
            ],
        },
        {
            "name": "Apple AirPods Pro (2. sukupolvi)",
            "slug": "airpods-pro-2nd-gen",
            "sku": "APPLE-APP2-001",
            "category": "Kuulokkeet",
            "description": "Aktiivinen melunvaimennus ja Adaptive Audio. H2-siru ja personoitu tilaääni.",
            "short_description": "Premium ANC nappikuulokkeet",
            "price": Decimal("279.00"),
            "stock": 45,
            "brand": "Apple",
            "warranty_months": 12,
            "weight_kg": Decimal("0.050"),
            "is_featured": True,
            "key_features": [
                "Aktiivinen melunvaimennus",
                "Adaptive Audio",
                "H2-siru",
                "Personoitu tilaääni",
                "Jopa 6h kuunteluaikaa",
                "MagSafe-lataus",
                "IP54 vesi- ja pölytiiviys"
            ],
            "specifications": {
                "Tyyppi": "In-ear, langaton",
                "ANC": "Kyllä, adaptiivinen",
                "Akunkesto": "6h (30h kotelolla)",
                "Yhteys": "Bluetooth 5.3",
                "Vedenkestävyys": "IP54"
            },
            "images": [
                "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
            ],
        },
        # Gaming
        {
            "name": "PlayStation 5 -pelikonsoli, 1TB",
            "slug": "playstation-5-1tb",
            "sku": "PS5-1TB-001",
            "category": "Pelikonsolit",
            "description": "Uusimman sukupolven pelikonsoli. Ray tracing, 4K 120fps, 3D-audio ja nopea SSD.",
            "short_description": "PS5 pelikonsoli 1TB",
            "price": Decimal("549.00"),
            "stock": 22,
            "brand": "Sony",
            "warranty_months": 12,
            "weight_kg": Decimal("3.9"),
            "is_featured": True,
            "key_features": [
                "Ultra-nopea SSD 1TB",
                "4K 120fps pelaamiseen",
                "Ray tracing -tekniikka",
                "3D-audio Tempest-tekniikalla",
                "DualSense-ohjain haptisella palautteella",
                "Taaksepäin yhteensopiva PS4-pelien kanssa"
            ],
            "specifications": {
                "CPU": "AMD Zen 2, 8 ydintä",
                "GPU": "10.3 TFLOPS AMD RDNA 2",
                "RAM": "16GB GDDR6",
                "Tallennustila": "1TB SSD",
                "Resoluutio": "4K jopa 120fps"
            },
            "images": [
                "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
            ],
        },
        {
            "name": "Xbox Series X -pelikonsoli, 1TB",
            "slug": "xbox-series-x-1tb",
            "sku": "XBSX-1TB-001",
            "category": "Pelikonsolit",
            "description": "Microsoftin tehokkain konsoli. 4K 120fps, Quick Resume, Game Pass-yhteensopiva.",
            "short_description": "Xbox Series X 1TB",
            "price": Decimal("549.00"),
            "stock": 18,
            "brand": "Microsoft",
            "warranty_months": 12,
            "weight_kg": Decimal("4.45"),
            "key_features": [
                "12 TFLOPS AMD RDNA 2 GPU",
                "1TB nopea SSD",
                "4K 120fps pelaamiseen",
                "Quick Resume -ominaisuus",
                "Smart Delivery",
                "Xbox Game Pass -yhteensopiva",
                "Taaksepäin yhteensopivuus"
            ],
            "specifications": {
                "CPU": "AMD Zen 2, 8 ydintä",
                "GPU": "12 TFLOPS AMD RDNA 2",
                "RAM": "16GB GDDR6",
                "Tallennustila": "1TB SSD",
                "Resoluutio": "4K jopa 120fps"
            },
            "images": [
                "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800",
            ],
        },
        # Home Appliances
        {
            "name": "Bosch Serie 6 -astianpesukone, 60cm",
            "slug": "bosch-serie-6-dishwasher-60cm",
            "sku": "BOSCH-DW-S6-60-001",
            "category": "Astianpesukoneet",
            "description": "Hiljainen ja energiatehokas astianpesukone. PerfectDry-tekniikka ja Home Connect.",
            "short_description": "60cm hiljainen astianpesukone",
            "price": Decimal("799.00"),
            "stock": 14,
            "brand": "Bosch",
            "warranty_months": 24,
            "weight_kg": Decimal("47.0"),
            "key_features": [
                "Energialuokka C",
                "44 dB melutaso",
                "13 kattausta",
                "PerfectDry-kuivaus",
                "Home Connect älytoiminnot",
                "6 pesuohjelmaa",
                "TimeLight-näyttö"
            ],
            "specifications": {
                "Leveys": "60 cm",
                "Kapasiteetti": "13 kattausta",
                "Melutaso": "44 dB",
                "Energialuokka": "C",
                "Vesimäärä": "9.5 l"
            },
            "images": [
                "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800",
            ],
        },
        {
            "name": "Miele Complete C3 -pölynimuri",
            "slug": "miele-complete-c3-vacuum",
            "sku": "MIELE-C3-001",
            "category": "Pölynimurit",
            "description": "Premium-pölynimuri erinomaisella imuteholla. HEPA-suodatin ja hiljainen käyttö.",
            "short_description": "Premium pölynimuri HEPA-suodattimella",
            "price": Decimal("449.00"),
            "stock": 16,
            "brand": "Miele",
            "warranty_months": 24,
            "weight_kg": Decimal("7.8"),
            "key_features": [
                "1200W moottori",
                "HEPA AirClean -suodatin",
                "9m toimintasäde",
                "Automaattinen kaapelin rullaus",
                "Hiljainen 72 dB",
                "6-portainen tehonsäätö",
                "Parketti-lattiasuutin"
            ],
            "specifications": {
                "Teho": "1200W",
                "Melutaso": "72 dB",
                "Säiliö": "4.5 l",
                "Toimintasäde": "9 m",
                "Suodatin": "HEPA AirClean"
            },
            "images": [
                "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800",
            ],
        },
    ]

    count = 0
    for prod_data in additional_products:
        category_id = categories.get(prod_data["category"])

        if not category_id:
            print(f"  Skipping {prod_data['name']}: category '{prod_data['category']}' not found")
            continue

        # Check if product already exists by SKU or slug
        existing = db.query(Product).filter(
            (Product.sku == prod_data["sku"]) | (Product.slug == prod_data["slug"])
        ).first()
        if existing:
            print(f"  Skipping {prod_data['name']}: already exists")
            continue

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
            delivery_time_days=prod_data.get("delivery_time_days", "2-4 päivää"),
            rating_average=prod_data.get("rating_average", Decimal("0.00")),
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

        count += 1

    db.commit()
    print(f"✓ Added {count} new products")


def main():
    """Run the expansion seeding."""
    print("=== Expanding database with more products ===\n")

    db = SessionLocal()
    try:
        add_more_products(db)
        print("\n=== Database expansion completed successfully ===")

        # Show stats
        total_products = db.query(Product).count()
        total_categories = db.query(Category).count()
        print(f"\nDatabase now contains:")
        print(f"  - {total_categories} categories")
        print(f"  - {total_products} products")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
