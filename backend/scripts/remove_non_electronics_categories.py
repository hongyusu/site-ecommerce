"""Remove non-electronics categories from the database."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.category import Category


def remove_non_electronics_categories():
    """Remove non-electronics categories."""
    db = SessionLocal()

    try:
        # Categories to remove (by name)
        non_electronics = [
            "Fashion & Accessories",
            "Home & Garden",
            "Beauty & Health",
            "Books & Media",
            "Toys & Kids",
            "Automotive",
            "Sports & Outdoors",
        ]

        print("Removing non-electronics categories...")

        for category_name in non_electronics:
            # Find the main category
            category = db.query(Category).filter(Category.name == category_name).first()
            if category:
                # Delete all subcategories first
                subcategories = db.query(Category).filter(Category.parent_id == category.id).all()
                for subcat in subcategories:
                    print(f"  Deleting subcategory: {subcat.name}")
                    db.delete(subcat)

                # Delete the main category
                print(f"  Deleting main category: {category.name}")
                db.delete(category)

        db.commit()
        print("\n✓ Successfully removed non-electronics categories!")

        # Count remaining categories
        total = db.query(Category).count()
        main = db.query(Category).filter(Category.parent_id.is_(None)).count()
        print(f"Remaining categories: {total} ({main} main categories)")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    remove_non_electronics_categories()
