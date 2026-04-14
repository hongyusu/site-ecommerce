"""Add more products with translations to the database."""

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
    """Add more products with translations."""
    db = SessionLocal()

    try:
        # Get category IDs
        categories = {
            cat.slug: cat.id
            for cat in db.query(Category).all()
        }

        # Check if products already exist
        existing = db.query(Product).filter(Product.sku == "YOGA-MAT-001").first()
        if existing:
            print("Products already exist. Skipping...")
            return

        print("Adding new products with translations...")
        added = 0

        # Sports & Outdoors Products
        if "fitness-equipment" in categories:
            create_product(
                db,
                "Yoga Mat Premium",
                "Joogamatto Premium",
                "Yogamatta Premium",
                "yoga-mat-premium",
                "Non-slip yoga mat with extra cushioning",
                "Liukumaton joogamatto pehmusteella",
                "Halkfri yogamatta med extra dämpning",
                "Premium quality yoga mat with 6mm thickness, perfect for all yoga styles. Made from eco-friendly TPE material, providing excellent grip and cushioning. Lightweight and portable with carrying strap included.",
                "Laadukas joogamatto 6mm paksuudella, sopii kaikille joogalajeille. Valmistettu ympäristöystävällisestä TPE-materiaalista, tarjoaa erinomaisen pidon ja pehmusteen. Kevyt ja kannettava kantohihnalla.",
                "Högkvalitativ yogamatta med 6 mm tjocklek, perfekt för alla yogastilar. Tillverkad av miljövänligt TPE-material, ger utmärkt grepp och dämpning. Lätt och bärbar med bärrem medföljande.",
                34.99,
                49.99,
                categories["fitness-equipment"],
                "YOGA-MAT-001",
                100,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
            )
            added += 1

            create_product(
                db,
                "Adjustable Dumbbell Set 20kg",
                "Säädettävät Käsipainot 20kg",
                "Justerbara Hantlar 20kg",
                "adjustable-dumbbell-set-20kg",
                "Space-saving adjustable dumbbells",
                "Tilaa säästävät säädettävät käsipainot",
                "Utrymmebesparande justerbara hantlar",
                "Compact adjustable dumbbell set that replaces multiple weights. Quick-select weight adjustment from 2.5kg to 20kg per dumbbell. Durable steel construction with comfortable grip handles. Perfect for home gym setup.",
                "Kompakti säädettävä käsipainosarja, joka korvaa useita painoja. Nopea painon säätö 2,5kg - 20kg per käsipaino. Kestävä teräsrakenne mukavilla kahvoilla. Täydellinen kotikuntosalille.",
                "Kompakt justerbar hantelset som ersätter flera vikter. Snabbval viktjustering från 2,5 kg till 20 kg per hantel. Hållbar stålkonstruktion med bekväma grepp. Perfekt för hemmagym.",
                199.99,
                299.99,
                categories["fitness-equipment"],
                "DUMBBELL-20KG",
                30,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
            )
            added += 1

        if "cycling" in categories:
            create_product(
                db,
                "Mountain Bike 29 inch",
                "Maastopyörä 29 tuumaa",
                "Mountainbike 29 tum",
                "mountain-bike-29",
                "All-terrain mountain bike with 21-speed system",
                "Kaikkiin olosuhteisiin sopiva maastopyörä 21-vaihteilla",
                "Terräng mountainbike med 21-växlat system",
                "Professional mountain bike with 29-inch wheels, aluminum frame, and Shimano 21-speed gear system. Front suspension fork with 100mm travel. Mechanical disc brakes for reliable stopping power. Suitable for both trails and urban riding.",
                "Ammattimainen maastopyörä 29 tuuman pyörillä, alumiinirungolla ja Shimano 21-vaihteisella vaihteistolla. Etujousitus 100mm liikematkalla. Mekaaniset levyjarrut luotettavaan jarrutustehoon. Sopii sekä poluille että kaupunkiajoon.",
                "Professionell mountainbike med 29-tums hjul, aluminiumram och Shimano 21-växlat växelsystem. Framfjädring med 100 mm fjädringsväg. Mekaniska skivbromsar för pålitlig bromskraft. Lämplig för både stigar och stadsåkning.",
                599.99,
                799.99,
                categories["cycling"],
                "MTB-29-001",
                15,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800",
            )
            added += 1

        # Fashion Products
        if "mens-fashion" in categories:
            create_product(
                db,
                "Men's Casual Shirt",
                "Miesten Vapaa-ajan Paita",
                "Herrskjorta Casual",
                "mens-casual-shirt",
                "100% cotton comfort fit shirt",
                "100% puuvillaa mukava paita",
                "100% bomull bekväm passform skjorta",
                "Classic casual shirt made from 100% premium cotton. Comfortable regular fit with button-down collar. Available in multiple colors. Perfect for both casual and semi-formal occasions. Machine washable.",
                "Klassinen vapaa-ajan paita valmistettu 100% premium-puuvillasta. Mukava regular fit nappikaulus. Saatavilla useissa väreissä. Täydellinen sekä arkisiin että puolivirallisiin tilaisuuksiin. Konepesu.",
                "Klassisk casual skjorta tillverkad av 100% premium bomull. Bekväm regular fit med knappkrage. Finns i flera färger. Perfekt för både vardagliga och halvformella tillfällen. Maskintvätt.",
                49.99,
                79.99,
                categories["mens-fashion"],
                "SHIRT-M-001",
                80,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
            )
            added += 1

        if "shoes" in categories:
            create_product(
                db,
                "Running Shoes Pro",
                "Juoksukengät Pro",
                "Löparskor Pro",
                "running-shoes-pro",
                "Lightweight performance running shoes",
                "Kevyet juoksukengät suorituskykyyn",
                "Lättviktiga löparskor för prestanda",
                "High-performance running shoes with breathable mesh upper and responsive cushioning. Advanced sole technology provides excellent grip and shock absorption. Lightweight design reduces fatigue. Ideal for both training and racing.",
                "Korkean suorituskyvyn juoksukengät hengittävällä mesh-päällisellä ja reagoivalla pehmusteella. Edistyksellinen pohja tarjoaa erinomaisen pidon ja iskuvaimennuksen. Kevyt design vähentää väsymystä. Sopii sekä harjoitteluun että kilpailuun.",
                "Högpresterande löparskor med andningsbart mesh-överdel och responsiv dämpning. Avancerad solteknik ger utmärkt grepp och stötdämpning. Lätt design minskar trötthet. Idealisk för både träning och tävling.",
                89.99,
                129.99,
                categories["shoes"],
                "SHOES-RUN-001",
                60,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
            )
            added += 1

        # Home & Garden Products
        if "furniture" in categories:
            create_product(
                db,
                "Modern Office Chair",
                "Moderni Toimistotuoli",
                "Modern Kontorsstol",
                "modern-office-chair",
                "Ergonomic office chair with lumbar support",
                "Ergonominen toimistotuoli lannetuella",
                "Ergonomisk kontorsstol med ländrygdsstöd",
                "Premium ergonomic office chair designed for all-day comfort. Features adjustable height, tilt mechanism, and lumbar support. Breathable mesh back and padded seat. 360-degree swivel with smooth-rolling casters. Maximum weight capacity 120kg.",
                "Premium ergonominen toimistotuoli suunniteltu koko päivän mukavuuteen. Säädettävä korkeus, kallistusmekanismi ja lannetuki. Hengittävä mesh-selkänoja ja pehmustettu istuin. 360 asteen pyörivä pehmeillä pyörillä. Maksimikantavuus 120kg.",
                "Premium ergonomisk kontorsstol designad för heldagskomfort. Funktioner justerbara höjd, lutmekanik och ländrygdsstöd. Andningsbar mesh-rygg och vadderad sits. 360-graders svängning med mjukt rullande hjul. Maximal viktkapacitet 120 kg.",
                249.99,
                349.99,
                categories["furniture"],
                "CHAIR-OFF-001",
                40,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800",
            )
            added += 1

        if "lighting" in categories:
            create_product(
                db,
                "LED Desk Lamp Smart",
                "LED Pöytävalaisin Älykäs",
                "LED Skrivbordslampa Smart",
                "led-desk-lamp-smart",
                "Adjustable LED lamp with touch control",
                "Säädettävä LED-lamppu kosketusohjauksella",
                "Justerbar LED-lampa med touchkontroll",
                "Modern LED desk lamp with adjustable brightness and color temperature. Touch-sensitive controls with memory function. Flexible gooseneck design for precise positioning. Eye-friendly LED technology with no flicker. USB charging port included.",
                "Moderni LED pöytävalaisin säädettävällä kirkkaudella ja värilämpötilalla. Kosketusherkät säätimet muistitoiminnolla. Joustava kauladesign tarkkaan asentoon. Silmäystävällinen LED-tekniikka ilman välkettä. USB-latausportti mukana.",
                "Modern LED skrivbordslampa med justerbar ljusstyrka och färgtemperatur. Beröringskänsliga kontroller med minnesfunktion. Flexibel gåshalsdesign för exakt positionering. Ögonvänlig LED-teknik utan flimmer. USB-laddningsport ingår.",
                59.99,
                89.99,
                categories["lighting"],
                "LAMP-DESK-001",
                70,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
            )
            added += 1

        # Beauty & Health Products
        if "skincare" in categories:
            create_product(
                db,
                "Vitamin C Serum",
                "C-vitamiiniseerumi",
                "Vitamin C Serum",
                "vitamin-c-serum",
                "Anti-aging serum with 20% Vitamin C",
                "Ikääntymistä ehkäisevä seerumi 20% C-vitamiinia",
                "Antiåldringsserum med 20% Vitamin C",
                "Professional-grade Vitamin C serum with 20% pure L-ascorbic acid. Brightens skin tone, reduces fine lines, and provides powerful antioxidant protection. Hyaluronic acid for hydration. Suitable for all skin types. Cruelty-free and vegan.",
                "Ammattitason C-vitamiiniseerumi 20% puhdasta L-askorbiinihappoa. Kirkastaa ihonsävyä, vähentää hienojalinjoihin ja tarjoaa voimakkaan antioksidanttisuojan. Hyaluronihappoa kosteuttamiseen. Sopii kaikille ihotyypeille. Eläinystävällinen ja vegaaninen.",
                "Professionell Vitamin C serum med 20% ren L-askorbinsyra. Ljusar upp hudton, minskar fina linjer och ger kraftfullt antioxidantskydd. Hyaluronsyra för återfuktning. Passar alla hudtyper. Djurvänlig och vegansk.",
                34.99,
                49.99,
                categories["skincare"],
                "SERUM-VITC-001",
                90,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
            )
            added += 1

        if "personal-care" in categories:
            create_product(
                db,
                "Electric Toothbrush Pro",
                "Sähköhammasharja Pro",
                "Elektrisk Tandborste Pro",
                "electric-toothbrush-pro",
                "Sonic toothbrush with smart timer",
                "Äänihammasharja älytajuurilla",
                "Sonisk tandborste med smart timer",
                "Advanced sonic toothbrush with 40,000 vibrations per minute. 5 cleaning modes for different needs. Smart 2-minute timer with 30-second intervals. Long battery life up to 4 weeks. Includes 3 brush heads and travel case.",
                "Edistynyt äänihammasharja 40 000 värähtelyllä minuutissa. 5 puhdistustilaa eri tarpeisiin. Älykäs 2 minuutin ajastin 30 sekunnin väliajoin. Pitkä akunkesto jopa 4 viikkoa. Sisältää 3 harjaspäätä ja matkakotelon.",
                "Avancerad sonisk tandborste med 40 000 vibrationer per minut. 5 rengöringslägen för olika behov. Smart 2-minuters timer med 30-sekunders intervaller. Lång batteritid upp till 4 veckor. Inkluderar 3 borsthuvuden och reseväska.",
                79.99,
                119.99,
                categories["personal-care"],
                "BRUSH-ELEC-001",
                50,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800",
            )
            added += 1

        # Books & Media Products
        if "ereaders-accessories" in categories:
            create_product(
                db,
                "E-Reader 6 inch",
                "Lukulaite 6 tuumaa",
                "E-läsare 6 tum",
                "ereader-6-inch",
                "Paperwhite display e-reader with backlight",
                "Paperwhite-näyttö lukulaite taustavalolla",
                "Paperwhite-display e-läsare med bakgrundsbelysning",
                "Premium e-reader with 6-inch paperwhite display and adjustable backlight. 8GB storage holds thousands of books. Weeks of battery life. IPX8 waterproof design. Built-in dictionary and Wi-Fi connectivity. Glare-free reading in any light.",
                "Premium lukulaite 6 tuuman paperwhite-näytöllä ja säädettävällä taustavalolla. 8 GB tallennustila tuhansille kirjoille. Viikkojen akunkesto. IPX8 vedenkestävä. Sisäänrakennettu sanakirja ja Wi-Fi. Häikäisemätön lukeminen kaikessa valossa.",
                "Premium e-läsare med 6-tums paperwhite-display och justerbar bakgrundsbelysning. 8 GB lagring rymmer tusentals böcker. Veckor av batteritid. IPX8 vattentät design. Inbyggd ordbok och Wi-Fi-anslutning. Bländfri läsning i alla ljus.",
                129.99,
                179.99,
                categories["ereaders-accessories"],
                "EREADER-6IN",
                35,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1513001900722-370f803f498d?w=800",
            )
            added += 1

        # Toys & Kids Products
        if "building-sets" in categories:
            create_product(
                db,
                "Building Blocks Set 1000 pieces",
                "Rakennuspalikat 1000 osaa",
                "Byggklossar 1000 delar",
                "building-blocks-1000",
                "Creative building blocks for kids",
                "Luovat rakennuspalikat lapsille",
                "Kreativa byggklossar för barn",
                "Large building blocks set with 1000 colorful pieces. Compatible with major brands. Includes instruction booklet with 20 model ideas. Develops creativity, problem-solving, and fine motor skills. Safe for children 4+ years. Made from non-toxic ABS plastic.",
                "Iso rakennuspalikkasetti 1000 värikkäällä palalla. Yhteensopiva suurten merkkien kanssa. Sisältää ohjekiirjan 20 mallildealla. Kehittää luovuutta, ongelmanratkaisua ja hienomotoriikkaa. Turvallinen lapsille 4+ vuotta. Valmistettu myrkyttömästä ABS-muovista.",
                "Stort byggklossar set med 1000 färgglada delar. Kompatibel med stora märken. Inkluderar instruktionsbok med 20 modellidéer. Utvecklar kreativitet, problemlösning och finmotorik. Säker för barn 4+ år. Tillverkad av giftfri ABS-plast.",
                39.99,
                59.99,
                categories["building-sets"],
                "BLOCKS-1000",
                60,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1558060370-d644479c6c3e?w=800",
            )
            added += 1

        if "board-games-puzzles" in categories:
            create_product(
                db,
                "Strategy Board Game",
                "Strategialautapeli",
                "Strategibrädspel",
                "strategy-board-game",
                "Family board game for 2-6 players",
                "Perheen lautapeli 2-6 pelaajalle",
                "Familjebrädspel för 2-6 spelare",
                "Award-winning strategy board game perfect for family game nights. Plays 2-6 players, ages 10+. Average game time 60-90 minutes. Includes game board, cards, tokens, and rulebook in multiple languages. Develops strategic thinking and social skills.",
                "Palkittu strategialautapeli täydellinen perheen peliiltoihin. Pelaajia 2-6, ikä 10+. Keskimääräinen peliaika 60-90 minuuttia. Sisältää pelilautan, kortit, nappulat ja sääntökirjan useilla kielillä. Kehittää strategista ajattelua ja sosiaalisia taitoja.",
                "Prisbelönt strategibrädspel perfekt för familjens spelkvällar. Spelas 2-6 spelare, ålder 10+. Genomsnittlig speltid 60-90 minuter. Inkluderar spelbräde, kort, marker och regelhäfte på flera språk. Utvecklar strategiskt tänkande och sociala färdigheter.",
                44.99,
                59.99,
                categories["board-games-puzzles"],
                "GAME-STRAT-001",
                45,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800",
            )
            added += 1

        # Automotive Products
        if "car-electronics" in categories:
            create_product(
                db,
                "Dash Cam 1080P",
                "Autokamera 1080P",
                "Bilkamera 1080P",
                "dash-cam-1080p",
                "Full HD dash camera with night vision",
                "Full HD autokamera yönäöllä",
                "Full HD bilkamera med nattläge",
                "High-quality dash cam with 1080P Full HD recording. 170-degree wide-angle lens captures entire road. Advanced night vision with WDR technology. Loop recording with G-sensor. Includes 32GB memory card and suction mount. Easy installation.",
                "Laadukas autokamera 1080P Full HD tallennuksella. 170 asteen laajakulmalinssi kuvaa koko tien. Edistynyt yönäkö WDR-teknologialla. Silmukkakennetallennus G-sensorilla. Sisältää 32 GB muistikortin ja imukupin. Helppo asennus.",
                "Högkvalitativ bilkamera med 1080P Full HD-inspelning. 170-graders vidvinkellinse fångar hela vägen. Avancerad nattvisning med WDR-teknik. Loop-inspelning med G-sensor. Inkluderar 32 GB minneskort och sugkoppsfäste. Enkel installation.",
                89.99,
                129.99,
                categories["car-electronics"],
                "DASHCAM-1080P",
                40,
                is_deal=True,
                image_url="https://images.unsplash.com/photo-1548132057-d9e5fd37d5f5?w=800",
            )
            added += 1

        if "tools-equipment" in categories:
            create_product(
                db,
                "Cordless Drill Set",
                "Akkuporakone Setti",
                "Sladdlös Borrmaskin Set",
                "cordless-drill-set",
                "20V cordless drill with accessories",
                "20V akkuporakone lisätarvikkeilla",
                "20V sladdlös borrmaskin med tillbehör",
                "Powerful 20V cordless drill with 2-speed gearbox. Maximum torque 45Nm. Includes 2 lithium batteries, fast charger, and 40-piece accessory set (drill bits, screwdriver bits). LED work light and belt clip. Ideal for DIY projects and home repairs.",
                "Tehokas 20V akkuporakone 2-vaihteisella vaihteistolla. Maksimivääntö 45Nm. Sisältää 2 litiumakkua, pikalaturin ja 40-osaisen lisävarustesarjan (poranterät, ruuvinväänninterät). LED-työvi valo ja vyöklipsi. Ihanteellinen DIY-projekteihin ja kodin korjauksiin.",
                "Kraftfull 20V sladdlös borrmaskin med 2-växlad växellåda. Maximalt vridmoment 45Nm. Inkluderar 2 litiumbatterier, snabbladdare och 40-delars tillbehörsset (borrbits, skruvmejselbits). LED-arbetslampa och bältesklämma. Idealisk för gör-det-själv-projekt och hemreparationer.",
                149.99,
                229.99,
                categories["tools-equipment"],
                "DRILL-20V-001",
                30,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
            )
            added += 1

        # Add some random ratings to products
        all_products = db.query(Product).filter(Product.rating_average.is_(None)).all()
        for product in random.sample(all_products, min(20, len(all_products))):
            product.rating_average = round(random.uniform(3.5, 5.0), 1)
            product.rating_count = random.randint(10, 200)

        db.commit()
        print(f"✓ Successfully added {added} new products with translations!")

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
