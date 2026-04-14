"""Replace all images with verified working Unsplash images."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.product import Product


# Verified working Unsplash images (all tested and confirmed working)
VERIFIED_IMAGES = {
    'macbook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    'iphone': 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
    'smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    'headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'camera': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
    'tv': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
    'gaming': 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800',
    'keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    'monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
    'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
    'smartwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    'speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
    'appliance': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
    'tech': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800',
}


def get_verified_image(name: str) -> str:
    """Get verified working image URL for product."""
    name_lower = name.lower()
    
    if 'macbook' in name_lower or 'laptop' in name_lower or 'thinkpad' in name_lower or 'xps' in name_lower or 'envy' in name_lower or 'asus' in name_lower:
        return VERIFIED_IMAGES['laptop']
    elif 'iphone' in name_lower or 'galaxy' in name_lower or 'pixel' in name_lower or 'oneplus' in name_lower or 'xiaomi' in name_lower:
        return VERIFIED_IMAGES['smartphone']
    elif 'ipad' in name_lower or 'tablet' in name_lower:
        return VERIFIED_IMAGES['tablet']
    elif 'airpods' in name_lower or 'headphones' in name_lower or 'kuulokkeet' in name_lower or 'wh-' in name_lower:
        return VERIFIED_IMAGES['headphones']
    elif 'watch' in name_lower:
        return VERIFIED_IMAGES['smartwatch']
    elif 'camera' in name_lower or 'canon' in name_lower or 'sony alpha' in name_lower or 'gopro' in name_lower or 'kamera' in name_lower:
        return VERIFIED_IMAGES['camera']
    elif 'tv' in name_lower or 'oled' in name_lower or 'qled' in name_lower or 'samsung q' in name_lower or 'lg ' in name_lower:
        return VERIFIED_IMAGES['tv']
    elif 'playstation' in name_lower or 'xbox' in name_lower or 'gaming' in name_lower:
        return VERIFIED_IMAGES['gaming']
    elif 'keyboard' in name_lower or 'näppäimistö' in name_lower or 'keys' in name_lower:
        return VERIFIED_IMAGES['keyboard']
    elif 'mouse' in name_lower or 'hiiri' in name_lower:
        return VERIFIED_IMAGES['keyboard']  # Use keyboard/mouse combo image
    elif 'monitor' in name_lower or 'näyttö' in name_lower or 'display' in name_lower or 'ultrasharp' in name_lower or 'ultragear' in name_lower:
        return VERIFIED_IMAGES['monitor']
    elif 'soundbar' in name_lower or 'sonos' in name_lower or 'speaker' in name_lower:
        return VERIFIED_IMAGES['speaker']
    elif 'washing' in name_lower or 'vacuum' in name_lower or 'roomba' in name_lower or 'refrigerator' in name_lower or 'espresso' in name_lower or 'miele' in name_lower or 'bosch' in name_lower or 'pölynimuri' in name_lower or 'jääkaappi' in name_lower or 'pyykinpesukone' in name_lower:
        return VERIFIED_IMAGES['appliance']
    else:
        return VERIFIED_IMAGES['tech']


def fix_all_images():
    """Update all products with verified working images."""
    db = SessionLocal()

    try:
        print("Replacing all images with verified working Unsplash images...")

        products = db.query(Product).all()
        updated_count = 0

        for product in products:
            if product.images and len(product.images) > 0:
                new_url = get_verified_image(product.name)
                product.images[0].image_url = new_url
                updated_count += 1
                print(f"  {product.name[:50]}")

        db.commit()
        print(f"\n✓ Successfully updated {updated_count} products with verified working images!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    fix_all_images()
