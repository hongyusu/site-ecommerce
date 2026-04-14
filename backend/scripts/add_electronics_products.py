"""Add electronics products with translations to the database."""

import random
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.product import Product, ProductImage


def create_product(
    db: Session,
    name_en: str,
    name_fi: str,
    name_sv: str,
    slug: str,
    short_desc_en: str,
    short_desc_fi: str,
    short_desc_sv: str,
    desc_en: str,
    desc_fi: str,
    desc_sv: str,
    price: float,
    compare_price: float | None,
    category_id: int,
    sku: str,
    stock: int = 50,
    is_featured: bool = False,
    is_deal: bool = False,
    image_url: str | None = None,
) -> Product:
    """Create a product with translations."""
    product = Product(
        name=name_en,
        slug=slug,
        short_description=short_desc_en,
        description=desc_en,
        price=price,
        compare_at_price=compare_price,
        category_id=category_id,
        sku=sku,
        stock_quantity=stock,
        is_featured=is_featured,
        is_deal=is_deal,
        is_active=True,
        name_translations={
            "en": name_en,
            "fi": name_fi,
            "sv": name_sv,
        },
        short_description_translations={
            "en": short_desc_en,
            "fi": short_desc_fi,
            "sv": short_desc_sv,
        },
        description_translations={
            "en": desc_en,
            "fi": desc_fi,
            "sv": desc_sv,
        },
    )
    db.add(product)
    db.flush()

    # Add product image if provided
    if image_url:
        image = ProductImage(
            product_id=product.id,
            image_url=image_url,
            alt_text=name_en,
            is_primary=True,
            display_order=1,
        )
        db.add(image)

    return product


def add_products():
    """Add electronics products with translations."""
    db = SessionLocal()

    try:
        # Get category IDs
        categories = {
            cat.slug: cat.id
            for cat in db.query(Category).all()
        }

        print("Adding new electronics products with translations...")
        added = 0

        # Laptops
        if "kannettavat" in categories:
            create_product(
                db,
                "Dell XPS 15 9530",
                "Dell XPS 15 9530",
                "Dell XPS 15 9530",
                "dell-xps-15-9530",
                "15.6\" laptop with Intel Core i7 and RTX 4050",
                "15,6\" kannettava Intel Core i7 ja RTX 4050",
                "15,6\" bärbar dator med Intel Core i7 och RTX 4050",
                "Premium laptop with 15.6\" 3.5K OLED display, Intel Core i7-13700H processor, 16GB DDR5 RAM, 512GB SSD, and NVIDIA GeForce RTX 4050 graphics. Features Thunderbolt 4, Wi-Fi 6E, and precision touchpad. Perfect for creative professionals and power users. Includes Windows 11 Pro.",
                "Premium-kannettava 15,6\" 3.5K OLED-näytöllä, Intel Core i7-13700H-prosessorilla, 16GB DDR5 RAM, 512GB SSD ja NVIDIA GeForce RTX 4050 -näytönohjaimella. Thunderbolt 4, Wi-Fi 6E ja tarkkuuskosketuslevy. Täydellinen luoville ammattilaisille. Sisältää Windows 11 Pro.",
                "Premium bärbar dator med 15,6\" 3.5K OLED-skärm, Intel Core i7-13700H-processor, 16GB DDR5 RAM, 512GB SSD och NVIDIA GeForce RTX 4050-grafik. Funktioner Thunderbolt 4, Wi-Fi 6E och precisionspekplatta. Perfekt för kreativa yrkesmän. Inkluderar Windows 11 Pro.",
                1899.99,
                2299.99,
                categories["kannettavat"],
                "DELL-XPS15-9530",
                15,
                is_featured=True,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
            )
            added += 1

            create_product(
                db,
                "HP Pavilion 14 Plus",
                "HP Pavilion 14 Plus",
                "HP Pavilion 14 Plus",
                "hp-pavilion-14-plus",
                "14\" laptop with AMD Ryzen 5",
                "14\" kannettava AMD Ryzen 5",
                "14\" bärbar med AMD Ryzen 5",
                "Versatile 14\" laptop with Full HD display, AMD Ryzen 5 7530U processor, 8GB RAM, 256GB SSD. Lightweight design at 1.4kg. Long battery life up to 10 hours. Fast charging support. Perfect for students and everyday computing. Includes Windows 11 Home.",
                "Monipuolinen 14\" kannettava Full HD -näytöllä, AMD Ryzen 5 7530U -prosessorilla, 8GB RAM, 256GB SSD. Kevyt 1,4kg. Pitkä akunkesto jopa 10 tuntia. Pikalatausuki. Täydellinen opiskelijoille ja päivittäiseen käyttöön. Sisältää Windows 11 Home.",
                "Mångsidig 14\" bärbar dator med Full HD-skärm, AMD Ryzen 5 7530U-processor, 8GB RAM, 256GB SSD. Lätt design på 1,4 kg. Lång batteritid upp till 10 timmar. Snabbladdningsstöd. Perfekt för studenter och vardaglig datoranvändning. Inkluderar Windows 11 Home.",
                649.99,
                799.99,
                categories["kannettavat"],
                "HP-PAV14-PLUS",
                25,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
            )
            added += 1

            create_product(
                db,
                "ASUS ROG Strix G16",
                "ASUS ROG Strix G16",
                "ASUS ROG Strix G16",
                "asus-rog-strix-g16",
                "16\" gaming laptop with RTX 4060",
                "16\" pelikannettava RTX 4060",
                "16\" speldator med RTX 4060",
                "High-performance gaming laptop with 16\" QHD 165Hz display, Intel Core i7-13650HX, 16GB DDR5 RAM, 1TB SSD, NVIDIA GeForce RTX 4060. RGB keyboard with per-key lighting. Advanced cooling system. Dolby Atmos audio. Wi-Fi 6E. Windows 11 Home.",
                "Korkean suorituskyvyn pelikannettava 16\" QHD 165Hz -näytöllä, Intel Core i7-13650HX, 16GB DDR5 RAM, 1TB SSD, NVIDIA GeForce RTX 4060. RGB-näppäimistö näppäinkohtaisella valaistuksella. Edistynyt jäähdytysjärjestelmä. Dolby Atmos -ääni. Wi-Fi 6E. Windows 11 Home.",
                "Högpresterande speldator med 16\" QHD 165Hz-skärm, Intel Core i7-13650HX, 16GB DDR5 RAM, 1TB SSD, NVIDIA GeForce RTX 4060. RGB-tangentbord med per-nyckelbelysning. Avancerat kylsystem. Dolby Atmos-ljud. Wi-Fi 6E. Windows 11 Home.",
                1599.99,
                1899.99,
                categories["kannettavat"],
                "ASUS-ROG-G16",
                12,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
            )
            added += 1

        # Smartphones
        if "alypuhelimet" in categories:
            create_product(
                db,
                "Samsung Galaxy S24 Ultra 256GB",
                "Samsung Galaxy S24 Ultra 256GB",
                "Samsung Galaxy S24 Ultra 256GB",
                "samsung-s24-ultra-256",
                "6.8\" flagship phone with S Pen",
                "6,8\" lippulaivapuhelin S Pen -kynällä",
                "6,8\" flaggskeppstelefon med S Pen",
                "Premium flagship smartphone with 6.8\" Dynamic AMOLED 2X display (120Hz), Snapdragon 8 Gen 3, 12GB RAM, 256GB storage. Quad camera system with 200MP main sensor. S Pen included. 5000mAh battery with fast charging. IP68 water resistance. 5G connectivity. Android 14.",
                "Premium lippulaivapuhelin 6,8\" Dynamic AMOLED 2X -näytöllä (120Hz), Snapdragon 8 Gen 3, 12GB RAM, 256GB tallennustila. Nelinkertainen kamerajärjestelmä 200MP päasensorilla. S Pen mukana. 5000mAh akku pikalatauksella. IP68 vedenkestävyys. 5G-yhteys. Android 14.",
                "Premium flaggskeppstelefon med 6,8\" Dynamic AMOLED 2X-skärm (120Hz), Snapdragon 8 Gen 3, 12GB RAM, 256GB lagring. Fyrdubbelt kamerasystem med 200MP huvudsensor. S Pen ingår. 5000mAh batteri med snabbladdning. IP68 vattentäthet. 5G-anslutning. Android 14.",
                1299.99,
                1499.99,
                categories["alypuhelimet"],
                "SAMSUNG-S24U-256",
                20,
                is_featured=True,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
            )
            added += 1

            create_product(
                db,
                "Google Pixel 8 Pro 128GB",
                "Google Pixel 8 Pro 128GB",
                "Google Pixel 8 Pro 128GB",
                "google-pixel-8-pro-128",
                "6.7\" phone with Google AI features",
                "6,7\" puhelin Google AI -ominaisuuksilla",
                "6,7\" telefon med Google AI-funktioner",
                "Advanced smartphone with 6.7\" LTPO OLED display (120Hz), Google Tensor G3 chip, 12GB RAM, 128GB storage. Triple camera with advanced AI photography. Magic Eraser, Best Take, and Audio Magic Eraser. 5050mAh battery. IP68 rating. 5G. Pure Android experience with 7 years of updates.",
                "Edistynyt älypuhelin 6,7\" LTPO OLED -näytöllä (120Hz), Google Tensor G3 -sirulla, 12GB RAM, 128GB tallennustila. Kolminkertainen kamera edistyneellä AI-valokuvauksella. Magic Eraser, Best Take ja Audio Magic Eraser. 5050mAh akku. IP68-luokitus. 5G. Puhdas Android-kokemus 7 vuoden päivityksillä.",
                "Avancerad smartphone med 6,7\" LTPO OLED-skärm (120Hz), Google Tensor G3-chip, 12GB RAM, 128GB lagring. Trippelkamera med avancerad AI-fotografi. Magic Eraser, Best Take och Audio Magic Eraser. 5050mAh batteri. IP68-klassning. 5G. Ren Android-upplevelse med 7 års uppdateringar.",
                999.99,
                1199.99,
                categories["alypuhelimet"],
                "GOOGLE-PIX8P-128",
                18,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
            )
            added += 1

            create_product(
                db,
                "OnePlus 12 256GB",
                "OnePlus 12 256GB",
                "OnePlus 12 256GB",
                "oneplus-12-256",
                "6.82\" flagship with 100W charging",
                "6,82\" lippulaiva 100W latauksella",
                "6,82\" flaggskepp med 100W-laddning",
                "Flagship smartphone with 6.82\" AMOLED display (120Hz), Snapdragon 8 Gen 3, 16GB RAM, 256GB storage. Hasselblad triple camera system. 5400mAh battery with 100W SuperVOOC fast charging (0-100% in 26 minutes). In-display fingerprint sensor. 5G. OxygenOS based on Android 14.",
                "Lippulaivapuhelin 6,82\" AMOLED-näytöllä (120Hz), Snapdragon 8 Gen 3, 16GB RAM, 256GB tallennustila. Hasselblad kolminkertainen kamerajärjestelmä. 5400mAh akku 100W SuperVOOC-pikalatauksella (0-100% 26 minuutissa). Näytön sisäinen sormenjälkitunnistin. 5G. OxygenOS Android 14 pohjalta.",
                "Flaggskeppstelefon med 6,82\" AMOLED-skärm (120Hz), Snapdragon 8 Gen 3, 16GB RAM, 256GB lagring. Hasselblad trippelkamerasystem. 5400mAh batteri med 100W SuperVOOC snabbladdning (0-100% på 26 minuter). Fingeravtryckssensor i skärmen. 5G. OxygenOS baserad på Android 14.",
                899.99,
                1099.99,
                categories["alypuhelimet"],
                "ONEPLUS-12-256",
                22,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
            )
            added += 1

        # Tablets - category doesn't exist, skip
        if False and "tablets" in categories:
            create_product(
                db,
                "iPad Air 11-inch M2 256GB",
                "iPad Air 11 tuumaa M2 256GB",
                "iPad Air 11 tum M2 256GB",
                "ipad-air-11-m2-256",
                "11\" tablet with M2 chip",
                "11\" tabletti M2-sirulla",
                "11\" surfplatta med M2-chip",
                "Powerful tablet with 11\" Liquid Retina display, Apple M2 chip, 256GB storage. 12MP front and back cameras. Touch ID. Wi-Fi 6E. All-day battery life. Compatible with Apple Pencil Pro and Magic Keyboard. Perfect for productivity and creativity. iPadOS 17.",
                "Tehokas tabletti 11\" Liquid Retina -näytöllä, Apple M2 -sirulla, 256GB tallennustila. 12MP etu- ja takakamerat. Touch ID. Wi-Fi 6E. Koko päivän akunkesto. Yhteensopiva Apple Pencil Pro ja Magic Keyboard. Täydellinen tuottavuuteen ja luovuuteen. iPadOS 17.",
                "Kraftfull surfplatta med 11\" Liquid Retina-skärm, Apple M2-chip, 256GB lagring. 12MP fram- och bakkameror. Touch ID. Wi-Fi 6E. Heldags batteritid. Kompatibel med Apple Pencil Pro och Magic Keyboard. Perfekt för produktivitet och kreativitet. iPadOS 17.",
                749.99,
                849.99,
                categories["tablets"],
                "IPAD-AIR11-M2-256",
                25,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
            )
            added += 1

            create_product(
                db,
                "Samsung Galaxy Tab S9+ 256GB",
                "Samsung Galaxy Tab S9+ 256GB",
                "Samsung Galaxy Tab S9+ 256GB",
                "samsung-tab-s9-plus-256",
                "12.4\" Android tablet with S Pen",
                "12,4\" Android-tabletti S Pen -kynällä",
                "12,4\" Android-surfplatta med S Pen",
                "Premium Android tablet with 12.4\" Dynamic AMOLED 2X display (120Hz), Snapdragon 8 Gen 2, 12GB RAM, 256GB storage. S Pen included. Quad speakers with Dolby Atmos. 10,090mAh battery. IP68 water resistance. DeX mode for desktop experience. 5G optional. Android 14.",
                "Premium Android-tabletti 12,4\" Dynamic AMOLED 2X -näytöllä (120Hz), Snapdragon 8 Gen 2, 12GB RAM, 256GB tallennustila. S Pen mukana. Neljä kaiutinta Dolby Atmos. 10 090mAh akku. IP68 vedenkestävyys. DeX-tila työpöytäkokemukseen. 5G valinnainen. Android 14.",
                "Premium Android-surfplatta med 12,4\" Dynamic AMOLED 2X-skärm (120Hz), Snapdragon 8 Gen 2, 12GB RAM, 256GB lagring. S Pen ingår. Fyra högtalare med Dolby Atmos. 10 090mAh batteri. IP68 vattentäthet. DeX-läge för skrivbordsupplevelse. 5G valfritt. Android 14.",
                899.99,
                1099.99,
                categories["tablets"],
                "SAMSUNG-TABS9P-256",
                18,
                is_featured=True,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800",
            )
            added += 1

        # Smartwatches
        if "alykellot" in categories:
            create_product(
                db,
                "Apple Watch Series 9 45mm",
                "Apple Watch Series 9 45mm",
                "Apple Watch Series 9 45mm",
                "apple-watch-s9-45",
                "Advanced smartwatch with health features",
                "Edistynyt älykello terveysominaisuuksilla",
                "Avancerad smartklocka med hälsofunktioner",
                "Advanced smartwatch with 45mm Always-On Retina display, S9 SiP chip, double tap gesture. Blood oxygen monitoring, ECG, heart rate tracking, sleep tracking, temperature sensing. Crash Detection and Fall Detection. Water resistant 50m. Up to 18 hours battery. watchOS 10.",
                "Edistynyt älykello 45mm Always-On Retina -näytöllä, S9 SiP -siru, tuplanapaustusele. Veren happiseuranta, EKG, sykeseuranta, uniseuranta, lämpötilatunnistus. Törmäystunnistus ja kaatumisentunnistus. Vedenkestävä 50m. Jopa 18 tunnin akunkesto. watchOS 10.",
                "Avancerad smartklocka med 45mm Always-On Retina-skärm, S9 SiP-chip, dubbeltryck gest. Syremättnadsmätning, EKG, pulsmätning, sömnspårning, temperaturmätning. Krockdetektering och falldetektering. Vattentät 50m. Upp till 18 timmars batteri. watchOS 10.",
                469.99,
                549.99,
                categories["alykellot"],
                "APPLEWATCH-S9-45",
                30,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800",
            )
            added += 1

            create_product(
                db,
                "Samsung Galaxy Watch 6 Classic 47mm",
                "Samsung Galaxy Watch 6 Classic 47mm",
                "Samsung Galaxy Watch 6 Classic 47mm",
                "samsung-watch6c-47",
                "Classic rotating bezel smartwatch",
                "Klassinen pyörivä reunus älykello",
                "Klassisk roterande ram smartklocka",
                "Premium smartwatch with 47mm Super AMOLED display, rotating bezel, Exynos W930, 2GB RAM. Advanced sleep coaching, body composition analysis, heart rate monitoring, ECG, blood pressure. GPS, NFC, LTE optional. 5 ATM + IP68 water resistance. Up to 40 hours battery. Wear OS 4.",
                "Premium älykello 47mm Super AMOLED -näytöllä, pyörivä reunus, Exynos W930, 2GB RAM. Edistynyt univalmennus, kehonkoostumusanalyysi, sykeseuranta, EKG, verenpaine. GPS, NFC, LTE valinnainen. 5 ATM + IP68 vedenkestävyys. Jopa 40 tunnin akunkesto. Wear OS 4.",
                "Premium smartklocka med 47mm Super AMOLED-skärm, roterande ram, Exynos W930, 2GB RAM. Avancerad sömncoachning, kroppssammansättningsanalys, pulsmätning, EKG, blodtryck. GPS, NFC, LTE valfritt. 5 ATM + IP68 vattentäthet. Upp till 40 timmars batteri. Wear OS 4.",
                429.99,
                499.99,
                categories["alykellot"],
                "SAMSUNG-W6C-47",
                25,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
            )
            added += 1

        # TVs
        if "televisiot" in categories:
            create_product(
                db,
                "Samsung Neo QLED 65 inch QN95C",
                "Samsung Neo QLED 65 tuumaa QN95C",
                "Samsung Neo QLED 65 tum QN95C",
                "samsung-qn95c-65",
                "65\" 4K Neo QLED TV with Mini LED",
                "65\" 4K Neo QLED TV Mini LED",
                "65\" 4K Neo QLED TV med Mini LED",
                "Premium 65\" 4K Neo QLED TV with Quantum Matrix Technology and Mini LED backlight. Neural Quantum Processor 4K, 144Hz refresh rate, HDR10+, Dolby Atmos. Anti-reflection screen. Gaming Hub with cloud gaming support. Smart TV with Tizen OS. Object Tracking Sound+. 4x HDMI 2.1.",
                "Premium 65\" 4K Neo QLED TV Quantum Matrix -teknologialla ja Mini LED -taustavalolla. Neural Quantum Processor 4K, 144Hz virkistystaajuus, HDR10+, Dolby Atmos. Heijastamaton näyttö. Gaming Hub pilvi pelihelolla. Smart TV Tizen OS. Object Tracking Sound+. 4x HDMI 2.1.",
                "Premium 65\" 4K Neo QLED TV med Quantum Matrix-teknik och Mini LED-bakgrundsbelysning. Neural Quantum Processor 4K, 144Hz uppdateringsfrekvens, HDR10+, Dolby Atmos. Antireflexskärm. Gaming Hub med molnspelstöd. Smart TV med Tizen OS. Object Tracking Sound+. 4x HDMI 2.1.",
                2499.99,
                2999.99,
                categories["televisiot"],
                "SAMSUNG-QN95C-65",
                10,
                is_featured=True,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
            )
            added += 1

            create_product(
                db,
                "LG OLED C3 55 inch",
                "LG OLED C3 55 tuumaa",
                "LG OLED C3 55 tum",
                "lg-oledc3-55",
                "55\" 4K OLED TV with self-lit pixels",
                "55\" 4K OLED TV itsevalaisevillakikselleillä",
                "55\" 4K OLED TV med självlysande pixlar",
                "Premium 55\" 4K OLED TV with perfect blacks and infinite contrast. α9 AI Processor Gen6, 120Hz refresh rate, Dolby Vision IQ, Dolby Atmos. NVIDIA G-Sync and AMD FreeSync. webOS 23 Smart TV. 4x HDMI 2.1 with eARC. Gallery Design. Perfect for movies and gaming.",
                "Premium 55\" 4K OLED TV täydellisillä mustilla ja äärettömällä kontrastilla. α9 AI Processor Gen6, 120Hz virkistystaajuus, Dolby Vision IQ, Dolby Atmos. NVIDIA G-Sync ja AMD FreeSync. webOS 23 Smart TV. 4x HDMI 2.1 eARC. Gallery Design. Täydellinen elokuville ja pelaamiselle.",
                "Premium 55\" 4K OLED TV med perfekta svarta och oändlig kontrast. α9 AI Processor Gen6, 120Hz uppdateringsfrekvens, Dolby Vision IQ, Dolby Atmos. NVIDIA G-Sync och AMD FreeSync. webOS 23 Smart TV. 4x HDMI 2.1 med eARC. Gallery Design. Perfekt för filmer och spel.",
                1899.99,
                2299.99,
                categories["televisiot"],
                "LG-OLEDC3-55",
                12,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800",
            )
            added += 1

        # Monitors
        if "naytot" in categories:
            create_product(
                db,
                "Dell UltraSharp 27 4K USB-C",
                "Dell UltraSharp 27 4K USB-C",
                "Dell UltraSharp 27 4K USB-C",
                "dell-ultrasharp-27-4k",
                "27\" 4K professional monitor",
                "27\" 4K ammattilaisen näyttö",
                "27\" 4K professionell bildskärm",
                "Professional 27\" 4K IPS monitor (3840x2160), 99% sRGB, 95% DCI-P3 color coverage. USB-C with 90W power delivery, DisplayPort, HDMI. Height, tilt, swivel, pivot adjustable stand. ComfortView Plus technology reduces blue light. Ideal for content creators and professionals.",
                "Ammattilaisen 27\" 4K IPS -näyttö (3840x2160), 99% sRGB, 95% DCI-P3 värien kattavuus. USB-C 90W virransyötöllä, DisplayPort, HDMI. Korkeus, kallistus, käännettävä, pivot-säädettävä jalusta. ComfortView Plus -teknologia vähentää sinistä valoa. Ihanteellinen sisällöntuottajille ja ammattilaisille.",
                "Professionell 27\" 4K IPS-bildskärm (3840x2160), 99% sRGB, 95% DCI-P3 färgtäckning. USB-C med 90W strömförsörjning, DisplayPort, HDMI. Höjd, lutning, svängning, pivot justerbart stativ. ComfortView Plus-teknik minskar blått ljus. Idealisk för innehållsskapare och yrkesmän.",
                599.99,
                749.99,
                categories["naytot"],
                "DELL-U27-4K",
                20,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
            )
            added += 1

            create_product(
                db,
                "ASUS ROG Swift 27 QHD 240Hz",
                "ASUS ROG Swift 27 QHD 240Hz",
                "ASUS ROG Swift 27 QHD 240Hz",
                "asus-rog-swift-27-240",
                "27\" gaming monitor with 240Hz",
                "27\" pelinäyttö 240Hz",
                "27\" spelskärm med 240Hz",
                "Gaming monitor with 27\" QHD Fast IPS panel, 240Hz refresh rate, 1ms response time. NVIDIA G-SYNC Compatible. 95% DCI-P3 color gamut. HDR400. Height, tilt, swivel adjustable ergonomic stand. DisplayPort 1.4, HDMI 2.0. Perfect for competitive gaming and esports.",
                "Pelinäyttö 27\" QHD Fast IPS -paneelilla, 240Hz virkistystaajuus, 1ms vasteaika. NVIDIA G-SYNC -yhteensopiva. 95% DCI-P3 värigamutti. HDR400. Korkeus, kallistus, kääntyvä ergonominen jalusta. DisplayPort 1.4, HDMI 2.0. Täydellinen kilpapelaamiseen ja e-urheiluun.",
                "Spelskärm med 27\" QHD Fast IPS-panel, 240Hz uppdateringsfrekvens, 1ms svarstid. NVIDIA G-SYNC-kompatibel. 95% DCI-P3-färgomfång. HDR400. Höjd, lutning, svängning justerbart ergonomiskt stativ. DisplayPort 1.4, HDMI 2.0. Perfekt för tävlingsspel och e-sport.",
                649.99,
                799.99,
                categories["naytot"],
                "ASUS-ROG-27-240",
                18,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800",
            )
            added += 1

        # Headphones
        if "kuulokkeet" in categories:
            create_product(
                db,
                "Sony WH-1000XM5 Wireless",
                "Sony WH-1000XM5 Langattomat",
                "Sony WH-1000XM5 Trådlösa",
                "sony-wh1000xm5",
                "Premium noise cancelling headphones",
                "Premium melunvaimennuskuulokkeet",
                "Premium brusreducerande hörlurar",
                "Industry-leading noise cancelling headphones with 8 microphones and two processors. 30mm drivers for exceptional sound quality. 30 hours battery with quick charging (3 min = 3 hours). Multipoint connection. Speak-to-Chat. LDAC, DSEE Extreme. Comfortable lightweight design.",
                "Alan johtavat melunvaimentavat kuulokkeet 8 mikrofonilla ja kahdella prosessorilla. 30mm elementit poikkeukselliseen ääenlaatuun. 30 tunnin akku pikalatauksella (3 min = 3 tuntia). Monipisteyhteys. Speak-to-Chat. LDAC, DSEE Extreme. Mukava kevyt muotoilu.",
                "Branschledande brusreducerande hörlurar med 8 mikrofoner och två processorer. 30mm drivenheter för exceptionell ljudkvalitet. 30 timmars batteri med snabbladdning (3 min = 3 timmar). Flerpunktsanslutning. Speak-to-Chat. LDAC, DSEE Extreme. Bekväm lättviktsdesign.",
                349.99,
                419.99,
                categories["kuulokkeet"],
                "SONY-WH1000XM5",
                40,
                is_featured=True,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
            )
            added += 1

            create_product(
                db,
                "Bose QuietComfort Ultra",
                "Bose QuietComfort Ultra",
                "Bose QuietComfort Ultra",
                "bose-qc-ultra",
                "Premium headphones with spatial audio",
                "Premium kuulokkeet tilaäänellä",
                "Premium hörlurar med spatial audio",
                "Premium noise cancelling headphones with CustomTune technology. Immersive spatial audio. Aware Mode with ActiveSense. 24 hours battery life. SimpleSync Bluetooth multipoint. Voice assistant compatible. Luxurious materials and comfort. USB-C charging. Bose Music app support.",
                "Premium melunvaimennuskuulokkeet CustomTune-teknologialla. Immersiivinen tilaääni. Aware Mode ActiveSense. 24 tunnin akunkesto. SimpleSync Bluetooth-monipiste. Ääniavustaja yhteensopiva. Luksusmateriaalit ja mukavuus. USB-C lataus. Bose Music -sovellustuki.",
                "Premium brusreducerande hörlurar med CustomTune-teknik. Immersive spatial audio. Aware Mode med ActiveSense. 24 timmars batteritid. SimpleSync Bluetooth flerpunkt. Röstassistent kompatibel. Lyxiga material och komfort. USB-C-laddning. Bose Music-appstöd.",
                429.99,
                499.99,
                categories["kuulokkeet"],
                "BOSE-QC-ULTRA",
                35,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
            )
            added += 1

        # Gaming Consoles
        if "pelikonsolit" in categories:
            create_product(
                db,
                "PlayStation 5 Slim 1TB",
                "PlayStation 5 Slim 1TB",
                "PlayStation 5 Slim 1TB",
                "ps5-slim-1tb",
                "Next-gen gaming console",
                "Seuraavan sukupolven pelikonsoli",
                "Nästa generations spelkonsol",
                "Next-generation gaming console with custom AMD Zen 2 CPU and RDNA 2 GPU. 1TB SSD for ultra-fast loading. 4K gaming up to 120fps. Ray tracing support. Tempest 3D AudioTech. DualSense wireless controller included. Access to exclusive PS5 games and PS Plus library.",
                "Seuraavan sukupolven pelikonsoli mukautetulla AMD Zen 2 CPU ja RDNA 2 GPU. 1TB SSD ultranop ealle lataukselle. 4K pelaaminen jopa 120fps. Ray tracing -tuki. Tempest 3D AudioTech. DualSense langaton ohjain mukana. Pääsy eksklusiivisiin PS5-peleihin ja PS Plus -kirjastoon.",
                "Nästa generations spelkonsol med anpassad AMD Zen 2 CPU och RDNA 2 GPU. 1TB SSD för ultrasnabb laddning. 4K-spel upp till 120fps. Ray tracing-stöd. Tempest 3D AudioTech. DualSense trådlös kontroller ingår. Tillgång till exklusiva PS5-spel och PS Plus-bibliotek.",
                549.99,
                599.99,
                categories["pelikonsolit"],
                "PS5-SLIM-1TB",
                25,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800",
            )
            added += 1

            create_product(
                db,
                "Xbox Series X 1TB",
                "Xbox Series X 1TB",
                "Xbox Series X 1TB",
                "xbox-series-x-1tb",
                "Most powerful Xbox console",
                "Tehokkain Xbox-konsoli",
                "Mest kraftfulla Xbox-konsolen",
                "Most powerful Xbox console with custom AMD Zen 2 CPU and RDNA 2 GPU. 1TB NVMe SSD. 4K gaming up to 120fps, 8K capable. Hardware-accelerated ray tracing. Quick Resume for multiple games. Xbox Wireless Controller included. Xbox Game Pass compatible. Backward compatible with thousands of games.",
                "Tehokkain Xbox-konsoli mukautetulla AMD Zen 2 CPU ja RDNA 2 GPU. 1TB NVMe SSD. 4K pelaaminen jopa 120fps, 8K-kykyinen. Laitteistokiihdytetty ray tracing. Quick Resume useille peleille. Xbox Wireless Controller mukana. Xbox Game Pass -yhteensopiva. Taaksepäin yhteensopiva tuhansien pelien kanssa.",
                "Mest kraftfulla Xbox-konsolen med anpassad AMD Zen 2 CPU och RDNA 2 GPU. 1TB NVMe SSD. 4K-spel upp till 120fps, 8K-kapabel. Hårdvaruaccelererad ray tracing. Quick Resume för flera spel. Xbox Wireless Controller ingår. Xbox Game Pass-kompatibel. Bakåtkompatibel med tusentals spel.",
                499.99,
                549.99,
                categories["pelikonsolit"],
                "XBOX-X-1TB",
                20,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800",
            )
            added += 1

        # Cameras
        if "jarjestelmakamerat" in categories:
            create_product(
                db,
                "Canon EOS R6 Mark II Body",
                "Canon EOS R6 Mark II Runko",
                "Canon EOS R6 Mark II Body",
                "canon-r6-mkii",
                "24MP full-frame mirrorless camera",
                "24MP täyskenno peiliteön kamera",
                "24MP fullformat spegeliös kamera",
                "Professional full-frame mirrorless camera with 24.2MP sensor. Advanced DIGIC X processor. Up to 40fps continuous shooting. 6K oversampled 4K video. In-body 5-axis image stabilization (8 stops). Dual Pixel CMOS AF II. Weather-sealed magnesium alloy body. Dual card slots (SD UHS-II).",
                "Ammattilaisen täyskennokamera peilittömällä 24,2MP anturilla. Edistynyt DIGIC X -prosessori. Jopa 40fps jatkuva kuvaus. 6K oversampled 4K-video. Rungon sisäinen 5-akselinen kuvanvakautus (8 stoppia). Dual Pixel CMOS AF II. Säänkestävä magnesiumseosrunko. Kaksois korttipaik at (SD UHS-II).",
                "Professionell fullformat spegellös kamera med 24,2MP sensor. Avancerad DIGIC X-processor. Upp till 40fps kontinuerlig fotografering. 6K översamplat 4K-video. In-body 5-axlig bildstabilisering (8 stopp). Dual Pixel CMOS AF II. Vädertätad magnesiumlegering kropp. Dubbla kortplatser (SD UHS-II).",
                2599.99,
                2999.99,
                categories["jarjestelmakamerat"],
                "CANON-R6M2-BODY",
                8,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
            )
            added += 1

            create_product(
                db,
                "Sony Alpha 7 IV Body",
                "Sony Alpha 7 IV Runko",
                "Sony Alpha 7 IV Body",
                "sony-a7iv-body",
                "33MP full-frame hybrid camera",
                "33MP täyskenno hybridi kamera",
                "33MP fullformat hybridkamera",
                "Versatile full-frame hybrid camera with 33MP sensor. BIONZ XR processor. Real-time Eye AF for humans and animals. 4K 60p video with S-Log3. 5-axis in-body stabilization (5.5 stops). 759-point phase detection AF. Weather-sealed body. Dual card slots (CFexpress Type A + SD UHS-II).",
                "Monipuolinen täyskennohybridikamera 33MP anturilla. BIONZ XR -prosessori. Reaaliaikainen Eye AF ihmisille ja eläimille. 4K 60p -video S-Log3. 5-akselinen rungon vakautus (5,5 stoppia). 759-pistän vaiheentunnistus AF. Säänkestävä runko. Kaksois kortipaikat (CFexpress Type A + SD UHS-II).",
                "Mångsidig fullformat hybridkamera med 33MP sensor. BIONZ XR-processor. Realtids Eye AF för människor och djur. 4K 60p video med S-Log3. 5-axlig in-body stabilisering (5,5 stopp). 759-punkts fasdetektering AF. Vädertätad kropp. Dubbla kortplatser (CFexpress Type A + SD UHS-II).",
                2499.99,
                2899.99,
                categories["jarjestelmakamerat"],
                "SONY-A7IV-BODY",
                10,
                is_featured=True,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1606933248010-ef504f450a6c?w=800",
            )
            added += 1

        # Add some random ratings to all new products
        new_products = db.query(Product).filter(Product.rating_average.is_(None)).all()
        for product in new_products:
            product.rating_average = round(random.uniform(4.0, 5.0), 1)
            product.rating_count = random.randint(25, 300)

        db.commit()
        print(f"✓ Successfully added {added} electronics products with translations!")

        # Count products
        total = db.query(Product).count()
        print(f"Total products in database: {total}")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    add_products()
