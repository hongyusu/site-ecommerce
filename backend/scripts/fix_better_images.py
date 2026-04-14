"""Update product images to use shortened product names in placeholders."""

import sys
from pathlib import Path
from urllib.parse import quote_plus

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.product import Product


def get_short_name(name: str) -> str:
    """Get a short version of the product name for display."""
    # Take first 3 words or 30 characters, whichever is shorter
    words = name.split()[:3]
    short = ' '.join(words)
    if len(short) > 30:
        short = name[:27] + '...'
    return short


def fix_images():
    """Update product images to use shortened product names."""
    db = SessionLocal()

    try:
        print("Updating product images with shortened names...")

        products = db.query(Product).all()
        updated_count = 0

        for product in products:
            if product.images and len(product.images) > 0:
                short_name = get_short_name(product.name)
                # URL encode the short name
                encoded_name = quote_plus(short_name)
                new_url = f'https://placehold.co/800x800/2c3e50/ffffff/png?text={encoded_name}'
                
                product.images[0].image_url = new_url
                updated_count += 1
                print(f"  Updated: {product.name[:50]} -> {short_name}")

        db.commit()
        print(f"\n✓ Successfully updated {updated_count} products with better image URLs!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    fix_images()
