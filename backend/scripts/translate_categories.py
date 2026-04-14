"""Add English and Swedish translations for categories."""

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.category import Category

# Translation mappings
CATEGORY_TRANSLATIONS = {
    # Main categories
    "Tietokoneet ja lisälaitteet": {
        "en": "Computers & Accessories",
        "sv": "Datorer & Tillbehör"
    },
    "Puhelimet ja kellot": {
        "en": "Phones & Watches",
        "sv": "Telefoner & Klockor"
    },
    "TV ja viihde-elektroniikka": {
        "en": "TV & Entertainment Electronics",
        "sv": "TV & Underhållningselektronik"
    },
    "Valokuvaus": {
        "en": "Photography",
        "sv": "Fotografi"
    },
    "Pelit ja viihde": {
        "en": "Gaming & Entertainment",
        "sv": "Spel & Underhållning"
    },
    "Audio": {
        "en": "Audio",
        "sv": "Ljud"
    },
    "Kodinkoneet": {
        "en": "Home Appliances",
        "sv": "Hushållsapparater"
    },
    "Älykoti": {
        "en": "Smart Home",
        "sv": "Smart Hem"
    },
    # Subcategories for Computers
    "Kannettavat tietokoneet": {
        "en": "Laptops",
        "sv": "Bärbara datorer"
    },
    "Pöytäkoneet": {
        "en": "Desktop Computers",
        "sv": "Stationära datorer"
    },
    "Näytöt": {
        "en": "Monitors",
        "sv": "Bildskärmar"
    },
    "Näppäimistöt ja hiiret": {
        "en": "Keyboards & Mice",
        "sv": "Tangentbord & Möss"
    },
    "Verkkotuotteet": {
        "en": "Networking Products",
        "sv": "Nätverksprodukter"
    },
    # Subcategories for Phones
    "Älypuhelimet": {
        "en": "Smartphones",
        "sv": "Smartphones"
    },
    "Älykellot ja aktiivisuusrannekkeet": {
        "en": "Smartwatches & Fitness Trackers",
        "sv": "Smarta klockor & Aktivitetsarmband"
    },
    "Puhelintarvikkeet": {
        "en": "Phone Accessories",
        "sv": "Telefontillbehör"
    },
    # Subcategories for TV
    "Televisiot": {
        "en": "Televisions",
        "sv": "TV-apparater"
    },
    "Projektori": {
        "en": "Projectors",
        "sv": "Projektorer"
    },
    "Mediasoittimet": {
        "en": "Media Players",
        "sv": "Mediaspelare"
    },
    # Subcategories for Photography
    "Kamerat": {
        "en": "Cameras",
        "sv": "Kameror"
    },
    "Objektiivit": {
        "en": "Lenses",
        "sv": "Objektiv"
    },
    "Kameratarvikkeet": {
        "en": "Camera Accessories",
        "sv": "Kameratillbehör"
    },
    # Subcategories for Gaming
    "Pelikonsolit": {
        "en": "Game Consoles",
        "sv": "Spelkonsoler"
    },
    "Videopelit": {
        "en": "Video Games",
        "sv": "Videospel"
    },
    "Pelitarvikkeet": {
        "en": "Gaming Accessories",
        "sv": "Speltillbehör"
    },
    # Audio subcategories
    "Kuulokkeet": {
        "en": "Headphones",
        "sv": "Hörlurar"
    },
    "Kaiuttimet": {
        "en": "Speakers",
        "sv": "Högtalare"
    },
    "Soundbarit": {
        "en": "Soundbars",
        "sv": "Soundbars"
    },
    # Home Appliances
    "Pölynimurit": {
        "en": "Vacuum Cleaners",
        "sv": "Dammsugare"
    },
    "Kahvinkeittäjät": {
        "en": "Coffee Makers",
        "sv": "Kaffebryggare"
    },
    "Mikroaaltouunit": {
        "en": "Microwave Ovens",
        "sv": "Mikrovågsugnar"
    },
    # Smart Home
    "Älyvalot": {
        "en": "Smart Lighting",
        "sv": "Smart Belysning"
    },
    "Älykaiuttimet": {
        "en": "Smart Speakers",
        "sv": "Smarta Högtalare"
    },
    "Kodin turvallisuus": {
        "en": "Home Security",
        "sv": "Hemsäkerhet"
    },
}


def translate_categories(db: Session) -> None:
    """Update category translations from Finnish to English and Swedish."""
    categories = db.query(Category).all()

    translated_count = 0
    for category in categories:
        if not category.name_translations:
            continue

        # Get current Finnish name
        fi_name = category.name_translations.get("fi", category.name)

        # Check if we have translations for this category
        if fi_name in CATEGORY_TRANSLATIONS:
            translations = CATEGORY_TRANSLATIONS[fi_name]

            # Update translations
            category.name_translations = {
                "fi": fi_name,
                "en": translations["en"],
                "sv": translations["sv"],
            }

            # Also update description if it exists
            if category.description_translations:
                fi_desc = category.description_translations.get("fi", "")
                category.description_translations = {
                    "fi": fi_desc,
                    "en": fi_desc,  # Keep same for now
                    "sv": fi_desc,  # Keep same for now
                }

            translated_count += 1
            print(f"✓ Translated: {fi_name} -> {translations['en']}")

    db.commit()
    print(f"\n✓ Successfully translated {translated_count} categories!")


def main() -> None:
    """Run the translation."""
    print("Starting category translation...")
    print()

    db = SessionLocal()
    try:
        translate_categories(db)
    except Exception as e:
        print(f"✗ Translation failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
