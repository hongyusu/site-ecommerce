"""Update product images to use simple placeholder URLs."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.product import Product, ProductImage


def fix_images():
    """Update product images to use simple placeholder URLs."""
    db = SessionLocal()

    try:
        print("Updating product images to simple placeholders...")

        products = db.query(Product).all()
        updated_count = 0

        for product in products:
            if not product.images or len(product.images) == 0:
                # Create new image with product ID
                new_url = f'https://placehold.co/800x800/2c3e50/ffffff/png?text=Product+{product.id}'
                new_image = ProductImage(
                    product_id=product.id,
                    image_url=new_url,
                    alt_text=product.name,
                    display_order=0,
                    is_primary=True
                )
                db.add(new_image)
                updated_count += 1
                print(f"  Added image for: {product.name[:40]}...")
            else:
                # Update existing image to use product ID
                new_url = f'https://placehold.co/800x800/2c3e50/ffffff/png?text=Product+{product.id}'
                product.images[0].image_url = new_url
                updated_count += 1
                print(f"  Updated: {product.name[:40]}...")

        db.commit()
        print(f"\n✓ Successfully updated {updated_count} products with simple image URLs!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    fix_images()
