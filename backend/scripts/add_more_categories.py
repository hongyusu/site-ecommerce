"""Add more categories with translations to the database."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.category import Category


def create_category(
    db: Session,
    name_en: str,
    name_fi: str,
    name_sv: str,
    slug: str,
    description_en: str = "",
    description_fi: str = "",
    description_sv: str = "",
    parent_id: int | None = None,
    image_url: str | None = None,
) -> Category:
    """Create a category with translations."""
    category = Category(
        name=name_en,
        slug=slug,
        description=description_en,
        parent_id=parent_id,
        image_url=image_url,
        name_translations={
            "en": name_en,
            "fi": name_fi,
            "sv": name_sv,
        },
        description_translations={
            "en": description_en,
            "fi": description_fi,
            "sv": description_sv,
        },
    )
    db.add(category)
    db.flush()
    return category


def add_categories():
    """Add more categories with translations."""
    db = SessionLocal()

    try:
        # Check if categories already exist
        existing = db.query(Category).filter(Category.slug == "sports-outdoors").first()
        if existing:
            print("Categories already exist. Skipping...")
            return

        print("Adding new categories with translations...")

        # Sports & Outdoors
        sports = create_category(
            db,
            "Sports & Outdoors",
            "Urheilu & Ulkoilu",
            "Sport & Friluftsliv",
            "sports-outdoors",
            "Everything for active lifestyle",
            "Kaikki aktiiviseen elämäntyyliin",
            "Allt för en aktiv livsstil",
            image_url="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400",
        )

        # Sports subcategories
        create_category(
            db,
            "Fitness Equipment",
            "Kuntoiluvälineet",
            "Träningsutrustning",
            "fitness-equipment",
            parent_id=sports.id,
        )
        create_category(
            db,
            "Running & Jogging",
            "Juoksu",
            "Löpning",
            "running-jogging",
            parent_id=sports.id,
        )
        create_category(
            db,
            "Cycling",
            "Pyöräily",
            "Cykling",
            "cycling",
            parent_id=sports.id,
        )
        create_category(
            db,
            "Outdoor Equipment",
            "Ulkoiluvälineet",
            "Friluftutrustning",
            "outdoor-equipment",
            parent_id=sports.id,
        )
        create_category(
            db,
            "Team Sports",
            "Joukkuelajit",
            "Lagsporter",
            "team-sports",
            parent_id=sports.id,
        )

        # Fashion & Accessories
        fashion = create_category(
            db,
            "Fashion & Accessories",
            "Muoti & Asusteet",
            "Mode & Accessoarer",
            "fashion-accessories",
            "Style and comfort",
            "Tyyliä ja mukavuutta",
            "Stil och komfort",
            image_url="https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
        )

        # Fashion subcategories
        create_category(
            db,
            "Men's Fashion",
            "Miesten Vaatteet",
            "Herrkläder",
            "mens-fashion",
            parent_id=fashion.id,
        )
        create_category(
            db,
            "Women's Fashion",
            "Naisten Vaatteet",
            "Damkläder",
            "womens-fashion",
            parent_id=fashion.id,
        )
        create_category(
            db,
            "Shoes",
            "Kengät",
            "Skor",
            "shoes",
            parent_id=fashion.id,
        )
        create_category(
            db,
            "Bags & Luggage",
            "Laukut & Matkatavarat",
            "Väskor & Resväskor",
            "bags-luggage",
            parent_id=fashion.id,
        )
        create_category(
            db,
            "Watches & Jewelry",
            "Kellot & Korut",
            "Klockor & Smycken",
            "watches-jewelry",
            parent_id=fashion.id,
        )

        # Home & Garden
        home_garden = create_category(
            db,
            "Home & Garden",
            "Koti & Puutarha",
            "Hem & Trädgård",
            "home-garden",
            "Make your home beautiful",
            "Tee kodistasi kaunis",
            "Gör ditt hem vackert",
            image_url="https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400",
        )

        # Home & Garden subcategories
        create_category(
            db,
            "Furniture",
            "Huonekalut",
            "Möbler",
            "furniture",
            parent_id=home_garden.id,
        )
        create_category(
            db,
            "Home Decor",
            "Sisustus",
            "Heminredning",
            "home-decor",
            parent_id=home_garden.id,
        )
        create_category(
            db,
            "Lighting",
            "Valaistus",
            "Belysning",
            "lighting",
            parent_id=home_garden.id,
        )
        create_category(
            db,
            "Kitchen & Dining",
            "Keittiö & Ruokailu",
            "Kök & Matsal",
            "kitchen-dining",
            parent_id=home_garden.id,
        )
        create_category(
            db,
            "Garden & Outdoor",
            "Puutarha & Ulkotilat",
            "Trädgård & Utomhus",
            "garden-outdoor",
            parent_id=home_garden.id,
        )

        # Beauty & Health
        beauty = create_category(
            db,
            "Beauty & Health",
            "Kauneus & Terveys",
            "Skönhet & Hälsa",
            "beauty-health",
            "Look and feel your best",
            "Näytä ja voi paremmin",
            "Se och må ditt bästa",
            image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
        )

        # Beauty & Health subcategories
        create_category(
            db,
            "Skincare",
            "Ihonhoito",
            "Hudvård",
            "skincare",
            parent_id=beauty.id,
        )
        create_category(
            db,
            "Makeup",
            "Meikki",
            "Smink",
            "makeup",
            parent_id=beauty.id,
        )
        create_category(
            db,
            "Hair Care",
            "Hiustenhoito",
            "Hårvård",
            "hair-care",
            parent_id=beauty.id,
        )
        create_category(
            db,
            "Personal Care",
            "Henkilökohtainen Hygienia",
            "Personlig Vård",
            "personal-care",
            parent_id=beauty.id,
        )
        create_category(
            db,
            "Health & Wellness",
            "Terveys & Hyvinvointi",
            "Hälsa & Välbefinnande",
            "health-wellness",
            parent_id=beauty.id,
        )

        # Books & Media
        books = create_category(
            db,
            "Books & Media",
            "Kirjat & Media",
            "Böcker & Media",
            "books-media",
            "Entertainment and knowledge",
            "Viihdettä ja tietoa",
            "Underhållning och kunskap",
            image_url="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
        )

        # Books & Media subcategories
        create_category(
            db,
            "Books",
            "Kirjat",
            "Böcker",
            "books",
            parent_id=books.id,
        )
        create_category(
            db,
            "E-readers & Accessories",
            "Lukulaitteet & Lisätarvikkeet",
            "E-läsare & Tillbehör",
            "ereaders-accessories",
            parent_id=books.id,
        )
        create_category(
            db,
            "Movies & TV Shows",
            "Elokuvat & TV-sarjat",
            "Filmer & TV-serier",
            "movies-tv",
            parent_id=books.id,
        )
        create_category(
            db,
            "Music",
            "Musiikki",
            "Musik",
            "music",
            parent_id=books.id,
        )

        # Toys & Kids
        toys = create_category(
            db,
            "Toys & Kids",
            "Lelut & Lasten tavarat",
            "Leksaker & Barn",
            "toys-kids",
            "Fun for all ages",
            "Hauskaa kaikille",
            "Roligt för alla åldrar",
            image_url="https://images.unsplash.com/photo-1560582861-45078880e48e?w=400",
        )

        # Toys & Kids subcategories
        create_category(
            db,
            "Action Figures & Dolls",
            "Toimintahahmot & Nuket",
            "Actionfigurer & Dockor",
            "action-figures-dolls",
            parent_id=toys.id,
        )
        create_category(
            db,
            "Building Sets",
            "Rakennussarjat",
            "Byggsatser",
            "building-sets",
            parent_id=toys.id,
        )
        create_category(
            db,
            "Board Games & Puzzles",
            "Lautapelit & Palapelit",
            "Brädspel & Pussel",
            "board-games-puzzles",
            parent_id=toys.id,
        )
        create_category(
            db,
            "Educational Toys",
            "Opetuslelut",
            "Pedagogiska leksaker",
            "educational-toys",
            parent_id=toys.id,
        )
        create_category(
            db,
            "Baby & Toddler",
            "Vauva & Taapero",
            "Baby & Småbarn",
            "baby-toddler",
            parent_id=toys.id,
        )

        # Automotive
        automotive = create_category(
            db,
            "Automotive",
            "Auto & Moottoripyörät",
            "Bil & Motorcykel",
            "automotive",
            "Everything for your vehicle",
            "Kaikki ajoneuvoosi",
            "Allt för ditt fordon",
            image_url="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400",
        )

        # Automotive subcategories
        create_category(
            db,
            "Car Electronics",
            "Autotarvikkeet",
            "Biltillbehör",
            "car-electronics",
            parent_id=automotive.id,
        )
        create_category(
            db,
            "Tools & Equipment",
            "Työkalut & Varusteet",
            "Verktyg & Utrustning",
            "tools-equipment",
            parent_id=automotive.id,
        )
        create_category(
            db,
            "Car Care",
            "Auton Hoito",
            "Bilvård",
            "car-care",
            parent_id=automotive.id,
        )

        db.commit()
        print(f"✓ Successfully added new categories with translations!")

        # Count categories
        total = db.query(Category).count()
        main = db.query(Category).filter(Category.parent_id.is_(None)).count()
        print(f"Total categories: {total} ({main} main categories)")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    add_categories()
