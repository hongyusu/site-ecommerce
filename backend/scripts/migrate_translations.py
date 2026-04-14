"""Migrate existing product and category content to translation fields."""

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.product import Product


def migrate_product_translations(db: Session) -> None:
    """Migrate existing product content to translation fields."""
    products = db.query(Product).all()

    migrated_count = 0
    for product in products:
        # Skip if already migrated (translation field is not None)
        if product.name_translations is not None:
            continue

        # Create translation dictionaries from existing content
        # Use existing content as placeholder for all three languages
        product.name_translations = {
            "en": product.name,
            "fi": product.name,
            "sv": product.name,
        }

        product.description_translations = {
            "en": product.description or "",
            "fi": product.description or "",
            "sv": product.description or "",
        }

        product.short_description_translations = {
            "en": product.short_description or "",
            "fi": product.short_description or "",
            "sv": product.short_description or "",
        }

        migrated_count += 1

    db.commit()
    print(f"✓ Migrated {migrated_count} products to use translation fields")


def migrate_category_translations(db: Session) -> None:
    """Migrate existing category content to translation fields."""
    categories = db.query(Category).all()

    migrated_count = 0
    for category in categories:
        # Skip if already migrated (translation field is not None)
        if category.name_translations is not None:
            continue

        # Create translation dictionaries from existing content
        # Use existing content as placeholder for all three languages
        category.name_translations = {
            "en": category.name,
            "fi": category.name,
            "sv": category.name,
        }

        category.description_translations = {
            "en": category.description or "",
            "fi": category.description or "",
            "sv": category.description or "",
        }

        migrated_count += 1

    db.commit()
    print(f"✓ Migrated {migrated_count} categories to use translation fields")


def main() -> None:
    """Run the migration."""
    print("Starting translation data migration...")
    print("This will populate translation fields with existing content as placeholders.")
    print()

    db = SessionLocal()
    try:
        migrate_product_translations(db)
        migrate_category_translations(db)
        print()
        print("✓ Translation migration completed successfully!")
        print()
        print("Note: All locales (en, fi, sv) currently have the same content.")
        print("You can update translations later to provide localized versions.")
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
